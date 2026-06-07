import {
  fetchApi,
  parseJsonResponse,
} from '@shared/api/http.js'

const ADMIN_ORDERS_API_URL = '/api/admin/orders'

async function parseOrderResponse(response, fallbackMessage) {
  return parseJsonResponse(response, fallbackMessage)
}

export async function fetchAdminOrders() {
  const data = await parseOrderResponse(
    await fetchApi(ADMIN_ORDERS_API_URL),
    'Unable to load orders.',
  )

  return Array.isArray(data) ? data : []
}

export async function fetchAdminOrderStats() {
  return parseOrderResponse(
    await fetchApi(`${ADMIN_ORDERS_API_URL}/stats`),
    'Unable to load order stats.',
  )
}

export async function fetchAdminOrderById(orderId) {
  return parseOrderResponse(
    await fetchApi(`${ADMIN_ORDERS_API_URL}/${orderId}`),
    'Unable to load order.',
  )
}

export async function updateAdminOrderStatus(
  orderId,
  {
    status,
    note = '',
  },
) {
  return parseOrderResponse(
    await fetchApi(`${ADMIN_ORDERS_API_URL}/${orderId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status,
        note,
      }),
    }),
    'Unable to update order.',
  )
}
