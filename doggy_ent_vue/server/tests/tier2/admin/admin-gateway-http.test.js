import { once } from 'node:events'
import { request as httpRequest } from 'node:http'
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { memoryAdapter } from 'better-auth/adapters/memory'
import { hashPassword } from 'better-auth/crypto'

const state = vi.hoisted(() => ({
  handler: vi.fn(), getSession: vi.fn(), signInEmail: vi.fn(), signOut: vi.fn(),
  customerHandler: vi.fn(), customerSession: vi.fn(), dbAccess: vi.fn(), routingProbe: vi.fn(), providerAccess: vi.fn(),
}))
vi.mock('../../../src/db/prisma.js', () => ({ prisma: new Proxy({}, {
  get: (_target, key) => key === '$queryRaw' ? state.routingProbe : new Proxy(state.dbAccess, { get: () => state.dbAccess }),
}) }))
vi.mock('../../../src/domains/auth/services/adminAuth.service.js', async importOriginal => ({
  ...await importOriginal(),
  adminAuth: { handler: state.handler, api: { getSession: state.getSession, signInEmail: state.signInEmail, signOut: state.signOut } },
}))
vi.mock('../../../src/domains/auth/services/customerAuth.service.js', () => ({
  customerAuth: { handler: state.customerHandler },
  getCustomerSessionFromRequest: state.customerSession,
  getCustomerUserFromRequest: vi.fn(),
}))
vi.mock('../../../src/domains/payments/services/stripe.payment.js', () => ({
  createStripePaymentIntent: state.providerAccess,
  retrieveStripePaymentIntent: state.providerAccess,
  validateStripePaymentIntent: state.providerAccess,
}))
vi.mock('../../../src/domains/products/controllers/products.controller.js', () => {
  const read = (_req, res) => res.json({ fixture: 'catalog' })
  return { getAllProducts: read, getProductBySlug: read, getAdminProducts: read,
    createNewProduct: read, updateExistingProduct: read, updateProductImages: read, deleteExistingProduct: read }
})
vi.mock('../../../src/domains/checkout/controllers/checkout.controller.js', () => {
  const read = (_req, res) => res.json({ fixture: 'guest-checkout' })
  return { getCheckoutShippingOptionsController: read, postCheckoutShippingRatesController: read,
    previewCheckoutController: read, createCheckoutController: read, getCheckoutOrderController: read }
})

const synthetic = 'gateway-http-fixture-only-never-deploy-123456'
const fixturePassword = 'fixture-only-password-123456'
const gateway = { 'x-shop-admin-gateway': synthetic }
const denied = { success: false, message: 'Forbidden.' }
let server, origin, engine, db

beforeAll(async () => {
  vi.stubEnv('NODE_ENV', 'production')
  vi.stubEnv('BETTER_AUTH_SECRET', 'synthetic-auth-engine-secret-never-deploy-123456')
  vi.stubEnv('BETTER_AUTH_URL', 'https://api.example.test')
  vi.stubEnv('CLIENT_URL', 'https://admin.example.test')
  vi.stubEnv('FRONTEND_URL', '')
  const { createAdminAuth } = await import('../../../src/domains/auth/services/adminAuth.service.js')
  const now = new Date(), password = await hashPassword(fixturePassword)
  db = {
    user: ['ADMIN', 'CUSTOMER'].map(role => ({ id: role, email: `${role.toLowerCase()}@example.test`, name: role, role, status: 'ACTIVE', createdAt: now, updatedAt: now })),
    account: ['ADMIN', 'CUSTOMER'].map(role => ({ id: role, userId: role, accountId: role, providerId: 'credential', password, createdAt: now, updatedAt: now })),
    session: [], verification: [],
  }
  engine = createAdminAuth({ database: memoryAdapter(db), findUser: async id => db.user.find(user => user.id === id),
    secret: 'synthetic-auth-engine-secret-never-deploy-123456', baseURL: 'https://api.example.test', trustedOrigins: ['https://admin.example.test'] })
  const { default: app } = await import('../../../src/app.js')
  server = app.listen(0, '127.0.0.1')
  await once(server, 'listening')
  origin = `http://127.0.0.1:${server.address().port}`
})

