import { describe, expect, it } from 'vitest'
import { createSSRApp } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { createMemoryHistory, createRouter } from 'vue-router'
import CartDrawer from '../../../src/domains/cart/CartDrawer/CartDrawer.vue'
import CartItemCard from '../../../src/domains/cart/CartDrawer/CartItemCard.vue'
import CartSummary from '../../../src/domains/cart/CartDrawer/CartSummary.vue'
import ReviewsPreviewSection from '../../../src/domains/storefront/Home/sections/ReviewsPreviewSection.vue'

const formatPrice = (price) => '$' + Number(price).toFixed(2)
const item = { id: 'treat', name: 'Test Treat', size: '6 oz', price: 18, quantity: 2, variant: { sku: 'TREAT-6' } }

async function render(component, props = {}, context = {}) {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: ['/', '/checkout'].map((path) => ({ path, component: { render: () => null } })),
  })
  await router.push('/')
  return renderToString(createSSRApp(component, props).use(router), context)
}

describe('approved storefront drawer presentation', () => {
  it('keeps the actual size, unit price, line total and distinct action labels', async () => {
    const html = await render(CartItemCard, {
      item, formatPrice,
      getLineTotal: (product) => product.price * product.quantity,
      isAtMax: () => false,
      getSellingModeLabel: () => 'In-stock item',
      getAvailabilityLabel: () => '10 available',
    })
    expect(html).toContain('6 oz')
    expect(html).toContain('TREAT-6')
    expect(html).toContain('$18.00 each')
    expect(html).toContain('$36.00')
    expect(html).toContain('aria-label="Increase quantity of Test Treat, 6 oz"')
    expect(html).toContain('aria-label="Remove Test Treat, 6 oz"')
    expect(html).not.toContain('hover:-translate')
  })

  it('disables increase at the inventory limit while keeping removal available', async () => {
    const html = await render(CartItemCard, {
      item, formatPrice,
      getLineTotal: () => 36, isAtMax: () => true,
      getSellingModeLabel: () => 'In-stock item', getAvailabilityLabel: () => '2 available',
    })
    expect(html).toMatch(/aria-label="Increase quantity[^>]*disabled/)
    expect(html).toContain('Maximum available quantity reached')
    expect(html).toContain('aria-label="Remove Test Treat, 6 oz"')
  })

  it('preserves separate checkout navigation and does not invent finalized totals', async () => {
    const html = await render(CartSummary, { subtotal: 36, itemCount: 2, formatPrice })
    expect(html).toContain('href="/checkout"')
    expect(html).toContain('$36.00')
    expect(html).toContain('Calculated at checkout')
    expect(html).toContain('Continue Shopping')
    expect(html).not.toContain('Free shipping')
  })

  it('renders a labelled right-side dialog, and makes the closed drawer inert', async () => {
    const openContext = {}
    await render(CartDrawer, { isOpen: true, cartItems: [item], subtotal: 36, itemCount: 2 }, openContext)
    expect(openContext.teleports.body).toContain('role="dialog" aria-modal="true"')
    expect(openContext.teleports.body).toContain('max-w-[420px]')
    expect(openContext.teleports.body).toContain('aria-labelledby="cart-title"')
    const closedContext = {}
    await render(CartDrawer, {}, closedContext)
    expect(closedContext.teleports.body).toContain('aria-hidden="true" inert')
    expect(closedContext.teleports.body).not.toContain('aria-modal="true"')
  })

  it('identifies gallery templates instead of claiming customer reviews', async () => {
    const html = await render(ReviewsPreviewSection)
    expect(html).toContain('Illustrative gallery.')
    expect(html).toContain('verified reviews are coming')
    expect((html.match(/<figure/g) || []).length).toBe(2)
  })
})
