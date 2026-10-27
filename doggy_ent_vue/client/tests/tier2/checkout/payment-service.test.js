import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { getPublishableKeyMode } from '../../../src/domains/payments/services/publishableKeyMode.js'

const unavailable = 'Secure payment is unavailable. Please try again later.'
const checkout = {
  cartItems: [{ productId: 'offline-product', selectedSize: '6 oz', quantity: 1 }],
  promoCode: 'OFFLINE',
  customer: { email: 'fixture@example.invalid', firstName: 'Fixture' },
  shipping: { id: 'offline-rate' },
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } })
}

beforeEach(() => {
  vi.resetModules()
  vi.stubEnv('VITE_API_BASE_URL', '')
  vi.stubEnv('VITE_API_URL', '')
  vi.stubEnv('VITE_ADMIN_DATA_TARGET', 'LOCAL')
  vi.stubEnv('VITE_STRIPE_PUBLISHABLE_KEY', 'pk_test_offlineFixture')
  vi.stubGlobal('fetch', vi.fn())
})
afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals() })

describe('publishable key payment mode', () => {
  it.each([
    ['pk_test_offlineFixture', 'sandbox'],
    ['pk_live_offlineFixture', 'live'],
    ['', null], [undefined, null], [null, null], [123, null], [{}, null],
    ['sk_test_notASecret', null], ['sk_live_notASecret', null], ['rk_test_notASecret', null],
    ['pk_test_', null], ['pk_live_', null], ['pk_test_fixture_extra', null],
    [' pk_test_fixture', null], ['pk_test_fixture ', null], ['pk_test_fixture\n', null],
    ['PK_test_fixture', null], ['pk_sandbox_fixture', null], ['pk_test_fixture<script>', null],
  ])('accepts only a complete supported public-key format (%s)', (key, mode) => {
    expect(getPublishableKeyMode(key)).toBe(mode)
  })
})

describe('public payment configuration API', () => {
  it.each(['sandbox', 'live'])('reads %s configuration without sending a key', async mode => {
    fetch.mockResolvedValue(json({ success: true, configuration: { mode, enabled: true, message: '', accountId: 'private-marker' } }))
    const { getPaymentConfiguration } = await import('../../../src/domains/payments/services/payment.service.js')
    expect(await getPaymentConfiguration()).toEqual({ mode, enabled: true, message: '' })
    expect(fetch).toHaveBeenCalledExactlyOnceWith('/api/checkout/payment-configuration', {
      credentials: 'include', method: 'GET', cache: 'no-store',
    })
  })

  it.each(['sandbox', 'live', 'unconfigured'])('keeps disabled %s status and discards server diagnostics', async mode => {
    fetch.mockResolvedValue(json({ success: true, configuration: { mode, enabled: false, message: 'private-provider-marker' } }))
    const { getPaymentConfiguration } = await import('../../../src/domains/payments/services/payment.service.js')
    expect(await getPaymentConfiguration()).toEqual({ mode, enabled: false, message: unavailable })
  })

  it.each([
    null, {}, { success: false }, { success: 'true' },
    { success: true, configuration: null },
    { success: true, configuration: [] },
    { success: true, configuration: { mode: 'test', enabled: true, message: '' } },
    { success: true, configuration: { mode: 'sandbox', enabled: 'true', message: '' } },
    { success: true, configuration: { mode: 'sandbox', enabled: true } },
    { success: true, configuration: { mode: 'sandbox', enabled: true, message: {} } },
    { success: true, configuration: { mode: 'unconfigured', enabled: true, message: '' } },
  ])('rejects malformed configuration without leaking it: %j', async data => {
    fetch.mockResolvedValue(json(data))
    const { getPaymentConfiguration } = await import('../../../src/domains/payments/services/payment.service.js')
    await expect(getPaymentConfiguration()).rejects.toMatchObject({ message: unavailable })
  })

  it.each(['network', 'html', 'invalid-json', 'api'])('fails closed for %s failure with safe copy', async failure => {
    if (failure === 'network') fetch.mockRejectedValue(new Error('private-network-marker'))
    if (failure === 'html') fetch.mockResolvedValue(new Response('<h1>private-routing-marker</h1>', { status: 503 }))
    if (failure === 'invalid-json') fetch.mockResolvedValue(new Response('{', { headers: { 'Content-Type': 'application/json' } }))
    if (failure === 'api') fetch.mockResolvedValue(json({ message: 'private-provider-marker' }, 503))
    const { getPaymentConfiguration } = await import('../../../src/domains/payments/services/payment.service.js')
    await expect(getPaymentConfiguration()).rejects.toMatchObject({ message: unavailable })
  })
})

