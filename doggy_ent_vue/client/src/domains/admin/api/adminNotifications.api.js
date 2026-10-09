import {
  fetchApi,
  parseJsonResponse,
} from '@shared/api/http.js'

const ADMIN_NOTIFICATIONS_API_URL = '/api/admin/notifications'

function toQueryString(params = {}) {
  const search = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      search.set(key, value)
    }
  })

  const queryString = search.toString()
  return queryString ? `?${queryString}` : ''
}

export async function fetchAdminNotifications(params = {}) {
  const data = await parseJsonResponse(
    await fetchApi(`${ADMIN_NOTIFICATIONS_API_URL}${toQueryString(params)}`),
    'Unable to load notification activity.',
  )

  return data.result
}
