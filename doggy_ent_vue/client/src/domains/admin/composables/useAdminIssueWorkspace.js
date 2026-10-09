import { computed, reactive, ref } from 'vue'

export function useAdminIssueWorkspace({
  fetchIssues,
  updateIssue,
  defaults,
  initialFilters,
}) {
  const issues = ref([])
  const counts = ref({})
  const loading = ref(false)
  const saving = ref(false)
  const error = ref('')
  const message = ref('')
  const selectedCaseNumber = ref('')
  const filters = reactive({ ...initialFilters })
  const editForm = reactive({ ...defaults })
  const selectedIssue = computed(
    () =>
      issues.value.find(
        (issue) => issue.caseNumber === selectedCaseNumber.value,
      ) || null,
  )
  const dirty = computed(() =>
    Object.keys(defaults).some(
      (key) => editForm[key] !== (selectedIssue.value?.[key] ?? defaults[key]),
    ),
  )
  function cancel() {
    for (const key of Object.keys(defaults))
      editForm[key] = selectedIssue.value?.[key] ?? defaults[key]
  }
  function selectIssue(issue) {
    if (saving.value) return
    selectedCaseNumber.value = issue.caseNumber
    message.value = ''
    error.value = ''
    cancel()
  }
  async function loadIssues() {
    if (loading.value || saving.value) return
    loading.value = true
    error.value = ''
    message.value = ''
    try {
      const result = await fetchIssues({ ...filters })
      issues.value = Array.isArray(result?.issues) ? result.issues : []
      counts.value = result?.counts || {}
      if (
        !issues.value.some(
          (issue) => issue.caseNumber === selectedCaseNumber.value,
        )
      )
        selectedCaseNumber.value = issues.value[0]?.caseNumber || ''
      cancel()
    } catch (cause) {
      error.value =
        cause.message || 'Unable to load issues. Apply filters to retry.'
    } finally {
      loading.value = false
    }
  }
  function replaceIssue(updated) {
    issues.value = issues.value.map((issue) =>
      issue.caseNumber === updated.caseNumber ? updated : issue,
    )
  }
  async function saveIssue() {
    if (!selectedIssue.value || saving.value || !dirty.value) return
    saving.value = true
    error.value = ''
    message.value = ''
    try {
      replaceIssue(await updateIssue(selectedCaseNumber.value, { ...editForm }))
      cancel()
      message.value = 'Changes saved. No email was sent.'
    } catch (cause) {
      error.value =
        cause.message || 'Unable to save issue. Your changes are still here.'
    } finally {
      saving.value = false
    }
  }
  return {
    issues,
    counts,
    loading,
    saving,
    error,
    message,
    selectedCaseNumber,
    selectedIssue,
    filters,
    editForm,
    dirty,
    cancel,
    selectIssue,
    loadIssues,
    replaceIssue,
    saveIssue,
  }
}