describe('payment intent request mode handshake', () => {
  it.each([
    ['pk_test_offlineFixture', 'sandbox'], ['pk_live_offlineFixture', 'live'],
  ])('derives %s mode locally and preserves the checkout payload', async (key, mode) => {
    vi.stubEnv('VITE_STRIPE_PUBLISHABLE_KEY', key)
    const result = { success: true, clientSecret: 'offline-proof', pricing: { total: 12 } }
    fetch.mockResolvedValue(json(result))
    const { createPaymentIntent } = await import('../../../src/domains/payments/services/payment.service.js')
    expect(await createPaymentIntent({ ...checkout, paymentMode: 'spoofed', publishableKey: key })).toEqual(result)
    expect(fetch).toHaveBeenCalledExactlyOnceWith('/api/checkout/create-payment-intent', {
      credentials: 'include',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentMode: mode, cartItems: checkout.cartItems, promoCode: checkout.promoCode, customerEmail: checkout.customer.email, customer: checkout.customer, shipping: checkout.shipping }),
    })
    expect(fetch.mock.calls[0][1].body).not.toContain(key)
  })

  it.each(['', 'sk_test_notASecret', 'rk_live_notASecret', 'pk_test_', 'pk_test_fixture\n'])('refuses missing/invalid keys before a POST (%s)', async key => {
    vi.stubEnv('VITE_STRIPE_PUBLISHABLE_KEY', key)
    const { createPaymentIntent } = await import('../../../src/domains/payments/services/payment.service.js')
    await expect(createPaymentIntent(checkout)).rejects.toMatchObject({ message: unavailable })
    expect(fetch).not.toHaveBeenCalled()
  })

  it('keeps the POST authoritative after an enabled configuration read', async () => {
    fetch.mockResolvedValueOnce(json({ success: true, configuration: { mode: 'sandbox', enabled: true, message: '' } }))
      .mockResolvedValueOnce(json({ success: false, message: 'private-disabled-marker' }, 503))
    const { getPaymentConfiguration, createPaymentIntent } = await import('../../../src/domains/payments/services/payment.service.js')
    await getPaymentConfiguration()
    await expect(createPaymentIntent(checkout)).rejects.toMatchObject({ message: unavailable })
    expect(fetch).toHaveBeenCalledTimes(2)
    expect(JSON.parse(fetch.mock.calls[1][1].body).paymentMode).toBe('sandbox')
  })

  it.each(['network', 'html', 'invalid-json', 'api', 'unsuccessful'])('redacts %s POST errors', async failure => {
    if (failure === 'network') fetch.mockRejectedValue(new Error('private-provider-marker'))
    if (failure === 'html') fetch.mockResolvedValue(new Response('<h1>private-routing-marker</h1>', { status: 502 }))
    if (failure === 'invalid-json') fetch.mockResolvedValue(new Response('{', { headers: { 'Content-Type': 'application/json' } }))
    if (failure === 'api') fetch.mockResolvedValue(json({ message: 'private-provider-marker' }, 409))
    if (failure === 'unsuccessful') fetch.mockResolvedValue(json({ success: false, message: 'private-provider-marker' }))
    const { createPaymentIntent } = await import('../../../src/domains/payments/services/payment.service.js')
    await expect(createPaymentIntent(checkout)).rejects.toMatchObject({ message: unavailable })
  })
})
