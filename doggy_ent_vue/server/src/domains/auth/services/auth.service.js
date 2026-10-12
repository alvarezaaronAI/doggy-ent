import { fromNodeHeaders } from 'better-auth/node'
import { adminAuth } from './adminAuth.service.js'
import { getAdminDataTarget as getConfiguredAdminDataTarget } from '../../../config/env.js'

function adminProfile(user) {
  return { id: user.id, email: user.email, role: 'ADMIN', name: user.name }
}

export const getAdminDataTarget = getConfiguredAdminDataTarget

export async function loginAdmin(input = {}, req) {
  if (typeof input?.email !== 'string' || typeof input?.password !== 'string'
    || !input.email.trim() || !input.password || input.email.length > 254 || input.password.length > 128) {
    throw Object.assign(new Error('Enter a valid email and password.'), { statusCode: 400 })
  }
  const result = await adminAuth.api.signInEmail({
    body: { email: input.email.trim().toLowerCase(), password: input.password },
    headers: fromNodeHeaders(req.headers), returnHeaders: true,
  })
  if (result.response?.user?.role !== 'ADMIN' || result.response.user.status !== 'ACTIVE') {
    throw Object.assign(new Error('Invalid admin credentials.'), { statusCode: 401 })
  }
  return { admin: adminProfile(result.response.user), headers: result.headers }
}

export async function getAdminFromRequest(req) {
  const result = await adminAuth.api.getSession({ headers: fromNodeHeaders(req.headers) })
  if (result?.user?.role !== 'ADMIN' || result.user.status !== 'ACTIVE') return null
  return adminProfile(result.user)
}

export async function logoutAdmin(req) {
  return adminAuth.api.signOut({ headers: fromNodeHeaders(req.headers), returnHeaders: true })
}

export function forwardAuthCookies(res, headers) {
  for (const cookie of headers?.getSetCookie() || []) res.append('Set-Cookie', cookie)
  res.set('Cache-Control', 'no-store')
}
