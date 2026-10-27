import { beforeEach, describe, expect, it, vi } from 'vitest'
const mocks = vi.hoisted(() => ({
  calculateTax: vi.fn(), resolveCheckoutItems: vi.fn(), findOrderByStripePaymentIntentId: vi.fn(),
  validateStripePaymentIntent: vi.fn(), createNewOrder: vi.fn(), previewCampaignDonations: vi.fn(),
  recordCampaignDonationUsage: vi.fn(), validatePromoCode: vi.fn(), recordPromoUsage: vi.fn(), fetchShippoRates: vi.fn(),
}))
vi.mock('../../../src/shared/services/tax.service.js', () => mocks)
vi.mock('../../../src/domains/checkout/services/checkoutCatalog.service.js', () => mocks)
vi.mock('../../../src/domains/orders/repositories/orders.repository.js', () => mocks)
vi.mock('../../../src/domains/orders/services/orders.service.js', () => mocks)
vi.mock('../../../src/domains/payments/services/stripe.payment.js', () => mocks)
vi.mock('../../../src/domains/campaigns/services/campaigns.service.js', () => mocks)
vi.mock('../../../src/domains/promos/services/promos.service.js', () => mocks)
vi.mock('../../../src/domains/shipping/services/shippo.service.js', () => mocks)
import { previewCheckout, createCheckout } from '../../../src/domains/checkout/services/checkout.service.js'

const tax = () => ({ version: 1, provider: 'stripe', status: 'calculated', taxAmount: 1, ratePercent: '10', location: { country: 'US', state: 'CA' }, breakdown: [{ label: 'California', ratePercent: '10', taxAmount: 1, taxableAmount: 10, taxabilityReason: 'standard_rated' }], calculatedAt: '2026-10-27T00:00:00.000Z', calculationId: 'taxcalc_saved', mode: 'sandbox' })
const customer = { firstName: 'Test', lastName: 'Buyer', email: 'buyer@example.invalid', address1: '1 Test Way', city: 'Los Angeles', state: 'CA', zip: '90001', country: 'US' }
const items = [{ id: 'p1', name: 'Test treat', sku: 'SKU1', size: '6 oz', price: 10, quantity: 1 }]
const input = () => ({ customer, cartItems: [{ id: 'p1', size: '6 oz', quantity: 1 }], shipping: { method: 'standard' }, stripePaymentIntentId: 'pi_saved' })
beforeEach(() => {
  vi.resetAllMocks()
  mocks.calculateTax.mockResolvedValue(tax())
  mocks.resolveCheckoutItems.mockResolvedValue(items)
  mocks.findOrderByStripePaymentIntentId.mockResolvedValue(null)
  mocks.previewCampaignDonations.mockResolvedValue([])
  mocks.createNewOrder.mockImplementation(async order => ({ id: 'order_fixture', ...order }))
})

describe('immutable tax finalization', () => {
  it('reuses the signed snapshot without recalculating tax after payment', async () => {
    const preview = await previewCheckout(input(), { includeTaxSnapshot: true })
    mocks.calculateTax.mockRejectedValue(new Error('Must not recalculate paid tax'))
    const result = await createCheckout(input(), { paymentTax: preview.taxSnapshot, expectedQuoteHash: preview.quoteHash })
    expect(mocks.calculateTax).toHaveBeenCalledTimes(1)
    expect(mocks.validateStripePaymentIntent).toHaveBeenCalledWith(expect.objectContaining({ expectedAmount: 16.99, expectedTaxCalculationId: 'taxcalc_saved' }))
    expect(mocks.createNewOrder).toHaveBeenCalledWith(expect.objectContaining({ taxSnapshot: tax(), taxAmount: 1 }), { verifiedCheckout: true })
    expect(result.pricing.taxDetails.taxAmount).toBe(1)
  })

  it('rejects a changed address, shipping method or catalog price without another calculation/order', async () => {
    const preview = await previewCheckout(input(), { includeTaxSnapshot: true })
    for (const value of [
      { ...input(), customer: { ...customer, zip: '90002' } },
      { ...input(), shipping: { method: 'priority' } },
    ]) await expect(createCheckout(value, { paymentTax: preview.taxSnapshot, expectedQuoteHash: preview.quoteHash })).rejects.toMatchObject({ statusCode: 409 })
    mocks.resolveCheckoutItems.mockResolvedValue([{ ...items[0], price: 11 }])
    await expect(createCheckout(input(), { paymentTax: preview.taxSnapshot, expectedQuoteHash: preview.quoteHash })).rejects.toMatchObject({ statusCode: 409 })
    expect(mocks.calculateTax).toHaveBeenCalledTimes(1)
    expect(mocks.validateStripePaymentIntent).not.toHaveBeenCalled()
    expect(mocks.createNewOrder).not.toHaveBeenCalled()
  })

  it('does not accept browser-supplied tax as trusted finalization options', async () => {
    await previewCheckout({ ...input(), taxSnapshot: { taxAmount: 0 }, expectedQuoteHash: 'fake' })
    expect(mocks.calculateTax).toHaveBeenCalledTimes(1)
  })

  it('keeps historical paid-order replay independent of new tax settings', async () => {
    mocks.findOrderByStripePaymentIntentId.mockResolvedValue({ id: 'existing', customerEmail: customer.email, total: 18.59, taxAmount: 1.61 })
    const result = await createCheckout(input(), { paymentTax: tax(), expectedQuoteHash: 'old' })
    expect(result.order.id).toBe('existing')
    expect(mocks.calculateTax).not.toHaveBeenCalled()
    expect(mocks.createNewOrder).not.toHaveBeenCalled()
  })

  it('rejects non-US preview and shipping country before provider work', async () => {
    await expect(previewCheckout({ ...input(), customer: { ...customer, country: 'Canada' } })).rejects.toMatchObject({ statusCode: 400 })
    expect(mocks.calculateTax).not.toHaveBeenCalled()
  })

  it.each(['replacement', 'unavailable'])('rejects an explicit carrier rate that is %s instead of using static shipping', async state => {
    if (state === 'replacement') mocks.fetchShippoRates.mockResolvedValue({ rates: [{ rateId: 'new_rate', code: 'carrier', price: 2 }] })
    else mocks.fetchShippoRates.mockRejectedValue(new Error('Fixture carrier unavailable'))
    const value = { ...input(), shipping: { method: 'carrier', rateId: 'old_rate' } }
    await expect(previewCheckout(value)).rejects.toMatchObject({ statusCode: 409 })
    await expect(createCheckout(value)).rejects.toMatchObject({ statusCode: 409 })
    expect(mocks.calculateTax).not.toHaveBeenCalled()
    expect(mocks.validateStripePaymentIntent).not.toHaveBeenCalled()
    expect(mocks.createNewOrder).not.toHaveBeenCalled()
  })
})
