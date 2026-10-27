import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
const sdk = vi.hoisted(() => ({ loadStripe: vi.fn() }))
vi.mock('@stripe/stripe-js/pure', () => sdk)

const unavailable = 'Secure payment is unavailable. Please try again later.'
const configuration = (mode = 'sandbox', enabled = true) => new Response(JSON.stringify({
  success: true, configuration: { mode, enabled, message: 'private-configuration-marker' },
}), { headers: { 'Content-Type': 'application/json' } })

beforeEach(() => {
  vi.resetModules()
  sdk.loadStripe.mockReset().mockResolvedValue({ fixture: true })
  vi.stubEnv('VITE_API_BASE_URL', '')
  vi.stubEnv('VITE_API_URL', '')
  vi.stubEnv('VITE_ADMIN_DATA_TARGET', 'LOCAL')
  vi.stubEnv('VITE_STRIPE_PUBLISHABLE_KEY', 'pk_test_offlineFixture')
  vi.stubGlobal('fetch', vi.fn(() => Promise.resolve(configuration())))
})
afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals() })

describe('payment-only Stripe loading', () => {
  it('does no network work on import and shares one configuration/SDK request', async () => {
    const { getStripe } = await import('../../../src/domains/payments/services/stripe.js')
    expect(fetch).not.toHaveBeenCalled()
    expect(sdk.loadStripe).not.toHaveBeenCalled()
    const instance = { elements: vi.fn() }
    sdk.loadStripe.mockResolvedValue(instance)
    const first = getStripe(), second = getStripe()
    expect(first).toBe(second)
    expect(await first).toBe(instance)
    expect(await getStripe()).toBe(instance)
    expect(fetch).toHaveBeenCalledExactlyOnceWith('/api/checkout/payment-configuration', {
      credentials: 'include', method: 'GET', cache: 'no-store',
    })
    expect(sdk.loadStripe).toHaveBeenCalledExactlyOnceWith('pk_test_offlineFixture')
  })

  it('waits for the configuration response before loading Stripe', async () => {
    let resolve
    fetch.mockImplementation(() => new Promise(done => { resolve = done }))
    const { getStripe } = await import('../../../src/domains/payments/services/stripe.js')
    const pending = getStripe()
    expect(sdk.loadStripe).not.toHaveBeenCalled()
    resolve(configuration())
    expect(await pending).toEqual({ fixture: true })
    expect(sdk.loadStripe).toHaveBeenCalledOnce()
  })

  it('returns null without API or provider work when no public key is configured', async () => {
    vi.stubEnv('VITE_STRIPE_PUBLISHABLE_KEY', '')
    const { getStripe } = await import('../../../src/domains/payments/services/stripe.js')
    expect(await getStripe()).toBe(null)
    expect(fetch).not.toHaveBeenCalled()
    expect(sdk.loadStripe).not.toHaveBeenCalled()
  })

  it.each(['sk_test_notASecret', 'sk_live_notASecret', 'rk_test_notASecret', 'pk_live_', 'pk_test_fixture\n'])('rejects invalid keys locally without exposing them (%s)', async key => {
    vi.stubEnv('VITE_STRIPE_PUBLISHABLE_KEY', key)
    const { getStripe } = await import('../../../src/domains/payments/services/stripe.js')
    await expect(getStripe()).rejects.toMatchObject({ message: unavailable })
    expect(fetch).not.toHaveBeenCalled()
    expect(sdk.loadStripe).not.toHaveBeenCalled()
  })

  it.each(['sandbox', 'live', 'unconfigured'])('does not load Stripe when %s configuration is disabled', async mode => {
    fetch.mockResolvedValue(configuration(mode, false))
    const { getStripe } = await import('../../../src/domains/payments/services/stripe.js')
    await expect(getStripe()).rejects.toMatchObject({ message: unavailable })
    expect(sdk.loadStripe).not.toHaveBeenCalled()
  })

  it.each([
    ['pk_test_offlineFixture', 'live'], ['pk_live_offlineFixture', 'sandbox'],
    ['pk_test_offlineFixture', 'unconfigured'],
  ])('does not load Stripe for a %s/%s mode mismatch', async (key, mode) => {
    vi.stubEnv('VITE_STRIPE_PUBLISHABLE_KEY', key)
    fetch.mockResolvedValue(configuration(mode))
    const { getStripe } = await import('../../../src/domains/payments/services/stripe.js')
    await expect(getStripe()).rejects.toMatchObject({ message: unavailable })
    expect(sdk.loadStripe).not.toHaveBeenCalled()
  })

  it('loads only after an enabled matching live configuration', async () => {
    vi.stubEnv('VITE_STRIPE_PUBLISHABLE_KEY', 'pk_live_offlineFixture')
    fetch.mockResolvedValue(configuration('live'))
    const { getStripe } = await import('../../../src/domains/payments/services/stripe.js')
    expect(await getStripe()).toEqual({ fixture: true })
    expect(sdk.loadStripe).toHaveBeenCalledExactlyOnceWith('pk_live_offlineFixture')
  })

  it.each(['network', 'html', 'malformed', 'api'])('fails closed for %s configuration responses', async failure => {
    if (failure === 'network') fetch.mockRejectedValue(new Error('private-network-marker'))
    if (failure === 'html') fetch.mockResolvedValue(new Response('<h1>private-routing-marker</h1>', { status: 503 }))
    if (failure === 'malformed') fetch.mockResolvedValue(new Response(JSON.stringify({ success: true, configuration: { mode: 'sandbox', enabled: 1, message: '' } }), { headers: { 'Content-Type': 'application/json' } }))
    if (failure === 'api') fetch.mockResolvedValue(new Response(JSON.stringify({ message: 'private-provider-marker' }), { status: 403, headers: { 'Content-Type': 'application/json' } }))
    const { getStripe } = await import('../../../src/domains/payments/services/stripe.js')
    await expect(getStripe()).rejects.toMatchObject({ message: unavailable })
    expect(sdk.loadStripe).not.toHaveBeenCalled()
  })

  it('retries configuration after a failed mount and deduplicates the retry', async () => {
    fetch.mockResolvedValueOnce(configuration('sandbox', false))
    const { getStripe } = await import('../../../src/domains/payments/services/stripe.js')
    await expect(getStripe()).rejects.toMatchObject({ message: unavailable })
    const first = getStripe(), second = getStripe()
    expect(first).toBe(second)
    expect(await first).toEqual({ fixture: true })
    expect(fetch).toHaveBeenCalledTimes(2)
    expect(sdk.loadStripe).toHaveBeenCalledOnce()
  })

  it('allows a later mount to retry a rejected SDK initialization with safe errors', async () => {
    sdk.loadStripe.mockRejectedValueOnce(new Error('private-sdk-marker')).mockResolvedValue({ fixture: true })
    const { getStripe } = await import('../../../src/domains/payments/services/stripe.js')
    await expect(getStripe()).rejects.toMatchObject({ message: unavailable })
    expect(await getStripe()).toEqual({ fixture: true })
    expect(fetch).toHaveBeenCalledTimes(2)
    expect(sdk.loadStripe).toHaveBeenCalledTimes(2)
  })

  it('allows retry after the SDK resolves without an instance', async () => {
    sdk.loadStripe.mockResolvedValueOnce(null).mockResolvedValue({ fixture: true })
    const { getStripe } = await import('../../../src/domains/payments/services/stripe.js')
    await expect(getStripe()).rejects.toMatchObject({ message: unavailable })
    expect(await getStripe()).toEqual({ fixture: true })
  })

  it('does not let cached mount configuration override a later server POST denial', async () => {
    const { getStripe } = await import('../../../src/domains/payments/services/stripe.js')
    const { createPaymentIntent } = await import('../../../src/domains/payments/services/payment.service.js')
    await getStripe()
    fetch.mockResolvedValueOnce(new Response(JSON.stringify({ success: false, message: 'private-disabled-marker' }), { status: 503, headers: { 'Content-Type': 'application/json' } }))
    await expect(createPaymentIntent({ cartItems: [] })).rejects.toMatchObject({ message: unavailable })
    expect(fetch).toHaveBeenCalledTimes(2)
    expect(fetch.mock.calls[1][0]).toBe('/api/checkout/create-payment-intent')
    expect(JSON.parse(fetch.mock.calls[1][1].body).paymentMode).toBe('sandbox')
  })
})
