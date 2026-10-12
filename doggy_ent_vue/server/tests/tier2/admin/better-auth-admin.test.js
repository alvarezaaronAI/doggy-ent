import { beforeEach, describe, expect, it, vi } from 'vitest'
import { memoryAdapter } from 'better-auth/adapters/memory'
import { hashPassword } from 'better-auth/crypto'
import bcrypt from 'bcryptjs'
import { createAdminAuth } from '../../../src/domains/auth/services/adminAuth.service.js'

let auth, db
const password = 'audit-only-password-123'
const origin = 'http://localhost:5173'
const baseURL = 'http://localhost:3000'
async function request(path, body, cookie = '', requestOrigin = origin) {
  return auth.handler(new Request(baseURL + '/api/admin-auth' + path, {
    method: body ? 'POST' : 'GET',
    headers: { Origin: requestOrigin, ...(body ? { 'Content-Type': 'application/json' } : {}), ...(cookie ? { Cookie: cookie } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {}),
  }))
}
function cookies(response) { return response.headers.getSetCookie().map(cookie => cookie.split(';')[0]).join('; ') }
beforeEach(async () => {
  const now = new Date(), hash = await hashPassword(password)
  db = { user: ['ADMIN', 'CUSTOMER'].map(role => ({ id: role, email: role.toLowerCase() + '@example.test', name: role, role, status: 'ACTIVE', emailVerified: false, createdAt: now, updatedAt: now })),
    account: ['ADMIN', 'CUSTOMER'].map(role => ({ id: role, userId: role, accountId: role, providerId: 'credential', password: hash, createdAt: now, updatedAt: now })), session: [], verification: [] }
  auth = createAdminAuth({ database: memoryAdapter(db), findUser: async id => db.user.find(user => user.id === id),
    secret: 'audit-only-signing-secret-not-for-deployment', baseURL, trustedOrigins: [origin] })
})
describe('actual Better Auth admin engine without database or provider writes', () => {
  it('persists an eight-hour HttpOnly admin session and removes tokens from JSON', async () => {
    const response = await request('/sign-in/email', { email: 'admin@example.test', password })
    expect(response.status).toBe(200)
    const data = await response.json(); expect(data.user.role).toBe('ADMIN'); expect(data).not.toHaveProperty('token')
    const setCookie = response.headers.getSetCookie().join('; ')
    expect(setCookie).toContain('doggy-admin.session_token'); expect(setCookie).toContain('HttpOnly'); expect(setCookie).toContain('SameSite=Lax')
    expect(setCookie).not.toContain('Domain='); expect(db.session).toHaveLength(1)
    expect(db.session[0].expiresAt.getTime() - Date.now()).toBeGreaterThan(7.9 * 60 * 60 * 1000)
    const session = await (await request('/get-session', null, cookies(response))).json()
    expect(session.user.role).toBe('ADMIN'); expect(session.session).not.toHaveProperty('token')
  })
  it('invalidates a copied cookie on logout rather than merely clearing the browser', async () => {
    const login = await request('/sign-in/email', { email: 'admin@example.test', password }), cookie = cookies(login)
    expect((await request('/sign-out', {}, cookie)).status).toBe(200)
    expect(db.session).toHaveLength(0)
    expect(await (await request('/get-session', null, cookie)).json()).toBeNull()
  })
  it('does not report successful logout when database revocation fails', async () => {
    const login = await request('/sign-in/email', { email: 'admin@example.test', password })
    const context = await auth.$context
    vi.spyOn(context.internalAdapter, 'deleteSession').mockRejectedValueOnce(new Error('fixture database unavailable'))
    const response = await request('/sign-out', {}, cookies(login))
    expect(response.status).toBe(500)
    expect(db.session).toHaveLength(1)
    expect(await response.text()).not.toContain('fixture database')
  })
  it('rejects customer login, inactive admins and public admin signup without creating sessions', async () => {
    expect((await request('/sign-in/email', { email: 'customer@example.test', password })).ok).toBe(false)
    db.user[0].status = 'DEACTIVATED'
    expect((await request('/sign-in/email', { email: 'admin@example.test', password })).ok).toBe(false)
    expect((await request('/sign-up/email', { name: 'Injected admin', email: 'new@example.test', password, role: 'ADMIN' })).ok).toBe(false)
    expect(db.session).toHaveLength(0); expect(db.user).toHaveLength(2)
  })
  it('rejects an untrusted login origin and expired or legacy admin cookies', async () => {
    expect((await request('/sign-in/email', { email: 'admin@example.test', password }, '', 'https://untrusted.example.test')).status).toBe(403)
    const login = await request('/sign-in/email', { email: 'admin@example.test', password })
    db.session[0].expiresAt = new Date(Date.now() - 1000)
    expect(await (await request('/get-session', null, cookies(login))).json()).toBeNull()
    expect(await (await request('/get-session', null, 'doggy_admin_session=legacy-fixture')).json()).toBeNull()
  })
  it('supports only deliberately imported bcrypt credentials while new hashes remain scrypt', async () => {
    db.account[0].password = await bcrypt.hash(password, 10)
    expect((await request('/sign-in/email', { email: 'admin@example.test', password })).status).toBe(200)
    expect((await request('/sign-in/email', { email: 'admin@example.test', password: 'wrong-password' })).status).toBe(401)
  })
})
