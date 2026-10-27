import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => {
  const create = vi.fn()
  const retrieve = vi.fn()
  const retrieveAccount = vi.fn()

  return {
    create,
    retrieve,
    retrieveAccount,
    Stripe: vi.fn(function Stripe() {
      this.paymentIntents = { create, retrieve }
      this.accounts = { retrieve: retrieveAccount }
    }),
    logOperationalFailure: vi.fn(),
  }
})

vi.mock('stripe', () => ({ default: mocks.Stripe }))
vi.mock('../../../src/shared/utils/operationalLog.js', () => ({
  logOperationalFailure: mocks.logOperationalFailure,
}))

vi.stubEnv('STRIPE_SECRET_KEY', undefined)

const {
  createStripePaymentIntent,
  retrieveStripePaymentIntent,
  validateStripePaymentIntent,
} = await import('../../../src/domains/payments/services/stripe.payment.js')

const paymentIntentId = 'pi_offline_regression'
let fixtureSequence = 0
const validationInput = {
  stripePaymentIntentId: paymentIntentId,
  expectedAmount: 42.37,
}

function succeededIntent(overrides = {}) {
  return {
    id: paymentIntentId,
    status: 'succeeded',
    amount: 4237,
    amount_received: 4237,
    currency: 'usd',
    livemode: false,
    ...overrides,
  }
}

beforeEach(() => {
  mocks.create.mockReset()
  mocks.retrieve.mockReset()
  mocks.logOperationalFailure.mockReset()
  mocks.Stripe.mockClear()
  mocks.retrieveAccount.mockReset().mockResolvedValue({ id: 'acct_offlineFixture', charges_enabled: true })
  vi.stubEnv('STRIPE_SECRET_KEY', `rk_test_offlineFixture${++fixtureSequence}`)
  vi.stubEnv('STRIPE_EXPECTED_ACCOUNT_ID', 'acct_offlineFixture')
  vi.stubEnv('PAYMENT_MODE', 'sandbox')
  vi.stubEnv('PAYMENTS_ENABLED', 'true')
})

afterEach(() => vi.restoreAllMocks())
afterAll(() => vi.unstubAllEnvs())

