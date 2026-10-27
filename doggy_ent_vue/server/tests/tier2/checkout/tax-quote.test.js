import { describe, expect, it, vi, beforeEach } from 'vitest'
import { checkoutQuoteHash } from '../../../src/domains/checkout/utils/checkoutQuote.js'
import { mapPublicTaxDetails, validateTaxSnapshot } from '../../../src/shared/utils/taxSnapshot.js'
import { signCapability } from '../../../src/shared/utils/signedCapability.js'

const mocks = vi.hoisted(() => ({
  previewCheckout: vi.fn(), createCheckout: vi.fn(), fetchCheckoutShippingRates: vi.fn(),
  createStripePaymentIntent: vi.fn(), getCustomerUserFromRequest: vi.fn(), fetchCustomerOrderByReference: vi.fn(),
}))
vi.mock('../../../src/domains/checkout/services/checkout.service.js', () => mocks)
vi.mock('../../../src/domains/payments/services/stripe.payment.js', () => mocks)
vi.mock('../../../src/domains/auth/services/customerAuth.service.js', () => mocks)
vi.mock('../../../src/domains/orders/services/orders.service.js', () => mocks)
vi.mock('../../../src/domains/payments/config/payment.config.js', () => ({ assertPaymentRequestMode: vi.fn() }))
const { createPaymentIntent } = await import('../../../src/domains/payments/controllers/payment.controller.js')
const { createCheckoutController } = await import('../../../src/domains/checkout/controllers/checkout.controller.js')

const customer = { firstName: 'Test', lastName: 'Customer', email: 'test@example.invalid', country: 'US', state: 'CA', zip: '90001', city: 'Los Angeles', address1: '1 Test Street' }
const snapshot = () => ({ version: 1, provider: 'stripe', status: 'calculated', taxAmount: 1, ratePercent: '10', location: { country: 'US', state: 'CA', city: 'Los Angeles' }, breakdown: [{ label: 'California', ratePercent: '10', taxAmount: 1, taxableAmount: 10, taxabilityReason: 'standard_rated' }], calculatedAt: '2026-10-27T00:00:00.000Z', calculationId: 'taxcalc_fixture', mode: 'sandbox' })
const input = () => ({ cartItems: [{ id: 'p1', sku: 'SKU1', size: '6 oz', quantity: 1, price: 10 }], discountAmount: 0, shippingAmount: 0, shipping: { method: 'standard', provider: 'STATIC' }, customer, promoCode: null })
const response = () => { const res = { statusCode: 200, status: vi.fn(code => { res.statusCode = code; return res }), set: vi.fn(() => res), json: vi.fn(body => { res.body = body; return res }) }; return res }

beforeEach(() => { vi.clearAllMocks(); mocks.getCustomerUserFromRequest.mockResolvedValue(null) })

describe('signed tax quote boundary', () => {
  it('binds trusted variants, price, quantity, delivery, discount and destination', () => {
    const base = input(), hash = checkoutQuoteHash(base)
    expect(hash).toMatch(/^[a-f0-9]{64}$/)
    expect(checkoutQuoteHash({ ...base, customer: { ...customer, country: 'United States' } })).toBe(hash)
    for (const other of [
      { ...base, discountAmount: 1 }, { ...base, shippingAmount: 1 },
      { ...base, customer: { ...customer, zip: '90002' } },
      { ...base, cartItems: [{ ...base.cartItems[0], price: 11 }] },
      { ...base, cartItems: [{ ...base.cartItems[0], quantity: 2 }] },
      { ...base, shipping: { ...base.shipping, method: 'pickup' } },
    ]) expect(checkoutQuoteHash(other)).not.toBe(hash)
  })

  it('projects saved tax without private references or arbitrary provider fields', () => {
    const details = mapPublicTaxDetails({ ...snapshot(), secret: 'private' }, 1)
    expect(details).toMatchObject({ taxAmount: 1, ratePercent: '10' })
    expect(details).not.toHaveProperty('calculationId')
    expect(details).not.toHaveProperty('secret')
    expect(mapPublicTaxDetails(details, 1)).toEqual(details)
    expect(mapPublicTaxDetails(snapshot(), 2)).toBeNull()
    expect(mapPublicTaxDetails(null, 9.5)).toBeNull()
  })

  it('rejects malformed, inconsistent or oversized snapshots', () => {
    for (const value of [{ ...snapshot(), taxAmount: -1 }, { ...snapshot(), taxAmount: 2 }, { ...snapshot(), version: 2 }, { ...snapshot(), extra: 'x'.repeat(4000) }]) expect(() => validateTaxSnapshot(value)).toThrow()
  })

  it('signs the server snapshot and links only its calculation when starting payment', async () => {
    const quoteHash = checkoutQuoteHash(input())
    mocks.previewCheckout.mockResolvedValue({ pricing: { total: 11 }, taxSnapshot: snapshot(), quoteHash })
    mocks.createStripePaymentIntent.mockResolvedValue({ id: 'pi_fixture', client_secret: 'fictional' })
    const res = response()
    await createPaymentIntent({ body: { customer, paymentMode: 'sandbox', taxSnapshot: { taxAmount: 0 } } }, res)
    expect(res.statusCode).toBe(200)
    expect(mocks.previewCheckout).toHaveBeenCalledWith(expect.anything(), { includeTaxSnapshot: true })
    expect(mocks.createStripePaymentIntent).toHaveBeenCalledWith({ amount: 11, paymentMode: 'sandbox', taxCalculationId: 'taxcalc_fixture' })
    expect(res.body).not.toHaveProperty('taxSnapshot')
    const proof = res.body.checkoutProof
    mocks.createCheckout.mockResolvedValue({ order: { orderNumber: 'TEST-1', taxAmount: 1, taxSnapshot: snapshot() }, pricing: { total: 11 }, taxSnapshot: snapshot(), quoteHash })
    const done = response()
    await createCheckoutController({ body: { customer, stripePaymentIntentId: 'pi_fixture', checkoutProof: proof, taxSnapshot: { taxAmount: 0 } } }, done)
    expect(mocks.createCheckout).toHaveBeenCalledWith(expect.anything(), { customerUser: null, paymentTax: snapshot(), expectedQuoteHash: quoteHash })
    expect(done.body.result).not.toHaveProperty('taxSnapshot')
    expect(done.body.result).not.toHaveProperty('quoteHash')
    expect(done.body.result.order.taxDetails.taxAmount).toBe(1)
    expect(done.body.result.order).not.toHaveProperty('taxSnapshot')
  })

  it('rejects tampered proof and malformed signed tax metadata before finalization', async () => {
    for (const checkoutProof of [
      signCapability('checkout-payment', { paymentIntentId: 'pi_fixture', email: customer.email, taxVersion: 1 }),
      signCapability('checkout-payment', { paymentIntentId: 'pi_fixture', email: customer.email, taxVersion: 2, taxSnapshot: snapshot(), quoteHash: 'a'.repeat(64) }),
      signCapability('checkout-payment', { paymentIntentId: 'pi_fixture', email: customer.email, taxVersion: 1, taxSnapshot: snapshot(), quoteHash: 'bad' }),
    ]) {
      const res = response()
      await createCheckoutController({ body: { customer, stripePaymentIntentId: 'pi_fixture', checkoutProof } }, res)
      expect(res.statusCode).toBe(400)
    }
    expect(mocks.createCheckout).not.toHaveBeenCalled()
  })
})
