import { beforeEach, describe, expect, it, vi } from 'vitest'
import { betterAuth } from 'better-auth'
import { memoryAdapter } from 'better-auth/adapters/memory'
import { customerAuth } from '../../../src/domains/auth/services/customerAuth.service.js'
import { sessionCookieOptions } from '../../../src/domains/auth/utils/sessionCookies.js'

const origin = 'http://localhost:5173', baseURL = 'http://localhost:3000'
const password = 'audit-only-password-123'
let auth, db, resetUrl
const cookies = response => response.headers.getSetCookie().map(value => value.split(';')[0]).join('; ')
const request = (path, body, cookie = '') => auth.handler(new Request(baseURL + '/api/customer-auth' + path, {
  method: body ? 'POST' : 'GET', headers: { Origin: origin, ...(body ? { 'Content-Type': 'application/json' } : {}), ...(cookie ? { Cookie: cookie } : {}) },
  ...(body ? { body: JSON.stringify(body) } : {}),
}))
beforeEach(() => {
  db = { user: [], account: [], session: [], verification: [] }; resetUrl = null
  // Real installed engine and application options; no Prisma writes, Infra calls or email sends.
  auth = betterAuth({ ...customerAuth.options, baseURL, secret: 'audit-only-signing-secret-not-for-deployment', trustedOrigins: [origin], plugins: [],
    database: memoryAdapter(db), databaseHooks: {},
    emailAndPassword: { ...customerAuth.options.emailAndPassword, sendResetPassword: async ({ url }) => { resetUrl = url } },
    emailVerification: { sendOnSignUp: false },
  })
})
describe('real customer auth engine with isolated provider-free fixtures', () => {
  it('uses host-only HttpOnly local cookies and secure cross-site production cookies without weakening origins', async () => {
    const local = await request('/sign-up/email', { name: 'Fixture', email: 'cookie@example.test', password })
    const attributes = response => response.headers.getSetCookie().map(value => value.split(';').slice(1).join(';')).join(';')
    expect(attributes(local)).toContain('HttpOnly')
    expect(attributes(local)).toContain('SameSite=Lax')
    expect(attributes(local)).not.toContain('Domain=')
    const productionURL = 'https://api.example.test', productionOrigin = 'https://shop.example.test'
    // The engine otherwise skips origin checks under NODE_ENV=test.
    auth = betterAuth({ ...customerAuth.options, baseURL: productionURL, secret: 'audit-only-signing-secret-not-for-deployment', trustedOrigins: [productionOrigin], plugins: [], database: memoryAdapter({ user: [], account: [], session: [], verification: [] }), databaseHooks: {}, advanced: { ...sessionCookieOptions(true), disableOriginCheck: false } })
    const makeRequest = (origin, cookie = '') => auth.handler(new Request(productionURL + '/api/customer-auth/sign-up/email', { method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json', ...(cookie ? { Cookie: cookie } : {}) }, body: JSON.stringify({ name: 'Fixture', email: 'production-cookie@example.test', password }) }))
    const production = await makeRequest(productionOrigin)
    expect(production.status).toBe(200)
    expect(attributes(production)).toContain('SameSite=None')
    expect(attributes(production)).toContain('Secure')
    expect(attributes(production)).toContain('HttpOnly')
    expect(attributes(production)).not.toContain('Domain=')
    expect((await makeRequest('https://untrusted.example.test', cookies(production))).status).toBe(403)
    expect(customerAuth.options.advanced).toEqual(sessionCookieOptions(process.env.NODE_ENV === 'production'))
  })
  it('does not report customer logout success if database revocation fails', async () => {
    const signup = await request('/sign-up/email', { name: 'Audit Fixture', email: 'fixture@example.test', password })
    const context = await auth.$context
    vi.spyOn(context.internalAdapter, 'deleteSession').mockRejectedValueOnce(new Error('private database error'))
    const logout = await request('/sign-out', {}, cookies(signup))
    expect(logout.status).toBe(500); expect(db.session).toHaveLength(1)
    expect(await logout.text()).not.toContain('private database')
  })
  it('keeps signup CUSTOMER-only and strips session tokens from signup, get-session and list-sessions', async () => {
    const signup = await request('/sign-up/email', { name: 'Audit Fixture', email: 'fixture@example.test', password, role: 'ADMIN', status: 'DEACTIVATED' })
    expect(signup.status).toBe(200); const data = await signup.json()
    expect(data.user.role).toBe('CUSTOMER'); expect(data.user.status).toBe('ACTIVE'); expect(data).not.toHaveProperty('token')
    const cookie = cookies(signup)
    expect((await (await request('/get-session', null, cookie)).json()).session).not.toHaveProperty('token')
    const sessions = await (await request('/list-sessions', null, cookie)).json()
    expect(sessions).toHaveLength(1); expect(sessions[0]).not.toHaveProperty('token')
  })
  it('uses single-use expiring reset tokens and revokes old customer sessions', async () => {
    const signup = await request('/sign-up/email', { name: 'Audit Fixture', email: 'fixture@example.test', password })
    const cookie = cookies(signup)
    expect((await request('/request-password-reset', { email: 'fixture@example.test', redirectTo: origin + '/account/reset-password' })).status).toBe(200)
    const token = new URL(resetUrl).pathname.split('/').pop()
    expect((await request('/reset-password', { token, newPassword: 'audit-only-new-password-456' })).status).toBe(200)
    expect(db.session).toHaveLength(0)
    expect((await request('/reset-password', { token, newPassword: 'audit-only-new-password-456' })).status).toBe(400)
    expect(await (await request('/get-session', null, cookie)).json()).toBeNull()
    await request('/request-password-reset', { email: 'fixture@example.test', redirectTo: origin + '/account/reset-password' })
    const expiredToken = new URL(resetUrl).pathname.split('/').pop()
    db.verification.find(value => value.identifier === 'reset-password:' + expiredToken).expiresAt = new Date(Date.now() - 1000)
    expect((await request('/reset-password', { token: expiredToken, newPassword: 'audit-only-next-password-789' })).status).toBe(400)
  })
})