describe('offline Stripe payment adapter', () => {
  it('attaches only the server-selected tax calculation when creating an intent', async () => {
    mocks.create.mockResolvedValue({ id: paymentIntentId, livemode: false })
    await createStripePaymentIntent({ amount: 42.37, paymentMode: 'sandbox', taxCalculationId: 'taxcalc_fixture' })
    expect(mocks.create).toHaveBeenCalledWith(expect.objectContaining({ hooks: { inputs: { tax: { calculation: 'taxcalc_fixture' } } } }))
  })

  it.each([undefined, 'taxcalc_other'])('rejects a missing or mismatched paid tax hook (%s)', async calculation => {
    mocks.retrieve.mockResolvedValue(succeededIntent({ hooks: calculation ? { inputs: { tax: { calculation } } } : undefined }))
    await expect(validateStripePaymentIntent({ ...validationInput, expectedTaxCalculationId: 'taxcalc_fixture' })).rejects.toMatchObject({ statusCode: 409 })
  })

  it('accepts the matching paid tax hook and requires no hook for disabled tax', async () => {
    mocks.retrieve.mockResolvedValue(succeededIntent({ hooks: { inputs: { tax: { calculation: 'taxcalc_fixture' } } } }))
    await expect(validateStripePaymentIntent({ ...validationInput, expectedTaxCalculationId: 'taxcalc_fixture' })).resolves.toMatchObject({ id: paymentIntentId })
    await expect(validateStripePaymentIntent({ ...validationInput, expectedTaxCalculationId: null })).rejects.toMatchObject({ statusCode: 409 })
    mocks.retrieve.mockResolvedValue(succeededIntent())
    await expect(validateStripePaymentIntent({ ...validationInput, expectedTaxCalculationId: null })).resolves.toMatchObject({ id: paymentIntentId })
  })
  it('does not construct a Stripe client at module import', () => {
    expect(mocks.Stripe).not.toHaveBeenCalled()
  })

  describe('createStripePaymentIntent', () => {
    it('bounds provider calls without automatic network retries', async () => {
      mocks.create.mockResolvedValue({ id: paymentIntentId, livemode: false })
      await createStripePaymentIntent({ amount: 42.37, paymentMode: 'sandbox' })
      expect(mocks.Stripe).toHaveBeenCalledExactlyOnceWith(expect.any(String), { timeout: 8000, maxNetworkRetries: 0 })
    })
    it.each([undefined, 'live'])('does not call Stripe for an unconfirmed client mode %j', async paymentMode => {
      await expect(createStripePaymentIntent({ amount: 42.37, paymentMode })).rejects.toMatchObject({ statusCode: 409 })
      expect(mocks.create).not.toHaveBeenCalled()
      expect(mocks.retrieveAccount).not.toHaveBeenCalled()
    })

    it.each([true, undefined])('rejects a creation result whose livemode is %s', async livemode => {
      mocks.create.mockResolvedValue({ id: paymentIntentId, livemode })
      await expect(createStripePaymentIntent({ amount: 42.37, paymentMode: 'sandbox' })).rejects.toMatchObject({ code: 'PAYMENT_ENVIRONMENT_UNAVAILABLE' })
    })

    it('does not create any payment when the provider account differs', async () => {
      mocks.retrieveAccount.mockResolvedValue({ id: 'acct_otherFixture', charges_enabled: true })
      await expect(createStripePaymentIntent({ amount: 42.37, paymentMode: 'sandbox' })).rejects.toThrow('temporarily unavailable')
      expect(mocks.create).not.toHaveBeenCalled()
    })

    it('does not let a live credential create charges even with enabled set', async () => {
      vi.stubEnv('PAYMENT_MODE', 'live')
      vi.stubEnv('STRIPE_SECRET_KEY', 'rk_live_neverChargeFixture123')
      await expect(createStripePaymentIntent({ amount: 42.37, paymentMode: 'live' })).rejects.toThrow('temporarily unavailable')
      expect(mocks.create).not.toHaveBeenCalled()
      expect(mocks.retrieveAccount).not.toHaveBeenCalled()
    })

    it.each([
      { label: 'whole dollars', amount: 42, cents: 4200 },
      { label: 'two decimal places', amount: 42.37, cents: 4237 },
      { label: 'a single cent', amount: 0.01, cents: 1 },
      { label: 'binary floating-point cents', amount: 0.29, cents: 29 },
      { label: 'a calculated floating-point total', amount: 0.1 + 0.2, cents: 30 },
      { label: 'rounding down to the nearest cent', amount: 12.344, cents: 1234 },
      { label: 'rounding up to the nearest cent', amount: 12.346, cents: 1235 },
      { label: 'a numeric trusted total', amount: '42.37', cents: 4237 },
    ])('converts $label to integer cents', async ({ amount, cents }) => {
      const intent = { id: paymentIntentId, status: 'requires_payment_method', livemode: false }
      mocks.create.mockResolvedValue(intent)

      await expect(createStripePaymentIntent({ amount, paymentMode: 'sandbox' })).resolves.toBe(intent)

      expect(mocks.create).toHaveBeenCalledOnce()
      // Check the payload without constraining future Stripe request options.
      const [payload] = mocks.create.mock.calls[0]
      expect(payload).toMatchObject({
        amount: cents,
        currency: 'usd',
        automatic_payment_methods: { enabled: true },
      })
      expect(Number.isInteger(payload.amount)).toBe(true)
      expect(mocks.retrieve).not.toHaveBeenCalled()
      expect(mocks.logOperationalFailure).not.toHaveBeenCalled()
    })

    it.each([
      { label: 'omitted currency', input: {}, currency: 'usd' },
      { label: 'explicit currency', input: { currency: 'eur' }, currency: 'eur' },
    ])('uses $label in the creation payload', async ({ input, currency }) => {
      const intent = { id: paymentIntentId, livemode: false }
      mocks.create.mockResolvedValue(intent)

      await expect(createStripePaymentIntent({ amount: 42.37, paymentMode: 'sandbox', ...input }))
        .resolves.toBe(intent)

      expect(mocks.create).toHaveBeenCalledOnce()
      expect(mocks.create.mock.calls[0][0]).toMatchObject({ amount: 4237, currency })
    })
  })

  describe('retrieveStripePaymentIntent', () => {
    it('can validate an already-paid live intent even with the live creation lock and pause', async () => {
      vi.stubEnv('PAYMENT_MODE', 'live')
      vi.stubEnv('PAYMENTS_ENABLED', 'false')
      vi.stubEnv('STRIPE_SECRET_KEY', 'rk_live_readOnlyFixture123')
      mocks.retrieve.mockResolvedValue(succeededIntent({ livemode: true }))
      await expect(validateStripePaymentIntent(validationInput)).resolves.toMatchObject({ status: 'succeeded', livemode: true })
      expect(mocks.create).not.toHaveBeenCalled()
    })
    it('continues verifying an already-paid intent while new payments are paused', async () => {
      vi.stubEnv('PAYMENTS_ENABLED', 'false')
      mocks.retrieve.mockResolvedValue(succeededIntent())
      await expect(validateStripePaymentIntent(validationInput)).resolves.toMatchObject({ status: 'succeeded' })
      expect(mocks.create).not.toHaveBeenCalled()
    })

    it.each([true, undefined])('rejects a retrieved intent whose livemode is %s', async livemode => {
      mocks.retrieve.mockResolvedValue(succeededIntent({ livemode }))
      await expect(validateStripePaymentIntent(validationInput)).rejects.toMatchObject({ code: 'PAYMENT_ENVIRONMENT_UNAVAILABLE' })
    })

    it('retrieves the requested ID and returns the original provider object', async () => {
      const intent = succeededIntent()
      mocks.retrieve.mockResolvedValue(intent)

      await expect(retrieveStripePaymentIntent(paymentIntentId)).resolves.toBe(intent)

      expect(mocks.retrieve).toHaveBeenCalledExactlyOnceWith(paymentIntentId)
      expect(mocks.create).not.toHaveBeenCalled()
      expect(mocks.logOperationalFailure).not.toHaveBeenCalled()
    })
  })

  describe.each([
    { label: 'direct retrieval', run: id => retrieveStripePaymentIntent(id) },
    {
      label: 'payment validation',
      run: id => validateStripePaymentIntent({ ...validationInput, stripePaymentIntentId: id }),
    },
  ])('$label without an ID', ({ run }) => {
    it.each([
      { label: 'omitted', id: undefined },
      { label: 'null', id: null },
      { label: 'empty', id: '' },
    ])('rejects an $label ID before provider retrieval', async ({ id }) => {
      await expect(run(id)).rejects.toThrow('Stripe payment intent ID is required.')

      expect(mocks.retrieve).not.toHaveBeenCalled()
      expect(mocks.create).not.toHaveBeenCalled()
      expect(mocks.logOperationalFailure).not.toHaveBeenCalled()
    })
  })

  describe('validateStripePaymentIntent', () => {
    it.each([
      { label: 'whole-dollar total', expectedAmount: 42, received: 4200 },
      { label: 'decimal total', expectedAmount: 42.37, received: 4237 },
      { label: 'calculated total', expectedAmount: 0.1 + 0.2, received: 30 },
      { label: 'rounded total', expectedAmount: 12.346, received: 1235 },
    ])('accepts a succeeded payment for the exact $label', async ({ expectedAmount, received }) => {
      const intent = succeededIntent({ amount: received, amount_received: received })
      mocks.retrieve.mockResolvedValue(intent)

      await expect(validateStripePaymentIntent({ ...validationInput, expectedAmount }))
        .resolves.toBe(intent)

      expect(mocks.retrieve).toHaveBeenCalledExactlyOnceWith(paymentIntentId)
      expect(mocks.create).not.toHaveBeenCalled()
      expect(mocks.logOperationalFailure).not.toHaveBeenCalled()
    })

    it.each([
      'requires_payment_method',
      'requires_confirmation',
      'requires_action',
      'processing',
      'requires_capture',
      'canceled',
      'unknown_status',
      undefined,
      null,
    ])('rejects non-succeeded status %s even with matching amount and currency', async status => {
      mocks.retrieve.mockResolvedValue(succeededIntent({ status }))

      await expect(validateStripePaymentIntent(validationInput)).rejects.toMatchObject({
        message: 'Stripe payment has not completed successfully.',
        statusCode: 400,
      })

      expect(mocks.retrieve).toHaveBeenCalledExactlyOnceWith(paymentIntentId)
      expect(mocks.logOperationalFailure).not.toHaveBeenCalled()
    })

    it.each([
      { label: 'one cent underpaid', received: 4236 },
      { label: 'one cent overpaid', received: 4238 },
      { label: 'dollars instead of cents', received: 42.37 },
      { label: 'no funds received', received: 0 },
      { label: 'missing amount_received despite matching amount', received: undefined },
      { label: 'null amount_received despite matching amount', received: null },
      { label: 'a nonnumeric received amount', received: 'not-an-amount' },
      { label: 'a non-finite received amount', received: Infinity },
    ])('rejects $label', async ({ received }) => {
      mocks.retrieve.mockResolvedValue(succeededIntent({ amount_received: received }))

      await expect(validateStripePaymentIntent(validationInput)).rejects.toMatchObject({
        message: 'Stripe payment amount mismatch detected.',
        statusCode: 400,
      })

      expect(mocks.retrieve).toHaveBeenCalledExactlyOnceWith(paymentIntentId)
      expect(mocks.logOperationalFailure).not.toHaveBeenCalled()
    })

    it.each([
      { label: 'missing', expectedAmount: undefined },
      { label: 'null', expectedAmount: null },
      { label: 'nonnumeric', expectedAmount: 'not-an-amount' },
    ])('rejects a $label expected amount against received funds', async ({ expectedAmount }) => {
      mocks.retrieve.mockResolvedValue(succeededIntent())

      await expect(validateStripePaymentIntent({ ...validationInput, expectedAmount }))
        .rejects.toMatchObject({
          message: 'Stripe payment amount mismatch detected.',
          statusCode: 400,
        })

      expect(mocks.logOperationalFailure).not.toHaveBeenCalled()
    })

    it.each([
      { label: 'default USD', currency: 'usd', expected: {} },
      { label: 'uppercase provider USD with the default', currency: 'USD', expected: {} },
      { label: 'uppercase expected USD', currency: 'usd', expected: { expectedCurrency: 'USD' } },
      { label: 'mixed-case USD', currency: 'UsD', expected: { expectedCurrency: 'uSd' } },
      { label: 'an explicit non-default currency', currency: 'EUR', expected: { expectedCurrency: 'eur' } },
    ])('accepts exact funds in $label', async ({ currency, expected }) => {
      const intent = succeededIntent({ currency })
      mocks.retrieve.mockResolvedValue(intent)

      await expect(validateStripePaymentIntent({ ...validationInput, ...expected }))
        .resolves.toBe(intent)

      expect(mocks.retrieve).toHaveBeenCalledExactlyOnceWith(paymentIntentId)
      expect(mocks.logOperationalFailure).not.toHaveBeenCalled()
    })

    it.each([
      { label: 'EUR against default USD', currency: 'eur', expected: {} },
      { label: 'USD against explicit EUR', currency: 'usd', expected: { expectedCurrency: 'eur' } },
      { label: 'missing provider currency', currency: undefined, expected: {} },
      { label: 'null provider currency', currency: null, expected: {} },
      { label: 'empty provider currency', currency: '', expected: {} },
    ])('rejects $label even when succeeded and fully paid', async ({ currency, expected }) => {
      mocks.retrieve.mockResolvedValue(succeededIntent({ currency }))

      await expect(validateStripePaymentIntent({ ...validationInput, ...expected }))
        .rejects.toMatchObject({
          message: 'Stripe payment currency mismatch detected.',
          statusCode: 400,
        })

      expect(mocks.retrieve).toHaveBeenCalledExactlyOnceWith(paymentIntentId)
      expect(mocks.logOperationalFailure).not.toHaveBeenCalled()
    })

    it.each([
      { label: 'null', intent: null },
      { label: 'undefined', intent: undefined },
    ])('rejects a $label retrieved intent as not found', async ({ intent }) => {
      mocks.retrieve.mockResolvedValue(intent)

      await expect(validateStripePaymentIntent(validationInput)).rejects.toMatchObject({
        message: 'Stripe payment intent was not found.',
        statusCode: 404,
      })

      expect(mocks.retrieve).toHaveBeenCalledExactlyOnceWith(paymentIntentId)
      expect(mocks.logOperationalFailure).not.toHaveBeenCalled()
    })
  })

  describe('provider failures', () => {
    it.each([
      {
        label: 'creation',
        method: 'create',
        event: 'PAYMENT_INTENT_CREATE_FAILED',
        run: () => createStripePaymentIntent({ amount: 42.37, paymentMode: 'sandbox' }),
      },
      {
        label: 'direct retrieval',
        method: 'retrieve',
        event: 'PAYMENT_INTENT_RETRIEVE_FAILED',
        run: () => retrieveStripePaymentIntent(paymentIntentId),
      },
      {
        label: 'retrieval during validation',
        method: 'retrieve',
        event: 'PAYMENT_INTENT_RETRIEVE_FAILED',
        run: () => validateStripePaymentIntent(validationInput),
      },
    ])('delegates $label failure to the safe logger and rethrows without retry', async ({ method, event, run }) => {
      const error = Object.assign(new Error('Fictional private provider failure detail'), {
        code: 'ECONNRESET',
        statusCode: 503,
        raw: { message: 'Fictional private provider payload' },
      })
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
      mocks[method].mockRejectedValue(error)

      await expect(run()).rejects.toBe(error)

      expect(mocks[method]).toHaveBeenCalledOnce()
      expect(mocks[method === 'create' ? 'retrieve' : 'create']).not.toHaveBeenCalled()
      expect(mocks.logOperationalFailure).toHaveBeenCalledExactlyOnceWith(event, error)
      expect(consoleError).not.toHaveBeenCalled()
    })
  })
})
