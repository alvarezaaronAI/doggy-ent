const HEADER = 'x-shop-admin-gateway'
const METHODS = new Set(['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE'])
const ADMIN_AREAS = new Set(['promos', 'campaigns', 'orders', 'customers', 'notifications', 'email-templates', 'shipments', 'order-issues', 'internal-issues', 'storefront', 'media'])
const FORWARDED_HEADERS = ['accept', 'content-type', 'origin', 'referer', 'if-none-match', 'if-modified-since', 'range', 'x-file-name', 'x-media-folder']

export function getGatewayConfig(env) {
  const secret = env.ADMIN_GATEWAY_SECRET
  if (typeof secret !== 'string' || secret.length < 32 || /\s/.test(secret) || Buffer.byteLength(secret, 'utf8') > 1024) throw new Error('Admin gateway is not configured.')
  let url
  try { url = new URL(env.ADMIN_API_ORIGIN) } catch { throw new Error('Admin gateway is not configured.') }
  if (url.protocol !== 'https:' || url.username || url.password || url.pathname !== '/' || url.search || url.hash
    || ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)) throw new Error('Admin gateway is not configured.')
  return { origin: url.origin, secret }
}

export function isAllowedApiRequest(path, method) {
  if (!METHODS.has(method) || /[%\\]/.test(path) || path.includes('//')) return false
  const parts = path.split('/').slice(1)
  if (parts[0] !== 'api' || parts.some(part => part === '.' || part === '..')) return false
  const read = method === 'GET' || method === 'HEAD'
  if (parts[1] === 'admin' && parts[2] === 'payments') return read && ['/api/admin/payments/environment', '/api/admin/payments/tax'].includes(path)
  if (parts[1] === 'admin') return ADMIN_AREAS.has(parts[2]) && parts.slice(3).every(part => /^[a-zA-Z0-9_-]+$/.test(part))
  if (parts[1] === 'auth' && parts.length === 3) return read ? ['me', 'data-target'].includes(parts[2]) : method === 'POST' && ['login', 'logout'].includes(parts[2])
  if (parts[1] === 'admin-auth') return read ? path === '/api/admin-auth/get-session' : method === 'POST' && ['/api/admin-auth/sign-in/email', '/api/admin-auth/sign-out'].includes(path)
  if (parts[1] === 'products') return parts.slice(2).every(part => /^[a-zA-Z0-9_-]+$/.test(part)) && (read || method === 'POST' && parts.length === 2 || ['PUT', 'DELETE'].includes(method) && parts.length === 3 || method === 'PATCH' && parts.length === 4 && parts[3] === 'images')
  if (read && (path === '/api/health' || path === '/api/storefront/content')) return true
  if (read && /^\/api\/media\/[a-zA-Z0-9_-]+(?:\/thumbnail)?$/.test(path)) return true
  if (method === 'POST' && ['/api/promos/validate', '/api/campaigns/preview'].includes(path)) return true
  return read && /^\/api\/campaigns\/public(?:\/[a-zA-Z0-9_-]+)?$/.test(path)
}

export function createGatewayPlan(request, env) {
  const url = new URL(request.url)
  const origin = request.headers.get('origin')
  const fetchSite = request.headers.get('sec-fetch-site')
  // The public shop's trusted backend origin must not authorize use of the staff proxy.
  if (origin && origin !== url.origin || fetchSite === 'cross-site' || fetchSite === 'same-site') return null
  if (!isAllowedApiRequest(url.pathname, request.method)) return null
  const config = getGatewayConfig(env)
  const target = new URL(config.origin)
  target.pathname = url.pathname
  target.search = url.search
  const headers = new Headers()
  for (const name of FORWARDED_HEADERS) {
    const value = request.headers.get(name)
    if (value !== null) headers.set(name, value)
  }
  // Forward only this application's session, never Vercel/team authentication cookies.
  const cookies = (request.headers.get('cookie') || '').split(';').map(value => value.trim())
    .filter(value => /^(?:__Secure-)?doggy-admin\.[a-z_]+(?:\.\d+)?=/.test(value))
  if (cookies.length) headers.set('cookie', cookies.join('; '))
  headers.set(HEADER, config.secret)
  return { target, headers }
}
