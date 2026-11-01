import { beforeEach, describe, expect, it, vi } from 'vitest'
const http = vi.hoisted(() => ({ fetchApi: vi.fn(), parseJsonResponse: vi.fn() }))
vi.mock('@shared/api/http.js', () => http)
import { fetchPaymentRecoveryCases } from '../../../src/domains/admin/api/adminPaymentRecovery.api.js'
const row = () => ({ id: 'fixture-checkout', status: 'PAID_REVIEW', amountCents: 1500, currency: 'usd', paymentMode: 'sandbox', paymentIntentId: 'pi_fixture', lastErrorCode: 'CHECKOUT_STOCK_UNAVAILABLE', retryCount: 1, createdAt: '2026-10-31T00:00:00Z' })
beforeEach(() => { vi.clearAllMocks(); http.fetchApi.mockResolvedValue({}); http.parseJsonResponse.mockResolvedValue({ success: true, enabled: true, cases: [row()] }) })
describe('read-only staff payment recovery API', () => {
  it('loads only the exact no-store staff endpoint and drops private provider/snapshot fields', async () => {
    http.parseJsonResponse.mockResolvedValue({ success: true, enabled: true, cases: [{ ...row(), snapshot: { customer: 'private' }, recoveryHash: 'private', client_secret: 'private' }] })
    expect(await fetchPaymentRecoveryCases()).toEqual({ enabled: true, cases: [row()] })
    expect(http.fetchApi).toHaveBeenCalledWith('/api/admin/payments/recovery', { method: 'GET', cache: 'no-store' })
  })
  it('honestly reports an unactivated migration/configuration', async () => {
    http.parseJsonResponse.mockResolvedValue({ success: true, enabled: false, cases: [] })
    expect(await fetchPaymentRecoveryCases()).toEqual({ enabled: false, cases: [] })
  })
  it.each([{ status: 'COMPLETED' }, { paymentMode: 'test' }, { currency: 'BAD' }, { amountCents: NaN }, { paymentIntentId: 'https://evil.invalid' }, { lastErrorCode: '<script>' }])('rejects malformed review data: %j', async invalid => {
    http.parseJsonResponse.mockResolvedValue({ success: true, enabled: true, cases: [{ ...row(), ...invalid }] })
    await expect(fetchPaymentRecoveryCases()).rejects.toThrow('Payment review cases could not be loaded.')
  })
})
