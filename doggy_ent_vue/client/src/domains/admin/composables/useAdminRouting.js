import { computed, onMounted, onUnmounted, ref } from 'vue'
import { fetchAdminRouting } from '../api/adminRouting.api.js'

const FRESHNESS_MS = 60_000
const LABELS = { LOCAL: 'Local database', RAILWAY_DB: 'Railway database', DEPLOYED: 'Deployed database' }

export function useAdminRouting() {
  const routing = ref(null), loading = ref(false), error = ref(''), stale = ref(false)
  let inFlight, controller, timer, disposed = false
  const frontend = typeof window === 'undefined' ? 'Unavailable' : window.location.origin
  const current = computed(() => Boolean(routing.value && !loading.value && !error.value && !stale.value))
  const connected = computed(() => current.value && routing.value.databaseConnected === true)
  const label = computed(() => loading.value ? 'Checking routing' : !current.value ? 'Routing unverified'
    : `${LABELS[routing.value.target.code]} · ${connected.value ? 'Connected' : 'Connection unavailable'}`)

  function refresh() {
    if (disposed) return Promise.resolve()
    if (inFlight) return inFlight
    clearTimeout(timer)
    loading.value = true
    error.value = ''
    routing.value = null
    controller = new AbortController()
    inFlight = (async () => {
      try {
        const value = await fetchAdminRouting({ signal: controller.signal })
        if (disposed) return
        routing.value = value
        const age = Date.now() - Date.parse(value.checkedAt)
        stale.value = !Number.isFinite(age) || age < 0 || age >= FRESHNESS_MS
        if (!stale.value) timer = setTimeout(() => { stale.value = true }, FRESHNESS_MS - age)
      } catch {
        if (!disposed) error.value = 'Data routing could not be verified. Recheck before making changes.'
      } finally {
        if (!disposed) loading.value = false
        inFlight = null
      }
    })()
    return inFlight
  }
  function recheckVisibleTab() {
    if (!document.hidden && (!routing.value || stale.value)) void refresh()
  }
  onMounted(() => {
    document.addEventListener('visibilitychange', recheckVisibleTab)
    if (!document.hidden) void refresh()
  })
  onUnmounted(() => {
    disposed = true
    clearTimeout(timer)
    controller?.abort()
    document.removeEventListener('visibilitychange', recheckVisibleTab)
  })
  return { frontend, routing, loading, error, stale, current, connected, label, refresh }
}
