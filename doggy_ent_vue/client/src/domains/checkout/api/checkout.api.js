
import {
  fetchApi,
  parseJsonResponse,
} from '@shared/api/http.js'
import { getReceiptAccess, rememberReceiptAccess } from '../utils/receiptAccess.js'

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
  checkoutProof,
}) {
  const normalizedCustomer = normalizeCustomer(customer)

  const result = await postCheckoutRequest(
    '/api/checkout',
    {
      cartItems,
      promoCode,
      customerEmail: normalizedCustomer.email,
      customer: normalizedCustomer,
      shipping,
      stripePaymentIntentId,
      checkoutProof,
    },
    'Checkout failed.',
  )
  rememberReceiptAccess(result.order?.orderNumber, result.receiptAccess)
  return result
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
    { headers: { 'X-Order-Receipt': getReceiptAccess(reference) } },
  )

  return parseCheckoutResponse(
    response,
    'Unable to load order confirmation.',
  )
}

export async function fetchCheckoutShippingOptions() {
  const response = await fetchApi('/api/checkout/shipping-options')

  return parseCheckoutResponse(
    response,
    'Unable to load shipping options.',
  )
}

export async function fetchCheckoutShippingRates({
  customer,
  cartItems,
}) {
  const normalizedCustomer = normalizeCustomer(customer)

  return postCheckoutRequest(
    '/api/checkout/shipping-rates',
    {
      customer: normalizedCustomer,
      cartItems,
    },
    'Unable to load shipping rates.',
  )
}
