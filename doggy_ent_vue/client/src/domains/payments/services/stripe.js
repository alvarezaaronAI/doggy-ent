let stripePromise

export function getStripe() {
  const key = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
  if (!key) return Promise.resolve(null)
  if (!stripePromise) {
    stripePromise = import('@stripe/stripe-js/pure')
      .then(({ loadStripe }) => loadStripe(key))
      .catch(error => { stripePromise = undefined; throw error })
  }
  return stripePromise
}
