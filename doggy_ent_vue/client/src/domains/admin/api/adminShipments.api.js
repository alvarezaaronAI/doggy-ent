import {
  fetchApi,
  parseJsonResponse,
} from '@shared/api/http.js'

const ADMIN_SHIPMENTS_API_URL = '/api/admin/shipments'

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

export async function fetchAdminShipments(params = {}) {
  const data = await parseJsonResponse(
    await fetchApi(`${ADMIN_SHIPMENTS_API_URL}${toQueryString(params)}`),
    'Unable to load shipments.',
  )

  return data.result
}
