import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { onBeforeRouteLeave } from 'vue-router'
import { fetchEmailTemplates, previewEmailTemplate, saveEmailTemplate } from '../api/adminEmailTemplates.api.js'
const clone = value => JSON.parse(JSON.stringify(value))
export function useAdminEmailTemplates() {
  const templates = ref([]), draft = ref(null), baseline = ref(''), preview = ref(null), provider = ref(null)
  const loading = ref(true), saving = ref(false), error = ref(''), message = ref(''), previewError = ref('')
  const dirty = computed(() => draft.value && JSON.stringify(draft.value) !== baseline.value)
  let timer, generation = 0
  function select(template) {
    if (saving.value || dirty.value && !window.confirm('Discard unsaved email template changes?')) return
    draft.value = clone(template); baseline.value = JSON.stringify(draft.value); message.value = ''; error.value = ''
  }
  async function load(selectedId) {
    loading.value = true; error.value = ''
    try {
      const data = await fetchEmailTemplates(); templates.value = data.templates; provider.value = data.provider
      const next = templates.value.find(item => item.id === selectedId) || templates.value.find(item => !item.archived)
      draft.value = next ? clone(next) : null; baseline.value = JSON.stringify(draft.value)
    } catch (e) { error.value = e.message } finally { loading.value = false }
  }
  async function refreshPreview() {
    const requestId = ++generation
    preview.value = null; previewError.value = ''
    if (!draft.value) return
    try { const data = await previewEmailTemplate(draft.value.id, { draft: clone(draft.value) }); if (requestId === generation) preview.value = data }
    catch (e) { if (requestId === generation) previewError.value = e.message }
  }
  watch(draft, () => { generation++; preview.value = null; clearTimeout(timer); timer = setTimeout(refreshPreview, 250) }, { deep: true })
  async function save() {
    if (saving.value || !draft.value) return
    saving.value = true; error.value = ''
    try { const saved = await saveEmailTemplate(clone(draft.value)); await load(saved.id); message.value = 'Template saved. No customer email was sent.' }
    catch (e) { error.value = e.message } finally { saving.value = false }
  }
  function cancel() { if (!saving.value) draft.value = JSON.parse(baseline.value) }
  const beforeUnload = event => { if (dirty.value) { event.preventDefault(); event.returnValue = '' } }
  onMounted(() => { load(); window.addEventListener('beforeunload', beforeUnload) })
  onBeforeUnmount(() => { generation++; clearTimeout(timer); window.removeEventListener('beforeunload', beforeUnload) })
  onBeforeRouteLeave(() => !saving.value && (!dirty.value || window.confirm('Leave without saving email changes?')))
  return { templates, draft, preview, provider, loading, saving, dirty, error, message, previewError, select, save, cancel, load }
}
