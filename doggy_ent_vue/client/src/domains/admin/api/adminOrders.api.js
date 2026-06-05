const ADMIN_ORDERS_API_URL = '/api/admin/orders'

async function parseOrderResponse(response, fallbackMessage) {
  let data = null

  try {
    data = await response.json()
  } catch {
    data = null
  }

  if (!response.ok) {
    throw new Error(data?.message || fallbackMessage)
  }

  return data
}

export async function fetchAdminOrders() {
  const data = await parseOrderResponse(
    await fetch(ADMIN_ORDERS_API_URL),
    'Unable to load orders.',
  )

  return Array.isArray(data) ? data : []
}

export async function fetchAdminOrderStats() {
  return parseOrderResponse(
    await fetch(`${ADMIN_ORDERS_API_URL}/stats`),
    'Unable to load order stats.',
  )
}

export async function fetchAdminOrderById(orderId) {
  return parseOrderResponse(
    await fetch(`${ADMIN_ORDERS_API_URL}/${orderId}`),
    'Unable to load order.',
  )
}

export async function updateAdminOrderStatus(orderId, status) {
  return parseOrderResponse(
    await fetch(`${ADMIN_ORDERS_API_URL}/${orderId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status,
      }),
    }),
    'Unable to update order.',
  )
}
