import { computed, onBeforeUnmount, ref } from 'vue'
import { fetchMediaLibrary, saveMediaDetails, uploadMediaImage } from '../api/adminMedia.api.js'
import { validateImageFile } from '../validators/adminImage.validator.js'

export function useAdminImageUpload() {
  const uploading = ref(false), error = ref(''), success = ref('')
  async function upload(file, folder) {
    if (uploading.value) return null
    error.value = validateImageFile(file); success.value = ''
    if (error.value) return null
    uploading.value = true
    try {
      const data = await uploadMediaImage(file, folder)
      success.value = data.reused ? 'Existing library image selected. No duplicate file stored.' : 'Image uploaded and selected. Save page changes when ready.'
      return data.asset
    } catch (e) { error.value = e.message; return null }
    finally { uploading.value = false }
  }
  return { uploading, error, success, upload }
}

export function useAdminMediaLibrary() {
  const search = ref(''), folder = ref(''), page = ref(1), result = ref(null), selected = ref(null)
  const loading = ref(false), busy = ref(false), error = ref(''), success = ref(''), original = ref('')
  const details = computed(() => selected.value && ({ name: selected.value.name, altText: selected.value.altText, folder: selected.value.folder }))
  const dirty = computed(() => details.value && JSON.stringify(details.value) !== original.value)
  let generation = 0
  function select(asset) { selected.value = { ...asset }; original.value = JSON.stringify(details.value); success.value = '' }
  async function load(nextPage = 1) {
    const request = ++generation
    loading.value = true; error.value = ''; success.value = ''; selected.value = null
    try {
      const data = await fetchMediaLibrary({ search: search.value, folder: folder.value, page: nextPage })
      if (request !== generation) return
      result.value = data; page.value = data.page
    } catch (e) { if (request === generation) { error.value = e.message; result.value = null } }
    finally { if (request === generation) loading.value = false }
  }
  async function save() {
    if (busy.value || !selected.value || !dirty.value) return
    busy.value = true; error.value = ''; success.value = ''
    try {
      const { asset } = await saveMediaDetails(selected.value.id, details.value)
      result.value.assets = result.value.assets.map(item => item.id === asset.id ? asset : item)
      select(asset); success.value = 'Image details saved. The file and its URL are unchanged.'
    } catch (e) { error.value = e.message }
    finally { busy.value = false }
  }
  onBeforeUnmount(() => { generation++ })
  return { search, folder, page, result, selected, loading, busy, error, success, dirty, load, select, save }
}
