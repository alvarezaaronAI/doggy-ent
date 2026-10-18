import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { onBeforeRouteLeave } from 'vue-router'
import { createSection, SECTION_CATALOG } from '@storefront-content/sectionCatalog.js'
import { validateStorefrontContent } from '@storefront-content/contentValidation.js'
import { commercePresentation } from '@storefront-content/commercePresentation.js'
import { pagePresentation, announcementMessages } from '@storefront-content/pagePresentation.js'
import { fetchWebsiteDraft, saveWebsiteDraft } from '../api/adminWebsite.api.js'
import { createDefaultClientStorefrontContent, useStorefrontContent } from '@storefront/composables/useStorefrontContent.js'

const clone = (value) => JSON.parse(JSON.stringify(value))
export function useAdminWebsite() {
  const draft = ref(null), revision = ref(0), saved = ref(''), published = ref(null)
  const publishedAt = ref(null), loading = ref(true), busy = ref(false), error = ref(''), success = ref('')
  const selected = ref('hero')
  const dirty = computed(() => draft.value && JSON.stringify(draft.value) !== saved.value)
  const changedSections = computed(() => {
    if (!draft.value || !saved.value) return []
    const baseline = JSON.parse(saved.value)
    const changed = ['announcement', 'header', 'footer', 'theme', 'checkout'].filter(key => JSON.stringify(draft.value[key]) !== JSON.stringify(baseline[key]))
    for (const area of Object.keys(draft.value.presentation)) if (JSON.stringify(draft.value.presentation[area]) !== JSON.stringify(baseline.presentation?.[area])) changed.push(area)
    const confirmationAreas = { confirmation: ['title', 'introduction', 'background'], 'confirmation-next': ['nextTitle', 'nextText'], 'confirmation-help': ['helpTitle', 'helpText', 'helpLabel', 'helpUrl'] }
    for (const [area, fields] of Object.entries(confirmationAreas)) if (fields.some(key => draft.value.confirmation?.[key] !== baseline.confirmation?.[key])) changed.push(area)
    draft.value.sections.forEach((block, index) => {
      if (JSON.stringify(block) !== JSON.stringify(baseline.sections.find(item => item.id === block.id)) || baseline.sections[index]?.id !== block.id) changed.push(block.id)
    })
    return changed
  })
  const hasUnpublishedChanges = computed(() => draft.value && JSON.stringify(draft.value) !== JSON.stringify(published.value))
  const selectedBlock = computed(() => draft.value?.sections.find(block => block.id === selected.value))
  const availableTypes = computed(() => Object.entries(SECTION_CATALOG).filter(([type, definition]) => !definition.singleton || !draft.value?.sections.some(block => block.type === type)))
  const { usePublishedContent } = useStorefrontContent()
  function accept(data) {
    if (data.revision === 0) data = { ...data, draft: createDefaultClientStorefrontContent() }
    const normalize = value => ({ ...value, ...commercePresentation(value), presentation: pagePresentation(value), announcement: { ...value.announcement, messages: announcementMessages(value.announcement) } })
    draft.value = clone(normalize(data.draft))
    saved.value = JSON.stringify(draft.value)
    revision.value = data.revision
    published.value = data.published ? clone(normalize(data.published)) : null
    publishedAt.value = data.publishedAt
    if (!['announcement', 'header', 'footer', 'theme', 'checkout', 'confirmation', 'confirmation-next', 'confirmation-help'].includes(selected.value) && !draft.value.sections.some(block => block.id === selected.value)) selected.value = draft.value.sections[0]?.id || 'header'
  }
  async function load() {
    if (dirty.value && !window.confirm('Discard unsaved website changes and reload?')) return
    loading.value = true; error.value = ''; success.value = ''
    try { accept(await fetchWebsiteDraft()) }
    catch (e) { error.value = e.message }
    finally { loading.value = false }
  }
  async function save(publish = false) {
    if (busy.value || !draft.value) return
    error.value = ''; success.value = ''
    const validation = validateStorefrontContent(draft.value)
    if (validation) { error.value = validation; return }
    if (publish && !window.confirm('Publish this website to the selected database? Customers using this database will see these changes.')) return
    busy.value = true
    const content = clone(draft.value)
    try {
      const data = await saveWebsiteDraft(content, revision.value, publish)
      accept(data)
      if (publish) usePublishedContent(data.published)
      success.value = publish ? 'Website published.' : 'Draft saved. The live website is unchanged.'
    } catch (e) { error.value = e.message }
    finally { busy.value = false }
  }
  function cancel() {
    if (!dirty.value || window.confirm('Discard unsaved website changes?')) draft.value = JSON.parse(saved.value)
  }
  function restorePublished() {
    if (published.value && window.confirm('Replace this draft with the current published website? Nothing changes live until Publish.')) draft.value = clone({ ...published.value, ...commercePresentation(published.value) })
  }
  function addSection(type) {
    if (busy.value || draft.value.sections.length >= 24 || !availableTypes.value.some(([key]) => key === type)) return
    let id = `${type}-1`, number = 1
    while (draft.value.sections.some(block => block.id === id)) id = `${type}-${++number}`
    draft.value.sections.push(createSection(type, id)); selected.value = id
  }
  function moveSection(id, offset) {
    const index = draft.value.sections.findIndex(block => block.id === id), target = index + offset
    if (busy.value || index < 0 || target < 0 || target >= draft.value.sections.length) return
    const [block] = draft.value.sections.splice(index, 1)
    draft.value.sections.splice(target, 0, block)
  }
  function removeSection(id) {
    const block = draft.value.sections.find(block => block.id === id)
    if (busy.value || !block || SECTION_CATALOG[block.type].singleton || id === 'shop') return
    if (!window.confirm('Remove this section from the draft? Nothing changes live until Publish.')) return
    draft.value.sections = draft.value.sections.filter(block => block.id !== id)
    selected.value = draft.value.sections[0]?.id || 'header'
  }
  function beforeUnload(event) { if (dirty.value) { event.preventDefault(); event.returnValue = '' } }
  onMounted(() => { load(); window.addEventListener('beforeunload', beforeUnload) })
  onBeforeUnmount(() => window.removeEventListener('beforeunload', beforeUnload))
  onBeforeRouteLeave(() => !busy.value && (!dirty.value || window.confirm('Leave without saving website changes?')))
  return { draft, selected, selectedBlock, changedSections, revision, publishedAt, published, loading, busy, error, success, dirty, hasUnpublishedChanges, availableTypes, load, save, cancel, restorePublished, addSection, moveSection, removeSection }
}
