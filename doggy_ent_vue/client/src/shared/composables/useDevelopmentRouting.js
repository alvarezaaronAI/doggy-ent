import { computed, ref } from 'vue'
import { getApiBaseUrl } from '../api/http.js'
import { fetchDevelopmentContext } from '../api/development.api.js'

export function useDevelopmentRouting() {
  const context = ref(null), loading = ref(false), error = ref(''), checkedAt = ref('')
  const frontend = window.location.origin
  const backend = new URL(getApiBaseUrl() || frontend, frontend).origin
  const verified = computed(() => context.value?.databaseConnected === true &&
    ['LOCAL', 'RAILWAY_DB'].includes(context.value?.target?.code))
  const label = computed(() => verified.value ? context.value.target.label : 'DATA TARGET UNVERIFIED')

  async function refresh() {
    if (loading.value) return
    loading.value = true
    error.value = ''
    context.value = null
    try {
      const health = await fetchDevelopmentContext()
      context.value = health.development || null
      if (!verified.value) error.value = 'This API did not confirm a development database target. It may be a deployed or older backend.'
      checkedAt.value = new Date().toLocaleTimeString()
    } catch {
      error.value = 'Backend verification failed. Check that the intended local server is running.'
      checkedAt.value = ''
    } finally { loading.value = false }
  }

  return { frontend, backend, mode: import.meta.env.MODE, context, verified, label, loading, error, checkedAt, refresh }
}
