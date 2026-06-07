
import {
  fetchApi,
  parseJsonResponse,
} from '@shared/api/http.js'

async function parseCheckoutResponse(
  response,
  fallbackMessage,
) {
  const data = await parseJsonResponse(
    response,
    fallbackMessage,
  )

  if (!data?.success) {
    throw new Error(
      data?.message || fallbackMessage,
    )
  }

  return data.result
}

async function postCheckoutRequest(
  endpoint,
  payload,
  fallbackMessage,
) {
  const response = await fetchApi(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  return parseCheckoutResponse(
    response,
    fallbackMessage,
  )
}

function normalizeEmail(value) {
  return String(value || '').trim().toLowerCase()
}

function normalizeCustomer(customer = {}) {
  return {
    ...customer,
    email: normalizeEmail(customer.email),
  }
}

export async function submitCheckout({
  cartItems,
  promoCode,
  customer,
  shipping,
  stripePaymentIntentId,
}) {
  const normalizedCustomer = normalizeCustomer(customer)

  return postCheckoutRequest(
    '/api/checkout',
    {
      cartItems,
      promoCode,
      customerEmail: normalizedCustomer.email,
      customer: normalizedCustomer,
      shipping,
      stripePaymentIntentId,
    },
    'Checkout failed.',
  )
}

export async function submitCheckoutPreview({
  cartItems,
  promoCode,
  customer,
  shipping,
}) {
  const normalizedCustomer = normalizeCustomer(customer)

  return postCheckoutRequest(
    '/api/checkout/preview',
    {
      cartItems,
      promoCode,
      customerEmail: normalizedCustomer.email,
      customer: normalizedCustomer,
      shipping,
    },
    'Checkout preview failed.',
  )
}

export async function fetchCheckoutOrder(reference) {
  const response = await fetchApi(
    `/api/checkout/orders/${encodeURIComponent(reference)}`,
  )

  return parseCheckoutResponse(
    response,
    'Unable to load order confirmation.',
  )
}
