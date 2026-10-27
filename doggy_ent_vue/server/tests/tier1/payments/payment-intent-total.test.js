import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { readCapability } from '../../../src/shared/utils/signedCapability.js'

const mocks = vi.hoisted(() => ({
  previewCheckout: vi.fn(),
  createStripePaymentIntent: vi.fn(),
}))

vi.mock('../../../src/domains/checkout/services/checkout.service.js', () => ({
  previewCheckout: mocks.previewCheckout,
}))

vi.mock('../../../src/domains/payments/services/stripe.payment.js', () => ({
  createStripePaymentIntent: mocks.createStripePaymentIntent,
}))

const {
  createPaymentIntent: paymentController,
} = await import('../../../src/domains/payments/controllers/payment.controller.js')

function createPaymentIntent(request, response) {
  return paymentController({ ...request, body: { paymentMode: 'sandbox', ...request.body } }, response)
}

function createResponse() {
  const response = {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code
      return this
    },
    json(body) {
      this.body = body
      return this
    },
  }

  return response
}
const customer = { firstName: 'QA', lastName: 'Example', email: 'qa@example.com', address1: '123 Example Lane', city: 'Sample City', state: 'CA', zip: '90001', country: 'United States' }

describe('payment intent trusted amount', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubEnv('PAYMENT_MODE', 'sandbox')
    vi.stubEnv('PAYMENTS_ENABLED', 'true')
    vi.stubEnv('STRIPE_SECRET_KEY', 'rk_test_offlineController123')
    vi.stubEnv('STRIPE_EXPECTED_ACCOUNT_ID', 'acct_offlineController')
    mocks.previewCheckout.mockResolvedValue({
      pricing: {
        total: 42.37,
      },
      promo: {
        valid: true,
      },
    })
    mocks.createStripePaymentIntent.mockResolvedValue({
      id: 'pi_test',
      client_secret: 'secret',
    })
  })

  afterEach(() => { vi.useRealTimers(); vi.unstubAllEnvs() })

  it('creates Stripe PaymentIntent from server checkout preview total', async () => {
    const response = createResponse()

    await createPaymentIntent({
      body: {
        amount: 999,
        customer,
        cartItems: [],
        promoCode: 'CHASE20',
      },
    }, response)

    expect(mocks.previewCheckout).toHaveBeenCalledWith({
      paymentMode: 'sandbox',
      amount: 999,
      customer,
      cartItems: [],
      promoCode: 'CHASE20',
    })
    expect(mocks.createStripePaymentIntent).toHaveBeenCalledWith({
      amount: 42.37,
      paymentMode: 'sandbox',
    })
    expect(response.statusCode).toBe(200)
    expect(response.body.pricing.total).toBe(42.37)
  })

  it('rejects invalid server promo preview before Stripe is called', async () => {
    mocks.previewCheckout.mockResolvedValue({
      pricing: {
        total: 50,
      },
      promo: {
        valid: false,
        message: 'Invalid promo',
      },
    })
    const response = createResponse()

    await createPaymentIntent({
      body: {
        promoCode: 'BAD',
        customer,
      },
    }, response)

    expect(response.statusCode).toBe(400)
    expect(response.body.message).toBe('Invalid promo')
    expect(mocks.createStripePaymentIntent).not.toHaveBeenCalled()
  })

  it.each(['firstName', 'lastName', 'email', 'address1', 'city', 'state', 'zip', 'country'])('rejects missing %s before preview or provider work', async key => {
    const response = createResponse()
    await createPaymentIntent({ body: { customer: { ...customer, [key]: ' ' } } }, response)
    expect(response.statusCode).toBe(400)
    expect(response.body.success).toBe(false)
    expect(mocks.previewCheckout).not.toHaveBeenCalled()
    expect(mocks.createStripePaymentIntent).not.toHaveBeenCalled()
  })

  it('rejects invalid email formatting before creating an intent', async () => {
    const response = createResponse()
    await createPaymentIntent({ body: { customer: { ...customer, email: 'not-an-email' } } }, response)
    expect(response.statusCode).toBe(400)
    expect(mocks.createStripePaymentIntent).not.toHaveBeenCalled()
  })

  it('binds the checkout proof to the normalized checkout email and actual intent only', async () => {
    const response = createResponse()
    await createPaymentIntent({ body: { customer: { ...customer, email: ' QA@Example.com ' }, customerEmail: 'other@example.test' } }, response)
    expect(readCapability(response.body.checkoutProof, 'checkout-payment')).toMatchObject({ paymentIntentId: 'pi_test', email: 'qa@example.com' })
    expect(readCapability(response.body.checkoutProof, 'order-receipt')).toBeNull()
  })

  it('expires the checkout proof at the 24-hour boundary', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-10-26T12:00:00Z'))
    const response = createResponse()
    await createPaymentIntent({ body: { customer } }, response)
    vi.advanceTimersByTime(24 * 60 * 60 * 1000 - 1)
    expect(readCapability(response.body.checkoutProof, 'checkout-payment')).not.toBeNull()
    vi.advanceTimersByTime(1)
    expect(readCapability(response.body.checkoutProof, 'checkout-payment')).toBeNull()
  })

  it('returns only the payment handoff fields, not the whole provider object', async () => {
    mocks.createStripePaymentIntent.mockResolvedValue({ id: 'pi_test', client_secret: 'offline-client-secret', metadata: { private: 'offline-canary' }, latest_charge: { customer: 'offline-customer' } })
    const response = createResponse()
    await createPaymentIntent({ body: { customer } }, response)
    expect(Object.keys(response.body).sort()).toEqual(['checkoutProof', 'clientSecret', 'paymentIntentId', 'pricing', 'success'])
    expect(response.body.clientSecret).toBe('offline-client-secret')
    expect(JSON.stringify(response.body)).not.toContain('offline-canary')
    expect(JSON.stringify(response.body)).not.toContain('offline-customer')
  })

  it.each([
    { name: 'StripeCardError', statusCode: 402 },
    { type: 'StripeAuthenticationError', statusCode: 401 },
    { name: 'PrismaClientKnownRequestError', statusCode: 400 },
    { name: 'Error', statusCode: 500 },
  ])('does not expose provider/database failure details (%j)', async details => {
    mocks.createStripePaymentIntent.mockRejectedValue(Object.assign(new Error('OFFLINE_PRIVATE_PROVIDER_CANARY'), details))
    const response = createResponse()
    await createPaymentIntent({ body: { customer } }, response)
    expect(response.statusCode).toBe(500)
    expect(response.body).toEqual({ success: false, message: 'Unable to start secure payment. Please try again.' })
  })

  it('does not create a provider intent when trusted pricing fails', async () => {
    mocks.previewCheckout.mockRejectedValue(Object.assign(new Error('This size is unavailable.'), { statusCode: 409 }))
    const response = createResponse()
    await createPaymentIntent({ body: { customer } }, response)
    expect(response.statusCode).toBe(409)
    expect(mocks.createStripePaymentIntent).not.toHaveBeenCalled()
  })

  it.each([undefined, 'live', 'test'])('rejects missing or mismatched frontend mode %j before preview', async paymentMode => {
    const response = createResponse()
    await createPaymentIntent({ body: { customer, paymentMode } }, response)
    expect(response.statusCode).toBe(409)
    expect(mocks.previewCheckout).not.toHaveBeenCalled()
    expect(mocks.createStripePaymentIntent).not.toHaveBeenCalled()
  })

  it('rejects paused checkout before catalog or Stripe work', async () => {
    vi.stubEnv('PAYMENTS_ENABLED', 'false')
    const response = createResponse()
    await createPaymentIntent({ body: { customer } }, response)
    expect(response.statusCode).toBe(503)
    expect(response.body.message).toContain('temporarily unavailable')
    expect(mocks.previewCheckout).not.toHaveBeenCalled()
    expect(mocks.createStripePaymentIntent).not.toHaveBeenCalled()
  })
})
