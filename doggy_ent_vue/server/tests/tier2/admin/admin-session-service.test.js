import { beforeEach, describe, expect, it, vi } from 'vitest'
const api = vi.hoisted(() => ({ getSession: vi.fn(), signInEmail: vi.fn(), signOut: vi.fn() }))
vi.mock('../../../src/domains/auth/services/adminAuth.service.js', () => ({ adminAuth: { api } }))
const { getAdminFromRequest, loginAdmin, forwardAuthCookies } = await import('../../../src/domains/auth/services/auth.service.js')
beforeEach(() => vi.resetAllMocks())
describe('admin service authorization and private responses', () => {
  it('requires the fresh server-owned ADMIN role and ACTIVE status', async () => {
    for (const user of [{ id: 'c', role: 'CUSTOMER', status: 'ACTIVE' }, { id: 'a', role: 'ADMIN', status: 'DEACTIVATED' }, null]) {
      api.getSession.mockResolvedValue({ user })
      expect(await getAdminFromRequest({ headers: {} })).toBeNull()
    }
    api.getSession.mockResolvedValue({ user: { id: 'a', email: 'admin@example.test', role: 'ADMIN', status: 'ACTIVE', name: 'Admin' }, session: { token: 'fixture-token' } })
    expect(await getAdminFromRequest({ headers: {} })).toEqual({ id: 'a', email: 'admin@example.test', role: 'ADMIN', name: 'Admin' })
  })
  it('rejects malformed credentials before auth and does not forward provider data or tokens', async () => {
    await expect(loginAdmin({ email: [], password: {} }, { headers: {} })).rejects.toMatchObject({ statusCode: 400 })
    expect(api.signInEmail).not.toHaveBeenCalled()
    api.signInEmail.mockResolvedValue({ response: { user: { id: 'a', role: 'ADMIN', status: 'ACTIVE' }, token: 'fixture-token' }, headers: new Headers() })
    const result = await loginAdmin({ email: ' ADMIN@example.test ', password: 'fixture-password' }, { headers: {} })
    expect(result).not.toHaveProperty('token'); expect(api.signInEmail.mock.calls[0][0].body.email).toBe('admin@example.test')
    const response = { append: vi.fn(), set: vi.fn() }; forwardAuthCookies(response, new Headers({ 'Set-Cookie': 'fixture-cookie' }))
    expect(response.set).toHaveBeenCalledWith('Cache-Control', 'no-store')
  })
})
