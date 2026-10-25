import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
const sdk = vi.hoisted(() => ({ loadStripe: vi.fn() }))
vi.mock('@stripe/stripe-js/pure', () => sdk)
beforeEach(() => { vi.resetModules(); sdk.loadStripe.mockReset(); vi.stubEnv('VITE_STRIPE_PUBLISHABLE_KEY', 'pk_test_synthetic_fixture') })
afterEach(() => vi.unstubAllEnvs())
describe('payment-only Stripe loading', () => {
  it('does not initialize the provider on import and shares one requested instance', async () => {
    const { getStripe } = await import('../../../src/domains/payments/services/stripe.js')
    expect(sdk.loadStripe).not.toHaveBeenCalled()
    const instance = { elements: vi.fn() }
    sdk.loadStripe.mockResolvedValue(instance)
    const first = getStripe(), second = getStripe()
    expect(first).toBe(second)
    expect(await first).toBe(instance)
    expect(await getStripe()).toBe(instance)
    expect(sdk.loadStripe).toHaveBeenCalledTimes(1)
  })
  it('returns unavailable without initializing when no public key is configured', async () => {
    vi.stubEnv('VITE_STRIPE_PUBLISHABLE_KEY', '')
    const { getStripe } = await import('../../../src/domains/payments/services/stripe.js')
    expect(await getStripe()).toBe(null)
    expect(sdk.loadStripe).not.toHaveBeenCalled()
  })
  it('allows a later mount to retry a rejected SDK initialization', async () => {
    sdk.loadStripe.mockRejectedValueOnce(new Error('offline')).mockResolvedValue({ fixture: true })
    const { getStripe } = await import('../../../src/domains/payments/services/stripe.js')
    await expect(getStripe()).rejects.toThrow('offline')
    expect(await getStripe()).toEqual({ fixture: true })
    expect(sdk.loadStripe).toHaveBeenCalledTimes(2)
  })
})