beforeEach(() => {
  vi.clearAllMocks()
  vi.stubEnv('ADMIN_GATEWAY_REQUIRED', 'true')
  vi.stubEnv('ADMIN_GATEWAY_SECRET', synthetic)
  vi.stubEnv('SHIPPO_WEBHOOK_SECRET', 'synthetic-webhook-fixture')
  vi.stubEnv('PAYMENT_MODE', undefined)
  vi.stubEnv('PAYMENTS_ENABLED', 'false')
  vi.stubEnv('STRIPE_SECRET_KEY', undefined)
  vi.stubEnv('STRIPE_EXPECTED_ACCOUNT_ID', undefined)
  vi.stubEnv('TAX_PROVIDER', 'none')
  db.session.length = 0
  for (const user of db.user) { user.status = 'ACTIVE'; user.role = user.id }
  state.handler.mockImplementation(request => engine.handler(request))
  state.getSession.mockImplementation(input => engine.api.getSession(input))
  state.signInEmail.mockImplementation(input => engine.api.signInEmail(input))
  state.signOut.mockImplementation(input => engine.api.signOut(input))
  state.customerHandler.mockImplementation(() => Response.json({ fixture: 'customer-auth' }))
  state.customerSession.mockResolvedValue(null)
  state.dbAccess.mockImplementation(() => { throw new Error('Unexpected fixture storage access.') })
  state.routingProbe.mockResolvedValue([{ '?column?': 1 }])
  state.providerAccess.mockImplementation(() => { throw new Error('Unexpected fixture provider access.') })
})

afterEach(() => {
  expect(state.dbAccess).not.toHaveBeenCalled()
  expect(state.providerAccess).not.toHaveBeenCalled()
})
afterAll(async () => {
  if (server) await new Promise(resolve => server.close(resolve))
  vi.unstubAllEnvs()
})

function request(path, { method = 'GET', headers = {}, body } = {}) {
  return fetch(origin + path, { method, headers: { ...(body ? { 'Content-Type': 'application/json' } : {}), ...headers }, ...(body ? { body: JSON.stringify(body) } : {}) })
}
async function login(path = '/api/auth/login') {
  return request(path, { method: 'POST', headers: gateway, body: { email: 'admin@example.test', password: fixturePassword } })
}
function cookie(response) { return response.headers.getSetCookie().map(value => value.split(';')[0]).join('; ') }

