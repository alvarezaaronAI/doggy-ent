import { beforeEach, describe, expect, it, vi } from 'vitest'
const calls = vi.hoisted(() => ({ createNewOrder: vi.fn(), findOrderByStripePaymentIntentId: vi.fn(), validateStripePaymentIntent: vi.fn(), resolveCheckoutItems: vi.fn() }))
vi.mock('../../../src/domains/orders/services/orders.service.js', () => ({ createNewOrder: calls.createNewOrder }))
vi.mock('../../../src/domains/orders/repositories/orders.repository.js', () => ({ findOrderByStripePaymentIntentId: calls.findOrderByStripePaymentIntentId }))
vi.mock('../../../src/domains/payments/services/stripe.payment.js', () => ({ validateStripePaymentIntent: calls.validateStripePaymentIntent }))
vi.mock('../../../src/domains/checkout/services/checkoutCatalog.service.js', () => ({ resolveCheckoutItems: calls.resolveCheckoutItems }))
vi.mock('../../../src/domains/promos/services/promos.service.js', () => ({ validatePromoCode: vi.fn(), recordPromoUsage: vi.fn() }))
vi.mock('../../../src/domains/campaigns/services/campaigns.service.js', () => ({ previewCampaignDonations: vi.fn().mockResolvedValue([]), recordCampaignDonationUsage: vi.fn() }))
vi.mock('../../../src/shared/services/tax.service.js', () => ({ calculateTax: vi.fn().mockResolvedValue({ taxAmount: 0 }) }))
const { createCheckout } = await import('../../../src/domains/checkout/services/checkout.service.js')
const input = { cartItems: [{ id: 'p', size: '6 oz', quantity: 1, price: .01 }], customer: { firstName: 'Alex', lastName: 'Morgan', email: 'alex@example.test', address1: '123 Example Lane', city: 'Sample City', state: 'CA', zip: '90001', country: 'US' }, shipping: { method: 'standard' }, stripePaymentIntentId: 'pi_fixture', receiptDelivery: { recipient: 'wrong@example.test' } }
beforeEach(() => {
  vi.clearAllMocks(); calls.findOrderByStripePaymentIntentId.mockResolvedValue(null)
  calls.resolveCheckoutItems.mockResolvedValue([{ productId: 'p', name: 'Actual treat', size: '6 oz', sku: 'ACTUAL-6', price: 20, quantity: 1, lineTotal: 20 }])
  calls.validateStripePaymentIntent.mockResolvedValue({ status: 'succeeded' }); calls.createNewOrder.mockResolvedValue({ id: 'order-1', orderNumber: 'CE-FIXTURE' })
})
describe('receipt authorization at payment finalization', () => {
  it('cannot queue an order or receipt when Stripe verification fails', async () => {
    calls.validateStripePaymentIntent.mockRejectedValue(new Error('Payment is not verified'))
    await expect(createCheckout(input)).rejects.toThrow('not verified')
    expect(calls.createNewOrder).not.toHaveBeenCalled()
  })
  it('passes the private verified flag only after Stripe checks and discards client receipt/price data', async () => {
    await createCheckout(input)
    const [data, context] = calls.createNewOrder.mock.calls[0]
    expect(context).toEqual({ verifiedCheckout: true }); expect(data).toMatchObject({ customerEmail: 'alex@example.test', subtotal: 20, items: [{ price: 20, sku: 'ACTUAL-6' }] })
    expect(data).not.toHaveProperty('receiptDelivery')
    expect(calls.validateStripePaymentIntent.mock.invocationCallOrder[0]).toBeLessThan(calls.createNewOrder.mock.invocationCallOrder[0])
  })
  it('returns an existing payment order without creating/queueing a second receipt', async () => {
    const existing = { id: 'order-1', customerEmail: input.customer.email, total: 25.99 }
    calls.findOrderByStripePaymentIntentId.mockResolvedValue(existing)
    expect((await createCheckout(input)).order).toEqual(existing)
    expect(calls.createNewOrder).not.toHaveBeenCalled(); expect(calls.validateStripePaymentIntent).not.toHaveBeenCalled()
  })
})
