import { beforeEach, describe, expect, it, vi } from 'vitest'
const http = vi.hoisted(() => ({ fetchApi: vi.fn(), parseJsonResponse: vi.fn() }))
vi.mock('@shared/api/http.js', () => http)
import { fetchTaxReadiness } from '../../../src/domains/admin/api/adminTax.api.js'

const readiness = () => ({ provider: 'stripe', mode: 'sandbox', status: 'ready', headOfficeConfigured: true, productCodeConfigured: true, activeRegistrationStates: ['CA'], blockers: [] })
beforeEach(() => { vi.clearAllMocks(); http.fetchApi.mockResolvedValue({}); http.parseJsonResponse.mockResolvedValue({ success: true, readiness: readiness() }) })
describe('read-only tax readiness projection', () => {
  it('uses only the exact protected no-store GET endpoint', async () => {
    expect(await fetchTaxReadiness()).toEqual(readiness())
    expect(http.fetchApi).toHaveBeenCalledWith('/api/admin/payments/tax', { method: 'GET', cache: 'no-store' })
  })
  it('does not retain private provider settings', async () => {
    http.parseJsonResponse.mockResolvedValue({ success: true, readiness: { ...readiness(), head_office: { private: true }, taxId: 'private', secretKey: 'private' } })
    expect(await fetchTaxReadiness()).toEqual(readiness())
  })
  it.each([
    { status: 'active' }, { provider: 'local' }, { mode: 'test' }, { headOfficeConfigured: 1 },
    { activeRegistrationStates: ['not-a-state'] }, { blockers: [{ code: 1, message: 'bad' }] },
  ])('rejects malformed readiness: %j', async invalid => {
    http.parseJsonResponse.mockResolvedValue({ success: true, readiness: { ...readiness(), ...invalid } })
    await expect(fetchTaxReadiness()).rejects.toThrow('Tax setup could not be checked.')
  })
})