describe('actual HTTP mounts with synthetic persisted Better Auth sessions', () => {
  it('keeps payment configuration public and minimal, but account context staff-only', async () => {
    const response = await request('/api/checkout/payment-configuration')
    expect(response.status).toBe(200)
    expect(response.headers.get('cache-control')).toBe('no-store')
    const body = await response.json()
    expect(body.success).toBe(true)
    expect(body.configuration).toMatchObject({ mode: 'unconfigured', enabled: false })
    expect(Object.keys(body.configuration).sort()).toEqual(['enabled', 'message', 'mode'])
    expect(JSON.stringify(body)).not.toContain('acct_')
    expect((await request('/api/admin/payments/environment')).status).toBe(403)
    expect((await request('/api/admin/payments/environment', { headers: gateway })).status).toBe(401)
    expect((await request('/api/admin/payments/tax')).status).toBe(403)
    expect((await request('/api/admin/payments/tax', { headers: gateway })).status).toBe(401)
  })

  it('exposes read-only payment blockers through an actual persisted staff session', async () => {
    const signedIn = await login()
    const headers = { ...gateway, Cookie: cookie(signedIn) }
    const response = await request('/api/admin/payments/environment', { headers })
    expect(response.status).toBe(200)
    expect(response.headers.get('cache-control')).toBe('no-store')
    const body = await response.json()
    expect(body.environment).toMatchObject({ mode: 'unconfigured', verification: 'unverified', canCreatePayments: false, livePaymentsSupported: false })
    expect(body.environment.blockers).toContainEqual(expect.objectContaining({ code: 'MODE_UNCONFIGURED' }))
    expect(JSON.stringify(body)).not.toContain('secretKey')
    expect((await request('/api/admin/payments/environment', { method: 'POST', headers })).status).toBe(404)
  })

  it('exposes only disabled tax readiness to persisted staff, with no storage or provider access', async () => {
    const signedIn = await login(), headers = { ...gateway, Cookie: cookie(signedIn) }
    const response = await request('/api/admin/payments/tax', { headers })
    expect(response.status).toBe(200)
    expect(response.headers.get('cache-control')).toBe('no-store')
    const body = await response.json()
    expect(body.success).toBe(true)
    expect(body.readiness).toEqual({ provider: 'none', mode: 'unconfigured', status: 'disabled', headOfficeConfigured: false, productCodeConfigured: false, activeRegistrationStates: [], checkedAt: null, blockers: [] })
    expect((await request('/api/admin/payments/tax', { method: 'POST', headers })).status).toBe(404)
    db.user[0].role = 'CUSTOMER'
    expect((await request('/api/admin/payments/tax', { headers })).status).toBe(401)
  })

  it('gates every compatibility endpoint before login, logout or session access', async () => {
    for (const [method, path] of [['POST', '/login'], ['POST', '/logout'], ['GET', '/me'], ['GET', '/data-target'], ['GET', '/unknown']]) {
      const response = await request('/api/auth' + path, { method, headers: { Origin: 'https://admin.example.test', 'X-User-Role': 'ADMIN' } })
      expect(response.status).toBe(403)
      expect(await response.json()).toEqual(denied)
      expect(response.headers.get('cache-control')).toBe('no-store')
    }
    expect(state.signInEmail).not.toHaveBeenCalled()
    expect(state.signOut).not.toHaveBeenCalled()
    expect(state.getSession).not.toHaveBeenCalled()
  })

  it('gates native paths, their root and unknown endpoints before the engine', async () => {
    for (const [method, path] of [['POST', '/sign-in/email'], ['POST', '/sign-out'], ['GET', '/get-session'], ['GET', ''], ['POST', '/sign-up/email']]) {
      expect((await request('/api/admin-auth' + path, { method })).status).toBe(403)
    }
    expect(state.handler).not.toHaveBeenCalled()
    expect((await request('/api/admin-auth/sign-up/email', { method: 'POST', headers: gateway })).status).toBe(404)
    expect(state.handler).not.toHaveBeenCalled()
  })

  it('blocks current protected route families and legacy aliases before session lookup', async () => {
    for (const path of ['/api/products/admin/library', '/api/promos', '/api/admin/promos', '/api/campaigns', '/api/admin/campaigns', '/api/admin/orders', '/api/admin/customers', '/api/admin/notifications', '/api/admin/email-templates', '/api/admin/media', '/api/admin/storefront', '/api/admin/order-issues', '/api/admin/internal-issues', '/api/admin/shipments', '/api/admin/payments/environment']) {
      expect((await request(path)).status).toBe(403)
    }
    expect(state.getSession).not.toHaveBeenCalled()
  })

  it('requires a persisted session even with the correct gateway and forged identity headers', async () => {
    const headers = { ...gateway, 'X-User-Role': 'ADMIN', 'X-User-Status': 'ACTIVE' }
    for (const path of ['/api/auth/me', '/api/auth/data-target', '/api/products/admin/library', '/api/admin/orders', '/api/admin/payments/environment']) {
      expect((await request(path, { headers })).status).toBe(401)
    }
    const native = await request('/api/admin-auth/get-session', { headers })
    expect(native.status).toBe(200)
    expect(await native.json()).toBeNull()
    expect(db.session).toHaveLength(0)
  })

  it('supports compatibility login/read/logout and rejects a revoked cookie', async () => {
    const signedIn = await login()
    expect(signedIn.status).toBe(200)
    const headers = { ...gateway, Cookie: cookie(signedIn) }
    expect(db.session).toHaveLength(1)
    expect((await request('/api/auth/me', { headers })).status).toBe(200)
    expect((await request('/api/auth/data-target', { headers })).status).toBe(200)
    expect((await request('/api/products/admin/library', { headers })).status).toBe(200)
    const calls = state.getSession.mock.calls.length
    expect((await request('/api/products/admin/library', { headers: { Cookie: headers.Cookie } })).status).toBe(403)
    expect(state.getSession).toHaveBeenCalledTimes(calls)
    expect((await request('/api/auth/logout', { method: 'POST', headers })).status).toBe(200)
    expect(db.session).toHaveLength(0)
    expect((await request('/api/auth/me', { headers })).status).toBe(401)
  })

  it('checks database routing only after gateway and fresh persisted admin authorization', async () => {
    const signedIn = await login(), headers = { ...gateway, Cookie: cookie(signedIn) }
    expect((await request('/api/auth/data-target')).status).toBe(403)
    expect((await request('/api/auth/data-target', { headers: gateway })).status).toBe(401)
    expect(state.routingProbe).not.toHaveBeenCalled()
    const response = await request('/api/auth/data-target', { headers })
    expect(response.status).toBe(200)
    expect(response.headers.get('cache-control')).toBe('no-store')
    expect(await response.json()).toMatchObject({ success: true, routing: { apiOrigin: 'https://api.example.test', databaseConnected: true, transport: 'protected-gateway', environment: 'production' } })
    expect(state.routingProbe).toHaveBeenCalledOnce()
    db.user[0].role = 'CUSTOMER'
    expect((await request('/api/auth/data-target', { headers })).status).toBe(401)
    expect(state.routingProbe).toHaveBeenCalledOnce()
  })

  it('keeps fresh ADMIN and ACTIVE checks after gateway admission', async () => {
    const signedIn = await login(), headers = { ...gateway, Cookie: cookie(signedIn) }
    expect(signedIn.status).toBe(200)
    for (const change of [{ role: 'CUSTOMER', status: 'ACTIVE' }, { role: 'ADMIN', status: 'DEACTIVATED' }]) {
      Object.assign(db.user[0], change)
      expect((await request('/api/products/admin/library', { headers })).status).toBe(401)
      expect((await request('/api/auth/me', { headers })).status).toBe(401)
    }
  })

  it('keeps native login/session/logout, rejects customer login and blocks direct-session bypass', async () => {
    const signedIn = await login('/api/admin-auth/sign-in/email')
    expect(signedIn.status).toBe(200)
    const headers = { ...gateway, Cookie: cookie(signedIn) }
    const session = await request('/api/admin-auth/get-session', { headers })
    expect((await session.json()).user.role).toBe('ADMIN')
    const calls = state.handler.mock.calls.length
    expect((await request('/api/admin-auth/get-session', { headers: { Cookie: headers.Cookie } })).status).toBe(403)
    expect(state.handler).toHaveBeenCalledTimes(calls)
    expect((await request('/api/admin-auth/sign-out', { method: 'POST', headers, body: {} })).status).toBe(200)
    expect(await (await request('/api/admin-auth/get-session', { headers })).json()).toBeNull()
    expect((await request('/api/admin-auth/sign-in/email', { method: 'POST', headers: gateway, body: { email: 'customer@example.test', password: fixturePassword } })).ok).toBe(false)
    expect(db.session).toHaveLength(0)
  })

  it('rejects duplicate or oversized fields over HTTP and never accepts query/cookie substitutes', async () => {
    for (const headers of [{ 'x-shop-admin-gateway': 'x'.repeat(1025) }, { Cookie: `x-shop-admin-gateway=${synthetic}` }, { 'x-shop-admin-gateway': `${synthetic}, ${synthetic}` }]) {
      const response = await request('/api/auth/me?x-shop-admin-gateway=' + synthetic, { headers })
      expect(response.status).toBe(403)
      expect(await response.json()).toEqual(denied)
    }
    const status = await new Promise((resolve, reject) => {
      const req = httpRequest(origin + '/api/auth/me', { headers: ['Host', new URL(origin).host, 'X-Shop-Admin-Gateway', synthetic, 'x-shop-admin-gateway', synthetic] }, res => { res.resume(); resolve(res.statusCode) })
      req.on('error', reject); req.end()
    })
    expect(status).toBe(403)
    expect(state.getSession).not.toHaveBeenCalled()
  })

  it('preserves public products, customer auth/account, guest checkout and webhook behavior', async () => {
    expect((await request('/api/products')).status).toBe(200)
    expect((await request('/api/customer-auth/get-session')).status).toBe(200)
    expect((await request('/api/account')).status).toBe(401)
    expect(state.customerSession).toHaveBeenCalledOnce()
    expect((await request('/api/checkout/preview', { method: 'POST', body: {} })).status).toBe(200)
    expect((await request('/api/webhooks/shippo', { method: 'POST' })).status).toBe(401)
    expect((await request('/api/webhooks/shippo', { method: 'POST', headers: { 'x-shippo-webhook-secret': 'synthetic-webhook-fixture' } })).status).toBe(200)
  })

  it('retains legacy compatibility and native access when disabled', async () => {
    vi.stubEnv('ADMIN_GATEWAY_REQUIRED', 'false')
    const signedIn = await request('/api/auth/login', { method: 'POST', body: { email: 'admin@example.test', password: fixturePassword } })
    expect(signedIn.status).toBe(200)
    const headers = { Cookie: cookie(signedIn) }
    expect((await request('/api/auth/me', { headers })).status).toBe(200)
    expect((await request('/api/products/admin/library', { headers })).status).toBe(200)
    expect((await request('/api/admin-auth/get-session', { headers })).status).toBe(200)
  })
})
