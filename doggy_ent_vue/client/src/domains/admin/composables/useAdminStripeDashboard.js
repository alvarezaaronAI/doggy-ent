import { ref } from 'vue'
import { normalizeStripeDashboardPaymentsUrl } from '../utils/stripeDashboard.js'

const storageKey = 'doggy-admin-stripe-payments-url'
function initialUrl() {
  try {
    const value = localStorage.getItem(storageKey)
    if (value === '') return ''
    const stored = normalizeStripeDashboardPaymentsUrl(value)
    if (stored) return stored
  } catch {
    /* Storage can be unavailable in private browsing. */
  }
  return normalizeStripeDashboardPaymentsUrl(
    import.meta.env.VITE_STRIPE_DASHBOARD_PAYMENTS_URL,
  )
}
const paymentsUrl = ref(initialUrl())

export function useAdminStripeDashboard() {
  function saveUrl(value) {
    const normalized = normalizeStripeDashboardPaymentsUrl(value)
    if (String(value || '').trim() && !normalized) {
      throw new Error(
        'Enter an HTTPS Stripe dashboard URL ending in /payments, without a payment ID, query or fragment.',
      )
    }
    // This stores only a public dashboard location, never a Stripe API key.
    localStorage.setItem(storageKey, normalized)
    paymentsUrl.value = normalized
  }
  return { paymentsUrl, saveUrl }
}
