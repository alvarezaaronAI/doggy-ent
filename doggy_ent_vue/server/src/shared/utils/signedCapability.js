import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto'
const developmentKey = randomBytes(32).toString('hex')
function key() {
  const value = process.env.BETTER_AUTH_SECRET || process.env.ADMIN_SESSION_SECRET
  if (!value && process.env.NODE_ENV === 'production') throw new Error('A server signing secret is required.')
  return value || developmentKey
}
export function signCapability(audience, data, lifetime = 15 * 60 * 1000) {
  const body = Buffer.from(JSON.stringify({ ...data, audience, expires: Date.now() + lifetime })).toString('base64url')
  return body + '.' + createHmac('sha256', key()).update(body).digest('base64url')
}
export function readCapability(token, audience) {
  try {
    if (typeof token !== 'string' || token.length > 6000) return null
    const [body, signature, extra] = token.split('.')
    if (!body || !signature || extra) return null
    const expected = createHmac('sha256', key()).update(body).digest()
    const provided = Buffer.from(signature, 'base64url')
    if (provided.length !== expected.length || !timingSafeEqual(provided, expected)) return null
    const value = JSON.parse(Buffer.from(body, 'base64url').toString())
    return value.audience === audience && value.expires > Date.now() ? value : null
  } catch { return null }
}
