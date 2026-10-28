import { afterEach, describe, expect, it, vi } from 'vitest'
import { createSSRApp, effectScope, nextTick } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { createMemoryHistory, createRouter } from 'vue-router'
import CommerceItemCard from '../../../src/shared/components/CommerceItemCard.vue'
import CartItemCard from '../../../src/domains/cart/CartDrawer/CartItemCard.vue'
import CheckoutOrderSummary from '../../../src/domains/checkout/OrderSummary/CheckoutOrderSummary.vue'
import OrderConfirmationContent from '../../../src/domains/checkout/OrderSuccess/OrderConfirmationContent.vue'
import AccountOrderDetails from '../../../src/domains/account/components/AccountOrderDetails.vue'
import { useCart } from '../../../src/domains/cart/composables/useCart.js'
import { normalizeProduct } from '../../../src/domains/products/mappers/product.mapper.js'
import { mapCommerceItem } from '../../../src/shared/mappers/commerceItem.mapper.js'
import { mediaImageSource } from '../../../src/shared/utils/mediaImage.js'
import { commercePresentation } from '../../../src/domains/storefront/content/commercePresentation.js'
import { mapCustomerOrder } from '../../../../server/src/domains/orders/mappers/orders.mapper.js'

const mediaPath = '/api/media/11111111-1111-4111-8111-111111111111'
const cartItem = { id: 'fixture-product', name: 'Fixture treat', image: mediaPath, size: '6 oz', quantity: 2, price: 14.99 }
const savedItem = { productId: cartItem.id, productName: cartItem.name, productImage: mediaPath, size: '6 oz', quantity: 2, unitPrice: 14.99, lineTotal: 29.98 }
const money = value => '$' + Number(value).toFixed(2)

async function render(component, props) {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: ['/', '/account/orders', '/account/help'].map(path => ({ path, component: { render: () => null } })),
  })
  await router.push('/')
  return renderToString(createSSRApp(component, props).use(router))
}

function summaryProps(item, overrides = {}) {
  return {
    mobileSummaryOpen: true, cartItems: [item], itemCount: 2,
    summarySubtotal: 29.98, summaryDiscount: 0, summaryShipping: 5.99,
    summaryTax: 0, summaryTotal: 35.97,
    isRefreshingCheckoutPreview: false, formatPrice: money, ...overrides,
  }
}

function expectImage(html, image = mediaPath) {
  const images = html.match(/<img\b[^>]*>/g) || []
  expect(images).toHaveLength(1)
  expect(images[0]).toContain(`src="${mediaImageSource(image)}"`)
  expect(images[0]).toContain('alt="Fixture treat"')
  expect(images[0]).toContain('loading="lazy"')
}

afterEach(() => {
  vi.unstubAllGlobals()
  vi.unstubAllEnvs()
})

