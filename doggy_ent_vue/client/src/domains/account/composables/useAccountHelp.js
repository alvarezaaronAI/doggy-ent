import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { fetchAccountIssue, fetchAccountIssues } from '../api/account.api.js'

export function useAccountHelp() {
  const route = useRoute(),
    router = useRouter()
  const issues = ref([]),
    selected = ref(null)
  const loading = ref(false),
    error = ref(''),
    detailLoading = ref(false),
    detailError = ref('')
  const openCount = computed(
    () => issues.value.filter((issue) => !['RESOLVED', 'CLOSED'].includes(issue.status)).length
  )
  let request = 0
  async function loadIssues() {
    loading.value = true
    error.value = ''
    try {
      issues.value = await fetchAccountIssues()
    } catch (cause) {
      error.value = cause.message || 'Unable to load your cases.'
    } finally {
      loading.value = false
    }
  }
  async function loadCase(caseNumber) {
    const current = ++request
    selected.value = null
    detailError.value = ''
    detailLoading.value = Boolean(caseNumber)
    if (!caseNumber) return
    try {
      const result = await fetchAccountIssue(caseNumber)
      if (current === request) selected.value = result
    } catch (cause) {
      if (current === request) detailError.value = cause.message || 'Unable to load this case.'
    } finally {
      if (current === request) detailLoading.value = false
    }
  }
  function selectCase(caseNumber) {
    router.replace({ name: 'account-help', query: { case: caseNumber } })
  }
  watch(
    () => route.query.case,
    (value) => loadCase(typeof value === 'string' ? value : ''),
    { immediate: true }
  )
  onMounted(loadIssues)
  onBeforeUnmount(() => {
    request += 1
  })
  return {
    issues,
    selected,
    loading,
    error,
    detailLoading,
    detailError,
    openCount,
    loadIssues,
    loadCase,
    selectCase,
  }
}
