import { getPaymentConfiguration, PAYMENT_UNAVAILABLE_MESSAGE } from './payment.service.js'
import { getPublishableKeyMode } from './publishableKeyMode.js'

let stripePromise

export function getStripe() {
  const key = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
  if (!key) return Promise.resolve(null)
  const paymentMode = getPublishableKeyMode(key)
  if (!paymentMode) return Promise.reject(new Error(PAYMENT_UNAVAILABLE_MESSAGE))

  if (!stripePromise) {
    stripePromise = getPaymentConfiguration()
      .then(configuration => {
        if (configuration.enabled !== true || configuration.mode !== paymentMode) {
          throw new Error(PAYMENT_UNAVAILABLE_MESSAGE)
        }
        return import('@stripe/stripe-js/pure')
      })
      .then(({ loadStripe }) => loadStripe(key))
      .then(stripe => {
        if (!stripe) throw new Error(PAYMENT_UNAVAILABLE_MESSAGE)
        return stripe
      })
      .catch(() => {
        stripePromise = undefined
        throw new Error(PAYMENT_UNAVAILABLE_MESSAGE)
      })
  }
  return stripePromise
}
