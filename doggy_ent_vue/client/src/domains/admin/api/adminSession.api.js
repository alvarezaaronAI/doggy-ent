import { fetchApi, parseJsonResponse } from '@shared/api/http.js'

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