describe('commerce item product images', () => {
  it('adds the summary monogram without removing campaign/promotion styling or changing other card instances', async () => {
    const html = await render(CheckoutOrderSummary, summaryProps(cartItem, { appliedPromoCode: 'SAVE10', campaigns: [{ id: 'fixture-campaign', productIds: [cartItem.id], beneficiaryName: 'Example partner' }] }))
    expect(html).toContain('commerce-card-monogram')
    expect(html).toContain('commerce-card-giving')
    expect(html).toContain('commerce-card-promo')
    expectImage(html)
    expect(await render(CommerceItemCard, { item: cartItem })).not.toContain('commerce-card-monogram')
  })
  it.each([
    ['cart', cartItem],
    ['saved order', savedItem],
  ])('maps and renders the %s image in the fixed small product frame', async (_label, item) => {
    expect(mapCommerceItem(item)).toMatchObject({ name: 'Fixture treat', image: mediaPath, quantity: 2, unitPrice: 14.99, lineTotal: 29.98 })
    const html = await render(CommerceItemCard, { item })
    expectImage(html)
    expect(html).toContain('h-16 w-16 shrink-0')
  })

  it('prefers the saved product image over any current catalog image', async () => {
    const item = { ...savedItem, image: 'https://catalog.example.test/changed.webp' }
    expect(mapCommerceItem(item).image).toBe(mediaPath)
    expectImage(await render(CommerceItemCard, { item }))
  })

  it('retains the catalog image through selected-variant add, cart storage and checkout', async () => {
    const storage = new Map()
    vi.stubGlobal('localStorage', {
      getItem: key => storage.get(key) ?? null,
      setItem: (key, value) => storage.set(key, value),
    })
    const scope = effectScope()
    try {
      const product = normalizeProduct({
        id: cartItem.id, name: cartItem.name, image: mediaPath,
        status: 'ACTIVE', sellingMode: 'INVENTORY_LIMITED',
        variants: [{ size: '6 oz', price: 1499, inventory: 10, sku: 'FIXTURE-6', isActive: true }],
      })
      const options = { isPurchasable: () => true, getAvailableQuantity: () => 10 }
      const original = scope.run(() => useCart(options))
      original.addToCart(product, '6 oz')
      original.addToCart(product, '6 oz')
      await nextTick()
      expect(JSON.parse(storage.get('doggy-ent-cart'))[0].image).toBe(mediaPath)

      const restored = scope.run(() => useCart(options))
      restored.loadSavedCart()
      const item = restored.cart.value[0]
      expect(item).toMatchObject({ image: mediaPath, size: '6 oz', price: 14.99, quantity: 2 })
      expectImage(await render(CartItemCard, {
        item, isAtMax: () => false, getSellingModeLabel: () => 'In stock',
        getAvailabilityLabel: () => 'Available', formatPrice: money,
      }))
      expectImage(await render(CheckoutOrderSummary, summaryProps(item)))
      expect(restored.subtotal.value).toBe(29.98)
    }
    finally {
      scope.stop()
    }
  })

  it.each([
    ['loading', { isRefreshingCheckoutPreview: true }],
    ['pricing error', { checkoutPreviewError: 'Pricing is unavailable.' }],
  ])('keeps the product image when checkout is in a %s state', async (_label, state) => {
    expectImage(await render(CheckoutOrderSummary, summaryProps(cartItem, state)))
  })

  it.each([
    ['confirmation', OrderConfirmationContent],
    ['account order details', AccountOrderDetails],
  ])('preserves the saved image in the customer projection and %s', async (_label, component) => {
    const order = mapCustomerOrder({
      orderNumber: 'DGE-FIXTURE', status: 'PAID', stripePaymentIntentId: 'pi_fixture',
      createdAt: '2026-10-27T12:00:00Z', customerName: 'Fixture Customer',
      customerEmail: 'fixture@example.test', currency: 'usd',
      subtotal: 29.98, shippingAmount: 5.99, total: 35.97, items: [savedItem],
    })
    expect(order.items[0].productImage).toBe(mediaPath)
    expectImage(await render(component, { order, settings: commercePresentation().confirmation }))
  })

  it.each([
    ['stored thumbnail', mediaPath + '/thumbnail'],
    ['legacy HTTPS photograph', 'https://catalog.example.test/product.webp'],
    ['bundled photograph', '/assets/fixture-product.webp'],
  ])('renders a %s without losing its source', async (_label, image) => {
    expectImage(await render(CommerceItemCard, { item: { ...cartItem, image } }), image)
  })

  it('resolves stored images and thumbnails against the configured API origin', async () => {
    vi.stubEnv('VITE_API_BASE_URL', 'https://api.example.test/')
    vi.stubEnv('VITE_API_URL', '')
    vi.resetModules()
    try {
      const { mediaImageSource: resolve } = await import('../../../src/shared/utils/mediaImage.js')
      expect(resolve(mediaPath)).toBe('https://api.example.test' + mediaPath)
      expect(resolve(mediaPath + '/thumbnail')).toBe('https://api.example.test' + mediaPath + '/thumbnail')
      expect(resolve('https://catalog.example.test/product.webp')).toBe('https://catalog.example.test/product.webp')
      expect(resolve('/assets/fixture-product.webp')).toBe('/assets/fixture-product.webp')
    }
    finally {
      vi.resetModules()
    }
  })

  it.each([
    ['image-less cart fixture', { ...cartItem, image: '' }],
    ['legacy order without an image snapshot', { ...savedItem, productImage: null }],
  ])('uses the package fallback for an %s instead of an empty image request', async (_label, item) => {
    const html = await render(CommerceItemCard, { item })
    expect(html).not.toContain('<img')
    expect(html).toContain('lucide-package')
    expect(html).toContain('Fixture treat')
  })
})
