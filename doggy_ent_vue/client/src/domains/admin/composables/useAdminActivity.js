import { reactive, ref } from 'vue'

export function useAdminActivity(fetchActivity, initialFilters, limit) {
  const data = ref(null)
  const filters = reactive({ ...initialFilters })
  const loading = ref(false)
  const error = ref('')
  async function load() {
    if (loading.value) return
    loading.value = true
    error.value = ''
    try {
      const params = Object.fromEntries(
        Object.entries(filters).map(([key, value]) => [
          key,
          typeof value === 'string' ? value.trim() : value,
        ]),
      )
      data.value = await fetchActivity({ ...params, limit })
    } catch (cause) {
      error.value = cause.message || 'Unable to load activity. Try again.'
    } finally {
      loading.value = false
    }
  }
  return { data, filters, loading, error, load }
}
