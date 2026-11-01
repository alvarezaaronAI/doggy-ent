import { afterEach, describe, expect, it, vi } from 'vitest'
import fs from 'node:fs'
import { createCustomerGatewayPlan } from '../../../runtime/customerGateway.js'
import { isAllowedCustomerRequest } from '../../../src/shared/utils/customerApiRoutes.js'
import proxy from '../../../proxy.js'

const env = { VITE_API_BASE_URL: 'https://api.example.test' }
const request = (path, method = 'GET', headers = {}) => new Request(`https://shop.example.test${path}`, { method, headers: { 'sec-fetch-site': 'same-origin', ...headers } })
afterEach(() => { vi.unstubAllEnvs(); vi.resetModules(); vi.doUnmock('../../../src/shared/config/applicationSurface.js') })

describe('first-party customer gateway boundary', () => {
  it('selects an isolated storefront artifact for both production and preview deployments', () => {
    const config = JSON.parse(fs.readFileSync(new URL('../../../vercel.json', import.meta.url), 'utf8'))
    expect(config.buildCommand).toBe('npm run build:storefront')
    expect(config.outputDirectory).toBe('dist-storefront')
    expect(config.proxy).toEqual({ entrypoint: 'proxy.js', matcher: '/api/:path*' })
  })
  it.each([
    ['GET', '/api/customer-auth/get-session'], ['GET', '/api/customer-auth/readiness'],
    ['POST', '/api/customer-auth/sign-in/email'], ['POST', '/api/customer-auth/sign-up/email'],
    ['POST', '/api/customer-auth/sign-out'], ['POST', '/api/customer-auth/request-password-reset'],
    ['POST', '/api/customer-auth/reset-password'], ['POST', '/api/customer-auth/send-verification-email'],
    ['GET', '/api/account'], ['GET', '/api/account/profile'], ['PUT', '/api/account/profile'],
    ['GET', '/api/account/notifications'], ['GET', '/api/account/orders'], ['GET', '/api/account/orders/DGE-example'],
    ['GET', '/api/account/issues'], ['GET', '/api/account/issues/ISSUE-example'], ['POST', '/api/account/orders/DGE-example/issues'],
    ['GET', '/api/account/pets'], ['POST', '/api/account/pets'], ['PUT', '/api/account/pets/pet-1'], ['DELETE', '/api/account/pets/pet-1'],
    ['PATCH', '/api/account/pets/pet-1/archive'], ['GET', '/api/account/pets/pet-1/photo'], ['PUT', '/api/account/pets/pet-1/photo'], ['DELETE', '/api/account/pets/pet-1/photo'],
    ['GET', '/api/account/wishlist'], ['PUT', '/api/account/wishlist/product-1'], ['DELETE', '/api/account/wishlist/product-1'],
    ['GET', '/api/checkout/shipping-options'], ['GET', '/api/checkout/payment-configuration'], ['POST', '/api/checkout/preview'],
    ['POST', '/api/checkout/shipping-rates'], ['POST', '/api/checkout/create-payment-intent'], ['POST', '/api/checkout'],
    ['GET', '/api/checkout/orders/DGE-example'], ['GET', '/api/checkout/attempts/attempt-1'], ['POST', '/api/checkout/attempts/attempt-1/finalize'], ['POST', '/api/checkout/attempts/attempt-1/cancel'],
  ])('allows the existing customer route %s %s only through the fixed API', (method, path) => {
    expect(isAllowedCustomerRequest(path, method)).toBe(true)
    expect(createCustomerGatewayPlan(request(path, method), env).target.href).toBe(env.VITE_API_BASE_URL + path)
  })
  it.each(['/api/auth/me', '/api/admin-auth/sign-in/email', '/api/admin/orders', '/api/products', '/api/payments/stripe/webhook', '/api/customer-auth/list-sessions', '/api/account/private-table', '/api/account//pets', '/api/account/pets/name%2Fid'])('does not turn the public site into an unrestricted proxy: %s', path => {
    expect(createCustomerGatewayPlan(request(path), env)).toBeNull()
  })
  it('rejects raw encoded paths and cannot normalize traversal into a staff endpoint', () => {
    expect(isAllowedCustomerRequest('/api/account/pets/%2e%2e', 'GET')).toBe(false)
    expect(createCustomerGatewayPlan(request('/api/account/../../api/admin/orders'), env)).toBeNull()
    const plan = createCustomerGatewayPlan(request('/api/account/pets/%2e%2e'), env)
    expect(plan.target.pathname).toBe('/api/account/')
  })
  it.each(['GET', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'])('rejects an unsupported login method %s', method => {
    expect(createCustomerGatewayPlan(request('/api/customer-auth/sign-in/email', method), env)).toBeNull()
  })
  it.each([
    { origin: 'https://other.example.test' }, { 'sec-fetch-site': 'cross-site' }, { 'sec-fetch-site': 'same-site' },
  ])('rejects other origins and sibling-site requests %j', headers => {
    expect(createCustomerGatewayPlan(request('/api/account/profile', 'PUT', headers), env)).toBeNull()
  })
  it('requires same-origin evidence on writes but allows safe direct reads', () => {
    const direct = new Request('https://shop.example.test/api/customer-auth/sign-out', { method: 'POST' })
    expect(createCustomerGatewayPlan(direct, env)).toBeNull()
    expect(createCustomerGatewayPlan(new Request('https://shop.example.test/api/customer-auth/get-session'), env)).not.toBeNull()
    expect(createCustomerGatewayPlan(new Request(direct, { headers: { origin: 'https://shop.example.test' } }), env)).not.toBeNull()
  })
  it('forwards only customer cookies and necessary headers, not staff or hosting credentials', () => {
    const plan = createCustomerGatewayPlan(request('/api/account/profile', 'GET', {
      cookie: '__Secure-better-auth.session_token=customer-fixture; better-auth.dont_remember=yes; __Secure-better-auth.session_data.0=chunk; doggy-admin.session_token=staff-fixture; _vercel_jwt=hosting-fixture; unrelated=value',
      authorization: 'Bearer not-forwarded', 'x-shop-admin-gateway': 'not-forwarded', 'x-forwarded-host': 'evil.example.test', 'x-forwarded-for': '127.0.0.1',
      'x-checkout-recovery': 'recovery-fixture', 'x-order-receipt': 'receipt-fixture', origin: 'https://shop.example.test', referer: 'https://shop.example.test/account/reset-password?token=private-fixture',
    }), env)
    expect(plan.headers.get('cookie')).toBe('__Secure-better-auth.session_token=customer-fixture; better-auth.dont_remember=yes; __Secure-better-auth.session_data.0=chunk')
    for (const name of ['authorization', 'x-shop-admin-gateway', 'x-forwarded-host', 'x-forwarded-for', 'referer']) expect(plan.headers.has(name)).toBe(false)
    expect(plan.headers.get('origin')).toBe('https://shop.example.test')
    expect(plan.headers.get('x-checkout-recovery')).toBe('recovery-fixture')
    expect(plan.headers.get('x-order-receipt')).toBe('receipt-fixture')
  })
  it.each(['', 'http://api.example.test', 'https://user:password@api.example.test', 'https://api.example.test/path', 'https://api.example.test?query=1', 'https://api.example.test#fragment', 'https://localhost', 'https://shop.example.test'])('fails closed for invalid fixed configuration %s', value => {
    expect(() => createCustomerGatewayPlan(request('/api/account'), { VITE_API_BASE_URL: value })).toThrow('Customer connection is not configured.')
  })
  it('does not accept a caller-selected upstream and preserves only the request path/query', () => {
    const plan = createCustomerGatewayPlan(request('/api/account/orders?upstream=https://evil.example.test'), env)
    expect(plan.target.origin).toBe('https://api.example.test')
    expect(plan.target.pathname).toBe('/api/account/orders')
    expect(plan.target.search).toBe('?upstream=https://evil.example.test')
  })
  it('retains the documented HTTPS hostname and legacy public-config alias compatibility', () => {
    const plan = createCustomerGatewayPlan(request('/api/account'), { VITE_API_URL: 'api.example.test/' })
    expect(plan.target.href).toBe('https://api.example.test/api/account')
  })
  it('uses the actual routing middleware response without caching private traffic', () => {
    vi.stubEnv('VITE_API_BASE_URL', env.VITE_API_BASE_URL)
    const response = proxy(request('/api/customer-auth/get-session'))
    expect(response.headers.get('x-middleware-rewrite')).toBe('https://api.example.test/api/customer-auth/get-session')
    expect(response.headers.get('cache-control')).toBe('private, no-store')
    expect(proxy(request('/api/admin/orders')).status).toBe(404)
    vi.stubEnv('VITE_API_BASE_URL', '')
    vi.stubEnv('VITE_API_URL', '')
    const failure = proxy(request('/api/account'))
    expect(failure.status).toBe(503)
    expect(failure.headers.get('cache-control')).toBe('private, no-store')
  })
})

