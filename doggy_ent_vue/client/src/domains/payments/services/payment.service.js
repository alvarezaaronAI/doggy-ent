import {
  fetchApi,
  parseJsonResponse,
} from '@shared/api/http.js'
import { getPublishableKeyMode } from './publishableKeyMode.js'

export const PAYMENT_UNAVAILABLE_MESSAGE = 'Secure payment is unavailable. Please try again later.'

export const getPaymentConfiguration = async () => {
  try {
    const response = await fetchApi('/api/checkout/payment-configuration', {
      method: 'GET',
      cache: 'no-store',
    })
    const data = await parseJsonResponse(response, PAYMENT_UNAVAILABLE_MESSAGE)
    const configuration = data?.configuration

    if (
      data?.success !== true
      || !configuration
      || Array.isArray(configuration)
      || !['sandbox', 'live', 'unconfigured'].includes(configuration.mode)
      || typeof configuration.enabled !== 'boolean'
      || (configuration.enabled && configuration.mode === 'unconfigured')
      || typeof configuration.message !== 'string'
    ) {
      throw new Error(PAYMENT_UNAVAILABLE_MESSAGE)
    }

    return {
      mode: configuration.mode,
      enabled: configuration.enabled,
      message: configuration.enabled ? '' : PAYMENT_UNAVAILABLE_MESSAGE,
    }
  } catch {
    throw new Error(PAYMENT_UNAVAILABLE_MESSAGE)
  }
}

export const createPaymentIntent = async ({
  cartItems,
  promoCode,
  customer,
  shipping,
}) => {
  try {
    const paymentMode = getPublishableKeyMode(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY)
    if (!paymentMode) throw new Error(PAYMENT_UNAVAILABLE_MESSAGE)

    // Mount readiness is not authority to create a payment; the server checks every POST.
    const response = await fetchApi('/api/checkout/create-payment-intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        paymentMode,
        cartItems,
        promoCode,
        customerEmail: customer?.email,
        customer,
        shipping,
      }),
    })

    const data = await parseJsonResponse(
      response,
      PAYMENT_UNAVAILABLE_MESSAGE,
    )

    if (data?.success !== true) {
      throw new Error(PAYMENT_UNAVAILABLE_MESSAGE)
    }

    return data
  } catch {
    throw new Error(PAYMENT_UNAVAILABLE_MESSAGE)
  }
}
