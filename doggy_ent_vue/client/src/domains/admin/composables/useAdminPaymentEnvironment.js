import { computed, onMounted, onUnmounted, ref } from 'vue'
import { fetchAdminPaymentEnvironment } from '../api/adminPayments.api.js'

const FRESHNESS_MS = 60_000
const MODE_LABELS = { sandbox: 'Sandbox', live: 'Live', unconfigured: 'Unset' }

export function useAdminPaymentEnvironment() {
  const environment = ref(null)
  const loading = ref(false)
  const error = ref('')
  const stale = ref(false)
  let inFlight = null
  let controller = null
  let staleTimer = null
  let disposed = false
  let lastAttemptAt = null
  let visibilityDocument = null

  const current = computed(() => Boolean(environment.value && !loading.value && !error.value && !stale.value))
  const accountVerified = computed(() => Boolean(
    environment.value?.verification === 'verified' && environment.value.accountId
    && environment.value.accountId === environment.value.expectedAccountId
    && environment.value.checkedAt,
  ))
  const modeLabel = computed(() => {
    if (!environment.value) return 'Mode unknown'
    return `${loading.value || error.value || stale.value ? 'Last configured' : 'Configured'} ${MODE_LABELS[environment.value.mode]}`
  })
  const verificationLabel = computed(() => {
    if (loading.value) return 'Checking account...'
    if (error.value) return 'Check unavailable'
    if (!environment.value) return 'Account unknown'
    if (stale.value) return 'Stale check'
    if (accountVerified.value) return 'Account verified'
    return environment.value.verification === 'failed' ? 'Account check failed' : 'Account unverified'
  })
  const paymentsLabel = computed(() => {
    if (!current.value) return 'Unknown'
    const value = environment.value
    if (!value.paymentsEnabled || !value.canCreatePayments) return 'Paused'
    if (
      value.mode === 'sandbox' && value.keyMode === 'sandbox'
      && accountVerified.value
      && value.chargesEnabled === true && value.blockers.length === 0
    ) return 'Allowed (sandbox)'
    return 'Unknown'
  })

  function refresh() {
    if (disposed) return Promise.resolve()
    if (inFlight) return inFlight
    clearTimeout(staleTimer)
    loading.value = true
    error.value = ''
    lastAttemptAt = Date.now()
    controller = new AbortController()
    inFlight = (async () => {
      try {
        const value = await fetchAdminPaymentEnvironment({ signal: controller.signal })
        if (disposed) return
        environment.value = value
        const age = value.checkedAt ? Date.now() - Date.parse(value.checkedAt) : 0
        stale.value = !Number.isFinite(age) || age < 0 || age >= FRESHNESS_MS
        if (!stale.value) {
          staleTimer = setTimeout(() => { stale.value = true }, FRESHNESS_MS - age)
        }
      } catch {
        if (!disposed) error.value = 'Payment environment unavailable. New-payment status is unknown.'
      } finally {
        if (!disposed) loading.value = false
        inFlight = null
        controller = null
      }
    })()
    return inFlight
  }

  function recheckVisibleTab() {
    if (!visibilityDocument.hidden && (lastAttemptAt === null || Date.now() - lastAttemptAt >= FRESHNESS_MS)) {
      void refresh()
    }
  }

  onMounted(() => {
    visibilityDocument = typeof document === 'undefined' ? null : document
    visibilityDocument?.addEventListener('visibilitychange', recheckVisibleTab)
    if (!visibilityDocument?.hidden) void refresh()
  })
  onUnmounted(() => {
    disposed = true
    clearTimeout(staleTimer)
    controller?.abort()
    visibilityDocument?.removeEventListener('visibilitychange', recheckVisibleTab)
  })

  return { environment, loading, error, stale, current, accountVerified, modeLabel, verificationLabel, paymentsLabel, refresh }
}