describe('customer API origin selection', () => {
  async function api(surface, development) {
    vi.resetModules()
    vi.doMock('../../../src/shared/config/applicationSurface.js', () => ({ APPLICATION_SURFACE: surface }))
    vi.stubEnv('DEV', development)
    vi.stubEnv('VITE_API_BASE_URL', 'https://api.example.test')
    return import('../../../src/shared/api/http.js')
  }
  it('uses same-origin sessions, private photos and checkout in the hosted storefront, retaining the public-media API', async () => {
    const value = await api('storefront', false)
    expect(value.getCustomerApiBaseUrl()).toBe('')
    for (const path of ['/api/customer-auth/get-session', '/api/account/profile', '/api/account/pets/pet-1/photo', '/api/account/wishlist', '/api/checkout/preview', '/api/checkout/orders/ref']) expect(value.buildApiUrl(path)).toBe(path)
    expect(value.getApiBaseUrl()).toBe('https://api.example.test')
    expect(value.buildApiUrl('/api/products')).toBe('https://api.example.test/api/products')
    expect(value.buildApiUrl('/api/media/image-1')).toBe('https://api.example.test/api/media/image-1')
  })
  it.each(['combined', 'storefront'])('preserves local %s startup routing, never silently targets the hosted DB', async surface => {
    const value = await api(surface, true)
    expect(value.getCustomerApiBaseUrl()).toBe('https://api.example.test')
    expect(value.buildApiUrl('/api/account/profile')).toBe('https://api.example.test/api/account/profile')
  })
  it('leaves standalone admin on its separate protected gateway', async () => {
    const value = await api('admin', false)
    expect(value.getApiBaseUrl()).toBe('')
    expect(value.buildApiUrl('/api/auth/me')).toBe('/api/auth/me')
  })
})
