import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { betterAuth } from 'better-auth'
import { memoryAdapter } from 'better-auth/adapters/memory'
import { customerAuth } from '../../../src/domains/auth/services/customerAuth.service.js'
import { sessionCookieOptions } from '../../../src/domains/auth/utils/sessionCookies.js'
import { createCustomerGatewayPlan } from '../../../../client/runtime/customerGateway.js'

const externalAccess = vi.hoisted(() => ({
  email: vi.fn(() => { throw new Error('Email is forbidden in this memory-only fixture') }),
  network: vi.fn(() => { throw new Error('Network is forbidden in this memory-only fixture') }),
}))
vi.mock('../../../src/db/prisma.js', () => ({ prisma: {} }))
vi.mock('../../../src/domains/emails/services/emailProvider.service.js', () => ({
  queueEmail: externalAccess.email,
  getEmailProviderStatus: externalAccess.email,
}))

const origin = 'http://localhost:5173', baseURL = 'http://localhost:3000'
const password = 'audit-only-password-123'
let auth, db, resetUrl, errorLog
const cookies = response => response.headers.getSetCookie().map(value => value.split(';')[0]).join('; ')
const request = (path, body, cookie = '', requestOrigin = origin) => auth.handler(new Request(baseURL + '/api/customer-auth' + path, {
  method: body ? 'POST' : 'GET', headers: { Origin: requestOrigin, ...(body ? { 'Content-Type': 'application/json' } : {}), ...(cookie ? { Cookie: cookie } : {}) },
  ...(body ? { body: JSON.stringify(body) } : {}),
}))
function createFixtureAuth(options = {}) {
  // Real installed engine and application options; no Prisma writes, Infra calls or email sends.
  return betterAuth({ ...customerAuth.options, baseURL, secret: 'audit-only-signing-secret-not-for-deployment', trustedOrigins: [origin], plugins: [],
    database: memoryAdapter(db), databaseHooks: {},
    // Better Auth otherwise skips origin validation under NODE_ENV=test.
    advanced: { ...customerAuth.options.advanced, disableOriginCheck: false },
    emailAndPassword: { ...customerAuth.options.emailAndPassword, sendResetPassword: async ({ url }) => { resetUrl = url } },
    emailVerification: { sendOnSignUp: false },
    ...options,
  })
}
function expectPrivatePayload(payload, privateValues) {
  const serialized = JSON.stringify(payload)
  expect(serialized).not.toMatch(/"(?:token|password|accessToken|refreshToken|idToken)"\s*:/)
  for (const value of privateValues) expect(serialized).not.toContain(value)
}
beforeEach(() => {
  externalAccess.email.mockClear(); externalAccess.network.mockClear()
  vi.stubGlobal('fetch', externalAccess.network)
  errorLog = vi.spyOn(console, 'error').mockImplementation(() => {})
  db = { user: [], account: [], session: [], verification: [] }; resetUrl = null
  auth = createFixtureAuth()
})
afterEach(() => {
  vi.unstubAllGlobals()
  const errors = errorLog.mock.calls
  vi.restoreAllMocks()
  expect(externalAccess.email).not.toHaveBeenCalled()
  expect(externalAccess.network).not.toHaveBeenCalled()
  for (const [line, ...extra] of errors) {
    const payload = JSON.parse(line)
    expect(extra).toEqual([])
    expect(Object.keys(payload).every(key => ['event', 'code', 'status'].includes(key))).toBe(true)
    expect(payload).toMatchObject({ event: 'CUSTOMER_AUTH_FAILED', code: 'UNEXPECTED' })
    expectPrivatePayload(payload, [password, ...db.account.map(account => account.password), ...db.session.map(session => session.token)])
  }
})
describe('real customer auth engine with isolated provider-free fixtures', () => {
  it('enforces the configured password bounds before storing any credential', async () => {
    expect(customerAuth.options.emailAndPassword.minPasswordLength).toBe(8)
    expect(customerAuth.options.emailAndPassword.maxPasswordLength).toBe(128)
    for (const invalidPassword of ['short', 'x'.repeat(129)]) {
      const response = await request('/sign-up/email', { name: 'Fixture', email: 'bounds@example.test', password: invalidPassword })
      expect(response.status).toBe(400)
      expect(db.user).toHaveLength(0); expect(db.account).toHaveLength(0)
    }
  })
  it('preserves full/single Unicode names and stores only a verified password hash privately', async () => {
    for (const [index, name] of ['Alex', '李 明', 'Renée O’Connor'].entries()) {
      const email = `name-${index}@example.test`
      const signup = await request('/sign-up/email', { name, email, password })
      expect(signup.status).toBe(200)
      const payload = await signup.json()
      expect(payload.user.name).toBe(name); expect(payload).not.toHaveProperty('token')
      const credential = db.account.find(account => account.userId === payload.user.id)
      expect(credential.password).toBeTypeOf('string'); expect(credential.password).not.toBe(password)
      expect(JSON.stringify(payload)).not.toContain(credential.password)
      const context = await auth.$context
      expect(await context.password.verify({ hash: credential.password, password })).toBe(true)
      expect(await context.password.verify({ hash: credential.password, password: 'wrong-fixture-password' })).toBe(false)
      expect((await request('/sign-in/email', { email, password })).status).toBe(200)
      expect((await request('/sign-in/email', { email, password: 'wrong-fixture-password' })).status).toBe(401)
    }
  })
  it('uses host-only HttpOnly local cookies and secure cross-site production cookies without weakening origins', async () => {
    const local = await request('/sign-up/email', { name: 'Fixture', email: 'cookie@example.test', password })
    const attributes = response => response.headers.getSetCookie().map(value => value.split(';').slice(1).join(';')).join(';')
    expect(attributes(local)).toContain('HttpOnly')
    expect(attributes(local)).toContain('SameSite=Lax')
    expect(attributes(local)).not.toContain('Domain=')
    const productionURL = 'https://api.example.test', productionOrigin = 'https://shop.example.test'
    db = { user: [], account: [], session: [], verification: [] }
    auth = createFixtureAuth({ baseURL: productionURL, trustedOrigins: [productionOrigin], advanced: { ...sessionCookieOptions(true), disableOriginCheck: false } })
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
  it('honors production first-party gateway/native auth contracts in process', async () => {
    const storefrontOrigin = 'https://shop.example.test', upstreamOrigin = 'https://api.other-example.test'
    const fixtureOptions = { baseURL: upstreamOrigin, trustedOrigins: [storefrontOrigin], advanced: { ...sessionCookieOptions(true), disableOriginCheck: false } }
    const env = { VITE_API_BASE_URL: upstreamOrigin }, email = 'gateway-fixture@example.test'
    auth = createFixtureAuth(fixtureOptions)
    const incomingRequest = (path, body, cookie = '', headers = {}) => new Request(storefrontOrigin + '/api/customer-auth' + path, {
      method: body ? 'POST' : 'GET',
      headers: { Origin: storefrontOrigin, 'Sec-Fetch-Site': 'same-origin',
        ...(body ? { 'Content-Type': 'application/json' } : {}),
        ...(cookie ? { Cookie: cookie + '; doggy-admin.session_token=staff-fixture; _vercel_jwt=hosting-fixture' } : {}), ...headers },
      ...(body ? { body: JSON.stringify(body) } : {}),
    })
    // Only the request plan runs here: no Vercel response forwarding or browser cookie jar.
    const throughGateway = async (path, body, cookie = '') => {
      const incoming = incomingRequest(path, body, cookie), plan = createCustomerGatewayPlan(incoming, env)
      expect(plan).not.toBeNull()
      expect(plan.target.href).toBe(upstreamOrigin + '/api/customer-auth' + path)
      expect(plan.headers.get('origin')).toBe(storefrontOrigin)
      expect(plan.headers.get('sec-fetch-site')).toBe('same-origin')
      expect(plan.headers.get('cookie')).toBe(cookie || null)
      return auth.handler(new Request(plan.target, { method: incoming.method, headers: plan.headers,
        ...(body ? { body: await incoming.text() } : {}) }))
    }
    const expectProductionCookies = response => {
      const setCookies = response.headers.getSetCookie()
      expect(setCookies.length).toBeGreaterThan(0)
      for (const value of setCookies) {
        expect(value).toMatch(/;\s*Secure(?:;|$)/i)
        expect(value).toMatch(/;\s*HttpOnly(?:;|$)/i)
        expect(value).toMatch(/;\s*SameSite=None(?:;|$)/i)
        expect(value).toMatch(/;\s*Path=\/(?:;|$)/i)
        expect(value).not.toMatch(/;\s*Domain=/i)
      }
    }
    const signup = await throughGateway('/sign-up/email', { name: 'Gateway Fixture', email, password })
    expect(signup.status).toBe(200); expectProductionCookies(signup)
    const cookie = cookies(signup), userId = db.user[0].id, privateToken = db.session[0].token
    expect(cookie).toMatch(/^__Secure-better-auth\.session_token=/)
    expectPrivatePayload(await signup.json(), [password, privateToken, db.account[0].password])
    expect(db.user).toHaveLength(1); expect(db.account).toHaveLength(1); expect(db.session).toHaveLength(1)
    for (let read = 0; read < 3; read++) {
      auth = createFixtureAuth(fixtureOptions)
      const retained = await throughGateway('/get-session', null, cookie)
      expect(retained.status).toBe(200)
      const payload = await retained.json()
      expect(payload.user.id).toBe(userId)
      expectPrivatePayload(payload, [password, privateToken, db.account[0].password])
    }
    const original = structuredClone(db), wrongPassword = 'gateway-only-incorrect-password-456'
    const wrong = await throughGateway('/sign-in/email', { email, password: wrongPassword }, cookie)
    expect(wrong.status).toBe(401); expect(wrong.headers.getSetCookie()).toHaveLength(0)
    expectPrivatePayload(await wrong.json(), [email, password, wrongPassword, privateToken, db.account[0].password])
    expect(db).toEqual(original)
    for (const headers of [
      { Origin: 'https://untrusted.example.test' },
      { 'Sec-Fetch-Site': 'cross-site' },
      { 'Sec-Fetch-Site': 'same-site' },
    ]) expect(createCustomerGatewayPlan(incomingRequest('/sign-out', {}, cookie, headers), env)).toBeNull()
    const missingEvidence = new Request(storefrontOrigin + '/api/customer-auth/sign-out', { method: 'POST', headers: { 'Content-Type': 'application/json', Cookie: cookie }, body: '{}' })
    expect(createCustomerGatewayPlan(missingEvidence, env)).toBeNull()
    const bypass = await auth.handler(new Request(upstreamOrigin + '/api/customer-auth/sign-out', {
      method: 'POST', headers: { Origin: 'https://untrusted.example.test', 'Content-Type': 'application/json', Cookie: cookie }, body: '{}',
    }))
    expect(bypass.status).toBe(403)
    expectPrivatePayload(await bypass.json(), [password, privateToken, db.account[0].password])
    expect(db).toEqual(original)
    const logout = await throughGateway('/sign-out', {}, cookie)
    expect(logout.status).toBe(200); expectProductionCookies(logout)
    expect(logout.headers.getSetCookie().some(value => /Max-Age=0/i.test(value))).toBe(true)
    expect(await logout.json()).toEqual({ success: true }); expect(db.session).toHaveLength(0)
    for (let read = 0; read < 2; read++) {
      auth = createFixtureAuth(fixtureOptions)
      const copied = await throughGateway('/get-session', null, cookie)
      expect(copied.status).toBe(200); expect(await copied.json()).toBeNull()
    }
    const login = await throughGateway('/sign-in/email', { email, password })
    expect(login.status).toBe(200); expectProductionCookies(login)
    expectPrivatePayload(await login.json(), [password, privateToken, db.account[0].password, db.session[0].token])
    const retained = await throughGateway('/get-session', null, cookies(login))
    expect(retained.status).toBe(200)
    const payload = await retained.json()
    expect(payload.user.id).toBe(userId)
    expectPrivatePayload(payload, [password, privateToken, db.account[0].password, db.session[0].token])
    expect(db.session).toHaveLength(1)
  })
  it('does not report customer logout success if database revocation fails', async () => {
    const signup = await request('/sign-up/email', { name: 'Audit Fixture', email: 'fixture@example.test', password })
    const context = await auth.$context
    vi.spyOn(context.internalAdapter, 'deleteSession').mockRejectedValueOnce(new Error('private database error'))
    const logout = await request('/sign-out', {}, cookies(signup))
    expect(logout.status).toBe(500); expect(db.session).toHaveLength(1)
    expect(await logout.text()).not.toContain('private database')
  })
  it.each(['fixture@example.test', 'FIXTURE@EXAMPLE.TEST'])('rejects duplicate signup for %s without overwriting the account or creating a session', async email => {
    const signup = await request('/sign-up/email', { name: 'Original Fixture', email: 'fixture@example.test', password })
    expect(signup.status).toBe(200)
    expect((await request('/sign-out', {}, cookies(signup))).status).toBe(200)
    const original = structuredClone(db)
    const replacementPassword = 'audit-only-replacement-password-456'
    const duplicate = await request('/sign-up/email', { name: 'Replacement Fixture', email, password: replacementPassword })
    expect(duplicate.status).toBe(422)
    expect(duplicate.headers.getSetCookie()).toHaveLength(0)
    expect(db).toEqual(original)
    expectPrivatePayload(await duplicate.json(), [password, replacementPassword, db.account[0].password])
    expect((await request('/sign-in/email', { email, password: replacementPassword })).status).toBe(401)
    expect(db.session).toHaveLength(0)
    expect((await request('/sign-in/email', { email, password })).status).toBe(200)
  })
  it('returns the same private error for incorrect and unknown credentials without disturbing a retained session', async () => {
    const signup = await request('/sign-up/email', { name: 'Fixture', email: 'fixture@example.test', password })
    const original = structuredClone(db), errors = []
    const wrongPassword = 'audit-only-incorrect-password-456'
    for (const email of ['fixture@example.test', 'unknown@example.test']) {
      const response = await request('/sign-in/email', { email, password: wrongPassword }, cookies(signup))
      expect(response.status).toBe(401)
      expect(response.headers.getSetCookie()).toHaveLength(0)
      const payload = await response.json()
      expectPrivatePayload(payload, [email, wrongPassword, db.account[0].password, db.session[0].token])
      errors.push(payload)
    }
    expect(errors[0]).toEqual(errors[1])
    expect(db).toEqual(original)
    expect((await (await request('/get-session', null, cookies(signup))).json()).user.id).toBe(db.user[0].id)
  })
  it('retains a persisted session across fresh engine requests, but never authenticates a missing or tampered cookie', async () => {
    const signup = await request('/sign-up/email', { name: 'Fixture', email: 'fixture@example.test', password })
    const cookie = cookies(signup), sessionId = db.session[0].id, userId = db.user[0].id
    expect(signup.headers.getSetCookie().some(value => /Max-Age=[1-9]\d*/i.test(value))).toBe(true)
    const context = await auth.$context
    expect(db.session[0].expiresAt.getTime() - Date.now()).toBeGreaterThan((context.sessionConfig.expiresIn - 5) * 1000)
    for (let read = 0; read < 3; read++) {
      auth = createFixtureAuth()
      const response = await request('/get-session', null, cookie)
      expect(response.status).toBe(200)
      const payload = await response.json()
      expect(payload.user.id).toBe(userId); expect(payload.session.id).toBe(sessionId)
      expectPrivatePayload(payload, [password, db.account[0].password, db.session[0].token])
    }
    expect(await (await request('/get-session')).json()).toBeNull()
    expect(await (await request('/get-session', null, cookie + 'tampered')).json()).toBeNull()
    expect(db.session).toHaveLength(1)
  })
  it('expires a persisted customer session and rejects every copied cookie without deleting the account', async () => {
    const signup = await request('/sign-up/email', { name: 'Fixture', email: 'fixture@example.test', password })
    const cookie = cookies(signup)
    db.session[0].expiresAt = new Date(Date.now() - 1000)
    const expired = await request('/get-session', null, cookie)
    expect(expired.status).toBe(200); expect(await expired.json()).toBeNull()
    expect(expired.headers.getSetCookie().some(value => /Max-Age=0/i.test(value))).toBe(true)
    expect(await (await request('/get-session', null, cookie)).json()).toBeNull()
    expect(db.user).toHaveLength(1); expect(db.account).toHaveLength(1)
    expect((await request('/sign-in/email', { email: 'fixture@example.test', password })).status).toBe(200)
  })
  it.each([
    { label: 'application options', options: {} },
    { label: 'internal-token control', options: { session: { ...customerAuth.options.session, additionalFields: {} } } },
  ])('renews an aged but unexpired customer session without exposing its private token ($label)', async ({ options }) => {
    auth = createFixtureAuth(options)
    const signup = await request('/sign-up/email', { name: 'Fixture', email: 'fixture@example.test', password })
    const cookie = cookies(signup), context = await auth.$context
    const { expiresIn, updateAge } = context.sessionConfig
    const startedAt = new Date(Date.now() - (updateAge + 60) * 1000)
    db.session[0].createdAt = startedAt; db.session[0].updatedAt = startedAt
    db.session[0].expiresAt = new Date(startedAt.getTime() + expiresIn * 1000)
    const oldExpiry = db.session[0].expiresAt.getTime(), privateToken = db.session[0].token
    expect(oldExpiry).toBeGreaterThan(Date.now())
    const renewed = await request('/get-session', null, cookie)
    expect(renewed.status).toBe(200)
    const payload = await renewed.json()
    expect(payload.user.id).toBe(db.user[0].id)
    expect(db.session).toHaveLength(1); expect(db.session[0].expiresAt.getTime()).toBeGreaterThan(oldExpiry)
    expectPrivatePayload(payload, [password, db.account[0].password, privateToken])
    expect((await (await request('/get-session', null, cookie)).json()).user.id).toBe(db.user[0].id)
  })
  it('revokes only the logged-out session and rejects its copied cookie while another device remains signed in', async () => {
    const signup = await request('/sign-up/email', { name: 'Fixture', email: 'fixture@example.test', password })
    const otherDevice = await request('/sign-in/email', { email: 'fixture@example.test', password })
    expect(otherDevice.status).toBe(200); expect(db.session).toHaveLength(2)
    const cookie = cookies(signup), otherCookie = cookies(otherDevice)
    const logout = await request('/sign-out', {}, cookie)
    expect(logout.status).toBe(200); expect(await logout.json()).toEqual({ success: true })
    expect(logout.headers.getSetCookie().some(value => /Max-Age=0/i.test(value))).toBe(true)
    expect(db.session).toHaveLength(1)
    for (let read = 0; read < 2; read++) expect(await (await request('/get-session', null, cookie)).json()).toBeNull()
    expect((await (await request('/get-session', null, otherCookie)).json()).user.id).toBe(db.user[0].id)
    expect((await request('/sign-in/email', { email: 'fixture@example.test', password })).status).toBe(200)
  })
  it('keeps signup CUSTOMER-only and strips credential/session tokens from signup, sign-in, get-session and list-sessions', async () => {
    const signup = await request('/sign-up/email', { name: 'Audit Fixture', email: 'fixture@example.test', password, role: 'ADMIN', status: 'DEACTIVATED' })
    expect(signup.status).toBe(200); const data = await signup.json()
    expect(data.user.role).toBe('CUSTOMER'); expect(data.user.status).toBe('ACTIVE'); expect(data).not.toHaveProperty('token')
    const cookie = cookies(signup)
    expect((await (await request('/get-session', null, cookie)).json()).session).not.toHaveProperty('token')
    const sessions = await (await request('/list-sessions', null, cookie)).json()
    expect(sessions).toHaveLength(1); expect(sessions[0]).not.toHaveProperty('token')
    const login = await request('/sign-in/email', { email: 'fixture@example.test', password })
    expect(login.status).toBe(200)
    expectPrivatePayload(await login.json(), [password, db.account[0].password, ...db.session.map(session => session.token)])
  })
  it('uses private single-use reset tokens, replaces the password and revokes all affected customer sessions only', async () => {
    const signup = await request('/sign-up/email', { name: 'Audit Fixture', email: 'fixture@example.test', password })
    const login = await request('/sign-in/email', { email: 'fixture@example.test', password })
    const otherCustomer = await request('/sign-up/email', { name: 'Other Fixture', email: 'other@example.test', password })
    expect(signup.status).toBe(200); expect(login.status).toBe(200); expect(otherCustomer.status).toBe(200)
    expect(db.session).toHaveLength(3)
    const oldCookies = [cookies(signup), cookies(login)], otherCookie = cookies(otherCustomer)
    const resetRequest = await request('/request-password-reset', { email: 'fixture@example.test', redirectTo: origin + '/account/reset-password' })
    expect(resetRequest.status).toBe(200)
    const token = new URL(resetUrl).pathname.split('/').pop()
    const expiresIn = db.verification.find(value => value.identifier === 'reset-password:' + token).expiresAt.getTime() - Date.now()
    expect(expiresIn).toBeGreaterThan(3595 * 1000); expect(expiresIn).toBeLessThanOrEqual(3600 * 1000)
    const newPassword = 'audit-only-new-password-456', oldHash = db.account[0].password
    const privateValues = [password, newPassword, oldHash, token, resetUrl, ...db.session.map(session => session.token)]
    expectPrivatePayload(await resetRequest.json(), privateValues)
    const reset = await request('/reset-password', { token, newPassword })
    expect(reset.status).toBe(200); expectPrivatePayload(await reset.json(), privateValues)
    expect(db.session).toHaveLength(1)
    expect(db.verification.some(value => value.identifier === 'reset-password:' + token)).toBe(false)
    expect(db.account[0].password).not.toBe(oldHash)
    const reused = await request('/reset-password', { token, newPassword: password })
    expect(reused.status).toBe(400); expectPrivatePayload(await reused.json(), privateValues)
    for (const cookie of oldCookies) expect(await (await request('/get-session', null, cookie)).json()).toBeNull()
    expect((await (await request('/get-session', null, otherCookie)).json()).user.id).toBe(db.user[1].id)
    expect((await request('/sign-in/email', { email: 'fixture@example.test', password })).status).toBe(401)
    expect((await request('/sign-in/email', { email: 'fixture@example.test', password: newPassword })).status).toBe(200)
  })
  it('rejects an expired reset without changing credentials or revoking valid sessions', async () => {
    const signup = await request('/sign-up/email', { name: 'Fixture', email: 'fixture@example.test', password })
    expect((await request('/request-password-reset', { email: 'fixture@example.test', redirectTo: origin + '/account/reset-password' })).status).toBe(200)
    const expiredToken = new URL(resetUrl).pathname.split('/').pop()
    db.verification.find(value => value.identifier === 'reset-password:' + expiredToken).expiresAt = new Date(Date.now() - 1000)
    const originalHash = db.account[0].password, originalSessions = structuredClone(db.session)
    const expired = await request('/reset-password', { token: expiredToken, newPassword: 'audit-only-next-password-789' })
    expect(expired.status).toBe(400)
    expectPrivatePayload(await expired.json(), [expiredToken, resetUrl, originalHash])
    expect(db.account[0].password).toBe(originalHash); expect(db.session).toEqual(originalSessions)
    expect((await (await request('/get-session', null, cookies(signup))).json()).user.id).toBe(db.user[0].id)
    expect((await request('/sign-in/email', { email: 'fixture@example.test', password })).status).toBe(200)
  })
  it.each([undefined, '', 'nonexistent-fixture-reset-proof'])('rejects invalid reset proof %s without changing credentials or sessions', async token => {
    await request('/sign-up/email', { name: 'Fixture', email: 'fixture@example.test', password })
    const original = structuredClone(db)
    const response = await request('/reset-password', { token, newPassword: 'audit-only-next-password-789' })
    expect(response.status).toBe(400)
    expectPrivatePayload(await response.json(), [password, db.account[0].password, db.session[0].token, ...(token ? [token] : [])])
    expect(db).toEqual(original)
  })
  it('does not consume valid reset proof when the replacement password fails validation', async () => {
    await request('/sign-up/email', { name: 'Fixture', email: 'fixture@example.test', password })
    await request('/request-password-reset', { email: 'fixture@example.test', redirectTo: origin + '/account/reset-password' })
    const token = new URL(resetUrl).pathname.split('/').pop(), original = structuredClone(db)
    for (const newPassword of ['tiny!', 'x'.repeat(129)]) {
      const invalid = await request('/reset-password', { token, newPassword })
      expect(invalid.status).toBe(400)
      expectPrivatePayload(await invalid.json(), [token, newPassword, db.account[0].password])
      expect(db).toEqual(original)
    }
    expect((await request('/reset-password', { token, newPassword: 'audit-only-next-password-789' })).status).toBe(200)
    expect(db.session).toHaveLength(0)
  })
  it.each(['https://untrusted.example.test', 'http://localhost:51730', 'null'])('rejects auth mutations from origin %s before changing state or creating reset proof', async untrustedOrigin => {
    const signup = await request('/sign-up/email', { name: 'Fixture', email: 'fixture@example.test', password })
    const cookie = cookies(signup)
    await request('/request-password-reset', { email: 'fixture@example.test', redirectTo: origin + '/account/reset-password' })
    const capturedResetUrl = resetUrl, token = new URL(resetUrl).pathname.split('/').pop(), original = structuredClone(db)
    const paths = [
      ['/sign-up/email', { name: 'Untrusted Fixture', email: 'untrusted@example.test', password }],
      ['/sign-in/email', { email: 'fixture@example.test', password }],
      ['/request-password-reset', { email: 'fixture@example.test', redirectTo: origin + '/account/reset-password' }],
      ['/reset-password', { token, newPassword: 'audit-only-next-password-789' }],
      ['/sign-out', {}],
    ]
    for (const [path, body] of paths) {
      const response = await request(path, body, cookie, untrustedOrigin)
      expect(response.status).toBe(403)
      expect(response.headers.getSetCookie()).toHaveLength(0)
      expectPrivatePayload(await response.json(), [password, token, capturedResetUrl, db.account[0].password, db.session[0].token])
      expect(db).toEqual(original); expect(resetUrl).toBe(capturedResetUrl)
    }
    expect((await request('/sign-in/email', { email: 'fixture@example.test', password }, '', untrustedOrigin)).status).toBe(403)
    expect(db).toEqual(original)
  })
  it.each([
    'https://untrusted.example.test/account',
    'http://localhost:5173.untrusted.example.test/account',
    '//untrusted.example.test/account',
    'javascript:alert(1)',
  ])('rejects untrusted auth return URL %s before creating accounts, sessions or reset proof', async returnURL => {
    await request('/sign-up/email', { name: 'Fixture', email: 'fixture@example.test', password })
    const original = structuredClone(db)
    for (const [path, body] of [
      ['/sign-up/email', { name: 'Untrusted Fixture', email: 'untrusted@example.test', password, callbackURL: returnURL }],
      ['/sign-in/email', { email: 'fixture@example.test', password, callbackURL: returnURL }],
      ['/request-password-reset', { email: 'fixture@example.test', redirectTo: returnURL }],
    ]) {
      const response = await request(path, body)
      expect(response.status).toBe(403)
      expect(response.headers.get('location')).toBeNull()
      expect(db).toEqual(original); expect(resetUrl).toBeNull()
    }
  })
  it('never redirects reset proof to an untrusted callback, while allowing the configured checkout/account return', async () => {
    await request('/sign-up/email', { name: 'Fixture', email: 'fixture@example.test', password })
    const callbackURL = origin + '/checkout?from=account#payment'
    const login = await request('/sign-in/email', { email: 'fixture@example.test', password, callbackURL })
    expect(login.status).toBe(200); expect(login.headers.get('location')).toBe(callbackURL)
    expectPrivatePayload(await login.json(), [password, db.account[0].password, ...db.session.map(session => session.token)])
    const redirectTo = origin + '/account/reset-password'
    const response = await request('/request-password-reset', { email: 'fixture@example.test', redirectTo })
    expect(response.status).toBe(200)
    const link = new URL(resetUrl), token = link.pathname.split('/').pop()
    expect(link.searchParams.get('callbackURL')).toBe(redirectTo)
    const original = structuredClone(db)
    for (const untrustedURL of ['https://untrusted.example.test/reset', '//untrusted.example.test/reset']) {
      const query = new URLSearchParams({ callbackURL: untrustedURL })
      const rejected = await request('/reset-password/' + token + '?' + query)
      expect(rejected.status).toBe(403); expect(rejected.headers.get('location')).toBeNull()
      expectPrivatePayload(await rejected.json(), [token, resetUrl])
      expect(db).toEqual(original)
    }
    const allowed = await request('/reset-password/' + token + '?' + new URLSearchParams({ callbackURL: redirectTo }))
    expect(allowed.status).toBe(302)
    const location = new URL(allowed.headers.get('location'))
    expect(location.origin + location.pathname).toBe(redirectTo)
    expect(location.searchParams.get('token')).toBe(token)
    expect(db).toEqual(original)
  })
})
