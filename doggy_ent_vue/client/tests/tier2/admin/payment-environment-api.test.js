import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const http = vi.hoisted(() => ({ fetchApi: vi.fn() }))
vi.mock('../../../src/shared/api/http.js', async original => ({
  ...(await original()), fetchApi: http.fetchApi,
}))
import { fetchAdminPaymentEnvironment } from '../../../src/domains/admin/api/adminPayments.api.js'

function fixture(overrides = {}) {
  return {
    mode: 'sandbox', keyMode: 'sandbox', paymentsEnabled: true,
    canCreatePayments: true, livePaymentsSupported: false, verification: 'verified',
    accountId: 'acct_fixture', expectedAccountId: 'acct_fixture', chargesEnabled: true,
    checkedAt: '2026-10-26T18:00:00.000Z', blockers: [], ...overrides,
  }
}
function reply(environment, success = true) {
  http.fetchApi.mockResolvedValue(new Response(JSON.stringify({ success, environment }), {
    headers: { 'content-type': 'application/json' },
  }))
}

beforeEach(() => {
  vi.resetAllMocks()
  vi.stubGlobal('fetch', vi.fn(() => { throw new Error('Unexpected network request') }))
})
afterEach(() => {
  expect(fetch).not.toHaveBeenCalled()
  vi.unstubAllGlobals()
})

describe('protected read-only payment environment API', () => {
  it('uses a noncached GET through the shared authenticated transport and forwards cancellation', async () => {
    const controller = new AbortController()
    const environment = fixture()
    reply(environment)
    expect(await fetchAdminPaymentEnvironment({ signal: controller.signal })).toEqual(environment)
    expect(http.fetchApi).toHaveBeenCalledExactlyOnceWith('/api/admin/payments/environment', {
      method: 'GET', cache: 'no-store', signal: controller.signal,
    })
  })

  it.each(['sandbox', 'live', 'unconfigured'])('accepts explicit %s configuration without inferring verification', async mode => {
    const environment = fixture({ mode, keyMode: mode, verification: 'unverified', accountId: null, expectedAccountId: null, chargesEnabled: null, checkedAt: null, canCreatePayments: false })
    reply(environment)
    expect(await fetchAdminPaymentEnvironment()).toEqual(environment)
  })

  it('projects only the safe read-model fields, including blockers', async () => {
    reply(fixture({ credential: 'excluded-fixture-field', blockers: [{ code: 'PAUSED', message: 'New payments are paused.', privateDetail: 'excluded-fixture-field' }] }))
    const environment = await fetchAdminPaymentEnvironment()
    expect(environment).not.toHaveProperty('credential')
    expect(environment.blockers).toEqual([{ code: 'PAUSED', message: 'New payments are paused.' }])
  })

  it.each([
    { mode: 'test' }, { keyMode: 'unknown' }, { verification: 'ok' },
    { paymentsEnabled: 'true' }, { canCreatePayments: 1 }, { livePaymentsSupported: true },
    { accountId: 'not-an-account' }, { expectedAccountId: undefined },
    { chargesEnabled: 'yes' }, { checkedAt: 'not-a-date' },
    { blockers: null }, { blockers: [{ code: 'PAUSED' }] },
  ])('rejects malformed or unsupported data: %j', async overrides => {
    reply(fixture(overrides))
    await expect(fetchAdminPaymentEnvironment()).rejects.toThrow('Payment environment unavailable')
  })

  it('rejects a failed envelope and a missing environment', async () => {
    reply(fixture(), false)
    await expect(fetchAdminPaymentEnvironment()).rejects.toThrow('Payment environment unavailable')
    reply(null)
    await expect(fetchAdminPaymentEnvironment()).rejects.toThrow('Payment environment unavailable')
  })

  it.each([200, 502])('handles a non-JSON %s deployment response without displaying its body', async status => {
    http.fetchApi.mockResolvedValue(new Response('<html>private upstream detail</html>', {
      status, headers: { 'content-type': 'text/html' },
    }))
    await expect(fetchAdminPaymentEnvironment()).rejects.toThrow('Payment environment unavailable')
  })
})
