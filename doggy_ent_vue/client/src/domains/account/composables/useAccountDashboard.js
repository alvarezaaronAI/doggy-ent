import { computed, ref } from 'vue'
import { fetchAccountDashboard } from '../api/account.api.js'

export function useAccountDashboard() {
  const dashboard = ref(null)
  const loading = ref(false)
  const error = ref('')
  const recentOrders = computed(() => (dashboard.value?.recentOrders || []).slice(0, 2))
  async function loadDashboard() {
    loading.value = true
    error.value = ''
    try {
      dashboard.value = await fetchAccountDashboard()
    } catch (cause) {
      error.value = cause.message || 'Unable to load your account.'
    } finally {
      loading.value = false
    }
  }
  return { dashboard, error, loading, loadDashboard, recentOrders }
}
