import { beforeEach, describe, expect, it, vi } from 'vitest'
import { signCapability, readCapability } from '../../../src/shared/utils/signedCapability.js'
const catalog = vi.hoisted(() => ({ findCheckoutProducts: vi.fn() }))
const services = vi.hoisted(() => ({ previewCheckout: vi.fn(), createCheckout: vi.fn(), fetchCheckoutShippingRates: vi.fn(), fetchCustomerOrderByReference: vi.fn(), getCustomerUserFromRequest: vi.fn() }))
vi.mock('../../../src/domains/checkout/repositories/checkout.repository.js', () => catalog)
vi.mock('../../../src/domains/checkout/services/checkout.service.js', () => services)
vi.mock('../../../src/domains/orders/services/orders.service.js', () => services)
vi.mock('../../../src/domains/auth/services/customerAuth.service.js', () => services)
const { resolveCheckoutItems } = await import('../../../src/domains/checkout/services/checkoutCatalog.service.js')
const { getCheckoutOrderController, createCheckoutController } = await import('../../../src/domains/checkout/controllers/checkout.controller.js')
const product = { id: 'p', name: 'Real treat', image: '/actual.jpg', status: 'ACTIVE', sellingMode: 'INVENTORY_LIMITED', variants: [{ size: '6 oz', price: 1499, inventory: 3, sku: 'REAL-6', isActive: true }, { size: '18 oz', price: 3999, inventory: 5, sku: 'REAL-18', isActive: true }] }
const response = () => { const res = { statusCode: 200, status: vi.fn(code => { res.statusCode = code; return res }), set: vi.fn(() => res), json: vi.fn(value => { res.body = value; return res }) }; return res }
beforeEach(() => { vi.clearAllMocks(); catalog.findCheckoutProducts.mockResolvedValue([product]); services.getCustomerUserFromRequest.mockResolvedValue(null) })
describe('trusted checkout catalog and guest receipt security', () => {
  it('ignores browser price, line total, image and SKU while honoring selected size', async () => {
    const [item] = await resolveCheckoutItems([{ id: 'p', size: '6 oz', quantity: 2, price: .01, lineTotal: .01, variant: { sku: 'FAKE' }, name: 'Spoofed' }])
    expect(item).toMatchObject({ price: 14.99, quantity: 2, name: 'Real treat', sku: 'REAL-6', image: '/actual.jpg' })
    expect((await resolveCheckoutItems([{ id: 'p', size: '18 oz', quantity: 1 }]))[0].price).toBe(39.99)
  })
  it('rejects missing/inactive variants, drafts, invalid quantities and combined overselling', async () => {
    for (const items of [[], [{ id: 'p', size: '9 oz', quantity: 1 }], [{ id: 'p', size: '6 oz', quantity: -1 }], [{ id: 'p', size: '6 oz', quantity: 1.5 }], [{ id: 'p', size: '6 oz', quantity: 2 }, { id: 'p', size: '6 oz', quantity: 2 }]]) await expect(resolveCheckoutItems(items)).rejects.toMatchObject({ statusCode: 400 })
    catalog.findCheckoutProducts.mockResolvedValue([{ ...product, status: 'DRAFT' }])
    await expect(resolveCheckoutItems([{ id: 'p', size: '6 oz', quantity: 1 }])).rejects.toThrow()
  })
  it('allows made-to-order without pretending inventory was reserved', async () => {
    catalog.findCheckoutProducts.mockResolvedValue([{ ...product, sellingMode: 'MADE_TO_ORDER', variants: [{ ...product.variants[0], inventory: 0 }] }])
    expect(await resolveCheckoutItems([{ id: 'p', size: '6 oz', quantity: 2 }])).toHaveLength(1)
  })
  it('rejects forged, expired and wrong-purpose capabilities', () => {
    const proof = signCapability('order-receipt', { reference: 'CE-1' })
    expect(readCapability(proof, 'order-receipt').reference).toBe('CE-1')
    for (const value of [proof + 'x', signCapability('order-receipt', {}, -1), 'junk']) expect(readCapability(value, 'order-receipt')).toBeNull()
    expect(readCapability(proof, 'manual-order-email')).toBeNull()
  })
  it('does not return an anonymous receipt based only on its reference', async () => {
    const res = response()
    await getCheckoutOrderController({ params: { reference: 'CE-1' }, get: () => '' }, res)
    expect(res.statusCode).toBe(404); expect(services.fetchCustomerOrderByReference).not.toHaveBeenCalled()
  })
  it('restricts signed-in receipt lookup to the customer owner', async () => {
    services.getCustomerUserFromRequest.mockResolvedValue({ id: 'customer-1' })
    services.fetchCustomerOrderByReference.mockResolvedValue(null)
    await getCheckoutOrderController({ params: { reference: 'CE-1' }, get: () => '' }, response())
    expect(services.fetchCustomerOrderByReference).toHaveBeenCalledWith('CE-1', { userId: 'customer-1', viewerId: 'customer-1' })
  })
  it('allows the short-lived checkout receipt proof only for its own reference', async () => {
    const proof = signCapability('order-receipt', { reference: 'CE-1' }), res = response()
    services.fetchCustomerOrderByReference.mockResolvedValue({ orderNumber: 'CE-1' })
    await getCheckoutOrderController({ params: { reference: 'CE-1' }, get: () => proof }, res)
    expect(res.statusCode).toBe(200)
    const other = response(); await getCheckoutOrderController({ params: { reference: 'CE-2' }, get: () => proof }, other); expect(other.statusCode).toBe(404)
  })
  it('rejects payment-ID replay without the matching email-bound checkout proof', async () => {
    const body = { stripePaymentIntentId: 'pi_test', customer: { email: 'test@example.com' } }
    for (const checkoutProof of [undefined, signCapability('checkout-payment', { paymentIntentId: 'pi_other', email: body.customer.email }), signCapability('checkout-payment', { paymentIntentId: 'pi_test', email: 'other@example.com' })]) {
      const res = response(); await createCheckoutController({ body: { ...body, checkoutProof } }, res); expect(res.statusCode).toBe(400)
    }
    expect(services.createCheckout).not.toHaveBeenCalled()
    services.createCheckout.mockResolvedValue({ order: { orderNumber: 'CE-1' } })
    const res = response(); await createCheckoutController({ body: { ...body, checkoutProof: signCapability('checkout-payment', { paymentIntentId: 'pi_test', email: body.customer.email }) } }, res)
    expect(res.statusCode).toBe(200); expect(readCapability(res.body.result.receiptAccess, 'order-receipt').reference).toBe('CE-1')
  })
})
