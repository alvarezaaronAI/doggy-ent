import assert from 'node:assert/strict'
import { afterEach, test } from 'node:test'
import { createGatewayPlan, getGatewayConfig, isAllowedApiRequest } from '../runtime/gateway.js'
import proxy from '../proxy.js'

const env = { ADMIN_API_ORIGIN: 'https://api.example.test', ADMIN_GATEWAY_SECRET: 'synthetic-gateway-material-for-tests-only' }
const original = { ...process.env }
afterEach(() => {
  for (const key of ['ADMIN_API_ORIGIN', 'ADMIN_GATEWAY_SECRET']) {
    if (original[key] === undefined) delete process.env[key]
    else process.env[key] = original[key]
  }
})

test('gateway configuration is strict, bounded and never echoes bad values', () => {
  assert.equal(getGatewayConfig(env).origin, env.ADMIN_API_ORIGIN)
  for (const value of ['', 'http://api.example.test', 'https://localhost', 'https://name:private@api.example.test', 'https://api.example.test/path', 'https://api.example.test/?x=1']) {
    assert.throws(() => getGatewayConfig({ ...env, ADMIN_API_ORIGIN: value }), { message: 'Admin gateway is not configured.' })
  }
  for (const secret of ['', 'short', 's'.repeat(1025), ` ${'s'.repeat(40)}`]) assert.throws(() => getGatewayConfig({ ...env, ADMIN_GATEWAY_SECRET: secret }))
})

test('only reviewed admin API families and required read-only preview APIs are forwarded', () => {
  assert.ok(isAllowedApiRequest('/api/promos/validate', 'POST'))
  assert.ok(isAllowedApiRequest('/api/campaigns/preview', 'POST'))
  for (const [path, method] of [['/api/auth/login', 'POST'], ['/api/auth/me', 'GET'], ['/api/auth/logout', 'POST'], ['/api/admin-auth/get-session', 'GET'], ['/api/admin/orders/123', 'GET'], ['/api/admin/media', 'POST'], ['/api/admin/customers/123/pets/456/photo', 'GET'], ['/api/products', 'POST'], ['/api/products/123/images', 'PATCH'], ['/api/products/admin/library', 'GET'], ['/api/storefront/content', 'GET'], ['/api/campaigns/public', 'GET'], ['/api/media/123/thumbnail', 'HEAD']]) assert.ok(isAllowedApiRequest(path, method), `${method} ${path}`)
  for (const [path, method] of [['/api/account', 'GET'], ['/api/checkout', 'POST'], ['/api/customer-auth/sign-up/email', 'POST'], ['/api/admin-auth/sign-up/email', 'POST'], ['/api/auth/me', 'POST'], ['/api/products/name', 'POST'], ['/api/admin/unknown', 'GET'], ['/api/admin/orders/%2e%2e', 'GET'], ['/api/admin/orders/../x', 'GET'], ['/api//admin/orders', 'GET'], ['/api/admin/orders', 'TRACE'], ['/https://evil.example.test', 'GET'], ['/api/admin/orders\\x', 'GET']]) assert.equal(isAllowedApiRequest(path, method), false, `${method} ${path}`)
})

test('same API path/query reaches a fixed backend, with only necessary headers and app cookies', () => {
  const request = new Request('https://admin.example.test/api/admin/orders?status=PAID', { headers: {
    cookie: '__Secure-doggy-admin.session_token=synthetic; _vercel_jwt=private-team-session; other=private',
    'x-shop-admin-gateway': 'spoofed', authorization: 'private', 'x-forwarded-host': 'evil.example.test',
    origin: 'https://admin.example.test', 'content-type': 'application/json', 'x-media-folder': 'website',
  } })
  const plan = createGatewayPlan(request, env)
  assert.equal(plan.target.href, 'https://api.example.test/api/admin/orders?status=PAID')
  assert.equal(plan.headers.get('x-shop-admin-gateway'), env.ADMIN_GATEWAY_SECRET)
  assert.equal(plan.headers.get('cookie'), '__Secure-doggy-admin.session_token=synthetic')
  assert.equal(plan.headers.get('authorization'), null)
  assert.equal(plan.headers.get('x-forwarded-host'), null)
  assert.equal(plan.headers.get('origin'), 'https://admin.example.test')
  assert.equal(plan.headers.get('x-media-folder'), 'website')
})

test('routing helper overrides upstream headers, preserves streaming body ownership and disables cache', async () => {
  Object.assign(process.env, env)
  const request = new Request('https://admin.example.test/api/auth/login', { method: 'POST', body: '{"fixture":true}', headers: { 'content-type': 'application/json' } })
  const response = proxy(request)
  assert.equal(request.bodyUsed, false)
  assert.equal(response.headers.get('x-middleware-rewrite'), 'https://api.example.test/api/auth/login')
  assert.equal(response.headers.get('x-middleware-request-x-shop-admin-gateway'), env.ADMIN_GATEWAY_SECRET)
  assert.equal(response.headers.get('x-shop-admin-gateway'), null)
  assert.equal(response.headers.get('cache-control'), 'no-store')
  assert.equal(await response.text(), '')
})

test('the public shop or sibling host cannot use a signed-in browser as a staff proxy', () => {
  for (const headers of [{ origin: 'https://shop.example.test' }, { origin: 'null' }, { 'sec-fetch-site': 'cross-site' }, { 'sec-fetch-site': 'same-site' }, { origin: 'https://admin.example.test', 'sec-fetch-site': 'cross-site' }]) {
    assert.equal(createGatewayPlan(new Request('https://admin.example.test/api/products', { method: 'POST', headers }), env), null)
  }
  for (const headers of [{ origin: 'https://admin.example.test', 'sec-fetch-site': 'same-origin' }, { 'sec-fetch-site': 'none' }, {}]) {
    assert.ok(createGatewayPlan(new Request('https://admin.example.test/api/auth/me', { headers }), env))
  }
  Object.assign(process.env, env)
  const denied = proxy(new Request('https://admin.example.test/api/products', { method: 'POST', headers: { origin: 'https://shop.example.test', 'sec-fetch-site': 'cross-site' } }))
  assert.equal(denied.status, 404)
  assert.equal(denied.headers.get('x-middleware-rewrite'), null)
  assert.equal(denied.headers.get('x-middleware-request-x-shop-admin-gateway'), null)
})

test('unknown routes and misconfigured deployments fail closed without redirect or secret', async () => {
  Object.assign(process.env, env)
  assert.equal(proxy(new Request('https://admin.example.test/api/account')).status, 404)
  delete process.env.ADMIN_GATEWAY_SECRET
  const response = proxy(new Request('https://admin.example.test/api/auth/me'))
  assert.equal(response.status, 503)
  assert.equal(response.headers.get('x-middleware-rewrite'), null)
  assert.deepEqual(await response.json(), { success: false, message: 'The admin connection is temporarily unavailable.' })
})
