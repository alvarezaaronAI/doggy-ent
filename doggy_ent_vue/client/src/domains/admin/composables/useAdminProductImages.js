import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { onBeforeRouteLeave } from 'vue-router'
import { saveProductImages } from '../api/adminProducts.api.js'

export function useAdminProductImages(product, emit) {
  const clone = value => JSON.parse(JSON.stringify(value))
  const draft = ref({ image: product.image || '', galleryImages: clone(product.galleryImages || []), updatedAt: product.updatedAt })
  const saved = JSON.stringify(draft.value)
  const dirty = computed(() => JSON.stringify(draft.value) !== saved)
  const busy = ref(false), error = ref('')
  async function save() {
    if (busy.value || !dirty.value) return
    error.value = ''
    if (!draft.value.image || draft.value.galleryImages.some(item => !item.image || !item.alt.trim())) { error.value = 'Choose a main photograph and describe each additional image before saving.'; return }
    busy.value = true
    try { emit('saved', await saveProductImages(product.id, clone(draft.value))) }
    catch (e) { error.value = e.message }
    finally { busy.value = false }
  }
  function cancel() { if (!busy.value && (!dirty.value || window.confirm('Discard unsaved product image changes?'))) emit('close') }
  function move(index, offset) { const target = index + offset; if (target < 0 || target >= draft.value.galleryImages.length) return; const [image] = draft.value.galleryImages.splice(index, 1); draft.value.galleryImages.splice(target, 0, image) }
  function beforeUnload(event) { if (dirty.value) { event.preventDefault(); event.returnValue = '' } }
  onMounted(() => window.addEventListener('beforeunload', beforeUnload))
  onBeforeUnmount(() => window.removeEventListener('beforeunload', beforeUnload))
  onBeforeRouteLeave(() => !busy.value && (!dirty.value || window.confirm('Leave without saving product images?')))
  return { draft, dirty, busy, error, save, cancel, move }
}
