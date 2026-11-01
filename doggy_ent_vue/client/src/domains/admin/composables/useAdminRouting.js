import { computed, onMounted, onUnmounted, ref } from 'vue'
import { fetchAdminRouting } from '../api/adminRouting.api.js'

const FRESHNESS_MS = 60_000
const LABELS = { LOCAL: 'Local database', RAILWAY_DB: 'Railway database', DEPLOYED: 'Deployed database' }

export function useAdminRouting() {
  const routing = ref(null), loading = ref(false), error = ref(''), stale = ref(false)
  let inFlight, controller, timer, requestedAt, requestedTick, disposed = false
  const frontend = typeof window === 'undefined' ? 'Unavailable' : window.location.origin
  const current = computed(() => Boolean(routing.value && !loading.value && !error.value && !stale.value))
  const connected = computed(() => current.value && routing.value.databaseConnected === true)
  const label = computed(() => loading.value ? 'Checking routing' : !current.value ? 'Routing unverified'
    : `${LABELS[routing.value.target.code]} · ${connected.value ? 'Connected' : 'Connection unavailable'}`)

  function updateFreshness() {
    // The no-store probe is fresh for at most a minute from this browser's request.
    // Wall time covers sleep; monotonic time prevents clock rollback extending it.
    const wallAge = Date.now() - requestedAt
    const tickAge = performance.now() - requestedTick
    const age = Math.max(wallAge, tickAge)
    stale.value = !Number.isFinite(age) || wallAge < 0 || tickAge < 0 || age >= FRESHNESS_MS
    return age
  }
  function refresh() {
    if (disposed) return Promise.resolve()
    if (inFlight) return inFlight
    clearTimeout(timer)
    loading.value = true
    error.value = ''
    routing.value = null
    requestedAt = Date.now()
    requestedTick = performance.now()
    controller = new AbortController()
    inFlight = (async () => {
      try {
        const value = await fetchAdminRouting({ signal: controller.signal })
        if (disposed) return
        routing.value = value
        const age = updateFreshness()
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
    if (document.hidden) return
    if (routing.value) updateFreshness()
    if (!routing.value || stale.value) void refresh()
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
