import { isAllowedCustomerRequest } from '../src/shared/utils/customerApiRoutes.js'

const FORWARDED_HEADERS = ['accept', 'content-type', 'origin', 'sec-fetch-site', 'sec-fetch-mode', 'sec-fetch-dest', 'x-checkout-recovery', 'x-order-receipt']

export function createCustomerGatewayPlan(request, env) {
  const url = new URL(request.url)
  const origin = request.headers.get('origin')
  const site = request.headers.get('sec-fetch-site')
  const read = request.method === 'GET' || request.method === 'HEAD'
  if (origin && origin !== url.origin || site === 'cross-site' || site === 'same-site') return null
  if (!read && !origin && site !== 'same-origin') return null
  if (!isAllowedCustomerRequest(url.pathname, request.method)) return null

  let upstream
  const configured = String(env.VITE_API_BASE_URL || env.VITE_API_URL || '').trim()
  const originValue = /^[a-zA-Z0-9.-]+(?::\d+)?\/?$/.test(configured) ? `https://${configured}` : configured
  try { upstream = new URL(originValue) } catch { throw new Error('Customer connection is not configured.') }
  if (upstream.protocol !== 'https:' || upstream.username || upstream.password || upstream.pathname !== '/' || upstream.search || upstream.hash
    || ['localhost', '127.0.0.1', '[::1]'].includes(upstream.hostname) || upstream.origin === url.origin) throw new Error('Customer connection is not configured.')
  const target = new URL(upstream.origin)
  target.pathname = url.pathname
  target.search = url.search
  const headers = new Headers()
  for (const name of FORWARDED_HEADERS) {
    const value = request.headers.get(name)
    if (value !== null) headers.set(name, value)
  }
  // Only customer session cookies cross this boundary, never staff or hosting cookies.
  const cookies = (request.headers.get('cookie') || '').split(';').map(value => value.trim())
    .filter(value => /^(?:__Secure-)?better-auth\.(?:session_token|session_data|dont_remember)(?:\.\d+)?=/.test(value))
  if (cookies.length) headers.set('cookie', cookies.join('; '))
  return { target, headers }
}
