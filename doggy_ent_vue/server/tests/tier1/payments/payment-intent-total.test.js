import { beforeEach, describe, expect, it, vi } from 'vitest'

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
  createPaymentIntent,
} = await import('../../../src/domains/payments/controllers/payment.controller.js')

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

describe('payment intent trusted amount', () => {
  beforeEach(() => {
    vi.clearAllMocks()
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

  it('creates Stripe PaymentIntent from server checkout preview total', async () => {
    const response = createResponse()

    await createPaymentIntent({
      body: {
        amount: 999,
        cartItems: [],
        promoCode: 'CHASE20',
      },
    }, response)

    expect(mocks.previewCheckout).toHaveBeenCalledWith({
      amount: 999,
      cartItems: [],
      promoCode: 'CHASE20',
    })
    expect(mocks.createStripePaymentIntent).toHaveBeenCalledWith({
      amount: 42.37,
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
      },
    }, response)

    expect(response.statusCode).toBe(400)
    expect(response.body.message).toBe('Invalid promo')
    expect(mocks.createStripePaymentIntent).not.toHaveBeenCalled()
  })
})
