import {
  fetchApi,
  parseJsonResponse,
} from '@shared/api/http.js'

const ADMIN_PROMOS_API_BASE_URL = '/api/admin/promos'
const PUBLIC_PROMOS_API_BASE_URL = '/api/promos'

async function parseApiResponse(response, fallbackMessage) {
  return parseJsonResponse(response, fallbackMessage)
}

function normalizeEmail(value) {
  return String(value || '').trim().toLowerCase()
}

export async function fetchPromos() {
  const response = await fetchApi(
    ADMIN_PROMOS_API_BASE_URL,
  )

  return parseApiResponse(
    response,
    'Unable to load promo codes.',
  )
}

export async function createPromo(payload) {
  const response = await fetchApi(
    ADMIN_PROMOS_API_BASE_URL,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    },
  )

  return parseApiResponse(
    response,
    'Unable to create promo code.',
  )
}

export async function updatePromo(
  promoId,
  payload,
) {
  const response = await fetchApi(
    `${ADMIN_PROMOS_API_BASE_URL}/${promoId}`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    },
  )

  return parseApiResponse(
    response,
    'Unable to update promo code.',
  )
}

export async function deletePromo(promoId) {
  const response = await fetchApi(
    `${ADMIN_PROMOS_API_BASE_URL}/${promoId}`,
    {
      method: 'DELETE',
    },
  )

  return parseApiResponse(
    response,
    'Unable to delete promo code.',
  )
}

export async function fetchPromoAnalytics(
  promoId,
) {
  const response = await fetchApi(
    `${ADMIN_PROMOS_API_BASE_URL}/${promoId}/analytics`,
  )

  return parseApiResponse(
    response,
    'Unable to load promo analytics.',
  )
}

export async function validatePromoCode(payload) {
  const normalizedPayload = {
    code: String(payload?.code || '')
      .trim()
      .toUpperCase(),

    customerEmail: normalizeEmail(payload?.customerEmail),

    cart: {
      items: Array.isArray(payload?.cart?.items)
        ? payload.cart.items
        : [],

      subtotal: Number(
        payload?.cart?.subtotal || 0,
      ),
    },
  }
  const response = await fetchApi(
    `${PUBLIC_PROMOS_API_BASE_URL}/validate`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(normalizedPayload),
    },
  )

  return parseApiResponse(
    response,
    'Unable to validate promo code.',
  )
}
