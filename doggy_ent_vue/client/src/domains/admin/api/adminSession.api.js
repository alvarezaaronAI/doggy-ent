import { fetchApi, parseJsonResponse } from '@shared/api/http.js'

export async function loginAdmin(credentials) {
  const result = await parseJsonResponse(await fetchApi('/api/auth/login', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(credentials),
  }), 'Unable to sign in.')
  if (!result.success) throw new Error('Unable to sign in.')
  const session = await fetchAdminSession()
  if (!session.authenticated) throw new Error('Admin session was not established. Please try again.')
  return session
}

export async function fetchAdminSession() {
  return parseJsonResponse(
    await fetchApi('/api/auth/me'),
    'Unable to validate admin session.',
  )
}
export async function logoutAdmin() {
  return parseJsonResponse(
    await fetchApi('/api/auth/logout', { method: 'POST' }),
    'Unable to sign out.',
  )
}
