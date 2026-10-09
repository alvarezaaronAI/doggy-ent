export function normalizeStripeDashboardPaymentsUrl(baseUrl) {
  if (!baseUrl) return ''
  try {
    const url = new URL(String(baseUrl).trim())
    // Only an actual Stripe payments dashboard may receive internal payment IDs.
    if (
      url.protocol !== 'https:' ||
      url.hostname !== 'dashboard.stripe.com' ||
      url.port ||
      url.username ||
      url.password ||
      url.search ||
      url.hash ||
      !/^\/(?:acct_[A-Za-z0-9]+\/)?(?:test\/)?payments\/?$/.test(url.pathname)
    )
      return ''
    url.pathname = url.pathname.replace(/\/$/, '')
    return url.href
  } catch {
    return ''
  }
}

export function getStripePaymentLink(
  paymentIntentId,
  baseUrl = import.meta.env.VITE_STRIPE_DASHBOARD_PAYMENTS_URL,
) {
  const id = String(paymentIntentId || '').trim()
  const base = normalizeStripeDashboardPaymentsUrl(baseUrl)
  if (!/^pi_[A-Za-z0-9]+$/.test(id) || !base) return null
  return `${base}/${id}`
}
