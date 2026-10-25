import { describe, expect, it, vi, afterEach } from 'vitest'
import { effectScope, ref } from 'vue'
import { useCart } from '../../../src/domains/cart/composables/useCart.js'
import { useProductVariants } from '../../../src/domains/products/composables/useProductVariants.js'
afterEach(() => vi.unstubAllGlobals())
const product = { id: 'fixture', status: 'active', sellingMode: 'inventory-limited', variants: [{ size: '6 oz', price: 14.99, quantity: 4, stockStatus: 'in-stock' }, { size: '18 oz', price: 39.99, quantity: 2, stockStatus: 'in-stock' }] }
describe('account bag uses the selected variant during catalog loading', () => {
  it('retains the selected snapshot while loading, then respects fresh stock without saving zero', () => {
    vi.stubGlobal('localStorage', { getItem: vi.fn(), setItem: vi.fn() })
    const scope = effectScope(), products = ref([])
    const cart = scope.run(() => useCart({ products, ...useProductVariants() }))
    cart.addToCart(product, '18 oz'); cart.increase(product.id, '18 oz')
    expect(cart.cart.value[0]).toMatchObject({ size: '18 oz', price: 39.99, quantity: 2 })
    cart.increase(product.id, '18 oz'); expect(cart.cart.value[0].quantity).toBe(2)
    products.value = [{ ...product, variants: product.variants.map(variant => ({ ...variant, quantity: 0, stockStatus: 'out-of-stock' })) }]
    cart.increase(product.id, '18 oz'); expect(cart.cart.value[0].quantity).toBe(2)
    scope.stop()
  })
  it('does not allow testing products into the wishlist account bag', () => {
    vi.stubGlobal('localStorage', { getItem: vi.fn(), setItem: vi.fn() })
    const scope = effectScope(), cart = scope.run(() => useCart(useProductVariants()))
    cart.addToCart({ ...product, isTestProduct: true }, '6 oz')
    expect(cart.cart.value).toEqual([]); scope.stop()
  })
  it.each(['made-to-order', 'preorder'])('keeps + working after JSON storage on policy/account pages: %s', sellingMode => {
    const saved = JSON.stringify([{ ...product, sellingMode, size: '18 oz', quantity: 1, availableQuantity: Infinity, price: 39.99, variant: product.variants[1] }])
    vi.stubGlobal('localStorage', { getItem: vi.fn(() => saved), setItem: vi.fn() })
    const scope = effectScope(), cart = scope.run(() => useCart(useProductVariants()))
    cart.loadSavedCart(); expect(cart.cart.value[0].availableQuantity).toBe(0)
    cart.increase(product.id, '18 oz'); expect(cart.cart.value[0]).toMatchObject({ quantity: 2, price: 39.99, size: '18 oz' })
    scope.stop()
  })
})
