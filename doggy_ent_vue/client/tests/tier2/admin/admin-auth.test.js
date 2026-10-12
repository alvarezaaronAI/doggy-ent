import { beforeEach, describe, expect, it, vi } from 'vitest'
import fs from 'node:fs'
import { adminReturnPath } from '../../../src/domains/admin/validators/adminAuth.validator.js'
const http = vi.hoisted(() => ({ fetchApi: vi.fn(), parseJsonResponse: vi.fn() }))
vi.mock('../../../src/shared/api/http.js', () => http)
const { loginAdmin } = await import('../../../src/domains/admin/api/adminSession.api.js')
beforeEach(() => vi.resetAllMocks())
describe('admin auth compatibility and deployment guardrails', () => {
  it('requires persisted session confirmation after login, without tokens in app state', async () => {
    http.parseJsonResponse.mockResolvedValueOnce({ success: true }).mockResolvedValueOnce({ authenticated: true, admin: { id: 'fixture', role: 'ADMIN' } })
    expect(await loginAdmin({ email: 'fixture@example.test', password: 'fixture-only' })).toMatchObject({ authenticated: true })
    expect(http.fetchApi.mock.calls.map(call => call[0])).toEqual(['/api/auth/login', '/api/auth/me'])
  })
  it('does not report success when a cookie-backed session cannot be established', async () => {
    http.parseJsonResponse.mockResolvedValueOnce({ success: true }).mockResolvedValueOnce({ authenticated: false })
    await expect(loginAdmin({ email: 'fixture@example.test', password: 'fixture-only' })).rejects.toThrow('not established')
  })
  it('keeps admin redirects inside the admin route group', () => {
    for (const path of ['https://untrusted.example.test', '//untrusted.example.test', '/administrator', '/admin\\other', undefined]) expect(adminReturnPath(path)).toBe('/admin')
    for (const path of ['/admin', '/admin/orders?status=PAID', '/admin/products#edit']) expect(adminReturnPath(path)).toBe(path)
  })
  it('never rewrites API paths to the SPA and configures static security headers', () => {
    const config = JSON.parse(fs.readFileSync(new URL('../../../vercel.json', import.meta.url), 'utf8'))
    const pattern = new RegExp('^' + config.rewrites[0].source + '$')
    for (const path of ['/api', '/api/', '/api/auth/me']) expect(pattern.test(path)).toBe(false)
    for (const path of ['/', '/admin', '/checkout', '/account/orders']) expect(pattern.test(path)).toBe(true)
    expect(config.headers[0].headers).toContainEqual({ key: 'X-Content-Type-Options', value: 'nosniff' })
  })
})
