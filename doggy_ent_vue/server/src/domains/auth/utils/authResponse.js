import { APIError } from 'better-auth/api'

export async function verifySessionRevocation(ctx) {
  if (ctx.path !== '/sign-out') return
  const token = await ctx.getSignedCookie(ctx.context.authCookies.sessionToken.name, ctx.context.secret)
  if (token && await ctx.context.internalAdapter.findSession(token)) {
    throw new APIError('INTERNAL_SERVER_ERROR', { message: 'Unable to end this session. Please retry signing out.' })
  }
}

export function sanitizeAuthPayload(value) {
  if (Array.isArray(value)) return value.map(sanitizeAuthPayload)
  if (!value || typeof value !== 'object') return value
  return Object.fromEntries(Object.entries(value)
    .filter(([key]) => !['token', 'password', 'accessToken', 'refreshToken', 'idToken'].includes(key))
    .map(([key, child]) => [key, sanitizeAuthPayload(child)]))
}

export async function sanitizeReturnedAuthResponse(returned) {
  if (returned instanceof Response) {
    const data = await returned.clone().json().catch(() => null)
    return data ? sanitizeAuthPayload(data) : returned
  }
  return sanitizeAuthPayload(returned)
}
