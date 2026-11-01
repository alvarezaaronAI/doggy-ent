import { webcrypto } from 'node:crypto'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cartFingerprint, newCheckoutRecovery, saveCheckoutRecovery } from '../../../src/domains/checkout/utils/checkoutRecovery.js'
import { getReceiptAccess } from '../../../src/domains/checkout/utils/receiptAccess.js'

let record, api
function json(data, status = 200) { return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } }) }
function result(overrides = {}) {
  return { attempt: { id: record.id, status: 'OPEN', amountCents: 1499, currency: 'usd', allowedActions: ['confirm', 'cancel'], ...overrides } }
}
beforeEach(async () => {
  vi.stubEnv('VITE_API_BASE_URL', '')
  vi.stubEnv('VITE_API_URL', '')
  vi.stubEnv('VITE_ADMIN_DATA_TARGET', 'LOCAL')
  vi.stubGlobal('crypto', webcrypto)
  const storage = new Map()
  vi.stubGlobal('localStorage', { getItem: key => storage.get(key) || null, setItem: (key, value) => storage.set(key, value) })
  vi.stubGlobal('sessionStorage', { getItem: () => null, setItem: vi.fn() })
  vi.stubGlobal('fetch', vi.fn())
  record = newCheckoutRecovery(await cartFingerprint([])); saveCheckoutRecovery(record)
  api = await import('../../../src/domains/checkout/api/checkoutRecovery.api.js')
})
afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals() })

describe('attempt API is a scoped no-store resource capability, not login', () => {
  it.each([['fetchCheckoutAttempt', 'GET', ''], ['finalizeCheckoutAttempt', 'POST', '/finalize'], ['cancelCheckoutAttempt', 'POST', '/cancel']])('%s sends the proof only as a header', async (method, verb, suffix) => {
    fetch.mockResolvedValue(json({ success: true, result: result() }))
    expect(await api[method](record)).toEqual(result())
    expect(fetch).toHaveBeenCalledWith(`/api/checkout/attempts/${record.id}${suffix}`, {
      credentials: 'include', method: verb, cache: 'no-store', headers: { 'X-Checkout-Recovery': record.token },
    })
    expect(fetch.mock.calls[0][0]).not.toContain(record.token)
    expect(fetch.mock.calls[0][1]).not.toHaveProperty('body')
  })

  it.each([401, 403, 404, 409, 500])('redacts private %s failure details and never returns an unauthorized snapshot', async status => {
    fetch.mockResolvedValue(json({ success: false, message: 'private-owner-provider-detail' }, status))
    await expect(api.fetchCheckoutAttempt(record)).rejects.toMatchObject({ message: api.RECOVERY_ERROR })
  })

  it.each([{ id: 'another-attempt' }, { status: 'UNKNOWN' }, { amountCents: null }, { amountCents: 1.1 }, { currency: 'eur' }, { allowedActions: ['charge'] }])('rejects invalid or foreign state %j', async override => {
    fetch.mockResolvedValue(json({ success: true, result: result(override) }))
    await expect(api.fetchCheckoutAttempt(record)).rejects.toMatchObject({ message: api.RECOVERY_ERROR })
  })

  it('handles non-JSON deployment errors without rendering diagnostics', async () => {
    fetch.mockResolvedValue(new Response('<h1>private-routing-detail</h1>', { status: 502 }))
    await expect(api.fetchCheckoutAttempt(record)).rejects.toMatchObject({ message: api.RECOVERY_ERROR })
  })

  it('reacquires guest receipt access after tab closure only for the matching completed order', async () => {
    fetch.mockResolvedValue(json({ success: true, result: { ...result({ status: 'COMPLETED', allowedActions: [] }), orderReference: 'CE-RECOVERED', receiptAccess: 'offline-receipt-proof' } }))
    expect(await api.restoreCheckoutReceipt('CE-RECOVERED')).toBe(true)
    expect(getReceiptAccess('CE-RECOVERED')).toBe('offline-receipt-proof')
    expect(sessionStorage.setItem).toHaveBeenCalledWith('order-receipt:CE-RECOVERED', 'offline-receipt-proof')
    expect(await api.restoreCheckoutReceipt('CE-OTHER')).toBe(false)
    expect(getReceiptAccess('CE-OTHER')).toBe('')
  })
})
