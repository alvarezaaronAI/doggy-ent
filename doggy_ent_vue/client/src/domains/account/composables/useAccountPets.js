import { computed, onScopeDispose, ref } from 'vue'
import { fetchAccountPets, saveAccountPet, deleteAccountPet, archiveAccountPet, uploadAccountPetPhoto, deleteAccountPetPhoto } from '../api/accountPets.api.js'
export function useAccountPets() {
  const pets = ref([]), loading = ref(false), saving = ref(false), error = ref(''), notice = ref('')
  const editing = ref(null), editorOpen = ref(false), removing = ref('')
  const activePets = computed(() => pets.value.filter(pet => !pet.archivedAt))
  const archivedPets = computed(() => pets.value.filter(pet => pet.archivedAt))
  let active = true, generation = 0
  function replace(result) {
    const index = pets.value.findIndex(pet => pet.id === result.id)
    if (index < 0) pets.value.push(result); else pets.value[index] = result
  }
  async function load() {
    if (saving.value) return
    const current = ++generation
    loading.value = true; error.value = ''
    try { const result = await fetchAccountPets(); if (active && current === generation) pets.value = result }
    catch { if (active && current === generation) error.value = 'We could not load your pets. Please try again.' }
    finally { if (active && current === generation) loading.value = false }
  }
  function edit(pet = null) { if (!saving.value) { editing.value = pet; editorOpen.value = true; error.value = ''; notice.value = ''; removing.value = '' } }
  function closeEditor() { if (!saving.value) { editorOpen.value = false; error.value = '' } }
  async function save(input) {
    if (saving.value) return
    const { values = input, photoFile = null, removePhoto = false } = input
    saving.value = true; loading.value = false; error.value = ''; generation++
    let profileSaved = false
    try {
      let result = await saveAccountPet(editing.value?.id, values)
      if (!active) return
      replace(result); editing.value = result; profileSaved = true
      if (photoFile) result = await uploadAccountPetPhoto(result.id, photoFile)
      else if (removePhoto && result.hasPhoto) result = await deleteAccountPetPhoto(result.id)
      if (!active) return
      replace(result); editorOpen.value = false; notice.value = 'Pet details saved.'
    } catch (failure) {
      if (active) error.value = profileSaved ? 'Pet details were saved, but the photo change did not finish. Try saving again or cancel to keep the saved details.' : failure.message === 'A saved birthday cannot be changed.' ? failure.message : 'We could not save these details. Check the fields and try again.'
    } finally { saving.value = false }
  }
  async function archive(pet) {
    if (saving.value) return
    saving.value = true; loading.value = false; error.value = ''; notice.value = ''; generation++
    try { const result = await archiveAccountPet(pet.id, !pet.archivedAt); if (active) { replace(result); notice.value = result.archivedAt ? 'Pet archived. Their details are kept below and can be restored.' : 'Pet restored to your pack.' } }
    catch { if (active) error.value = 'We could not update this pet. Please try again.' }
    finally { saving.value = false }
  }
  async function remove(pet) {
    if (saving.value || removing.value !== pet.id) return
    saving.value = true; loading.value = false; error.value = ''; generation++
    try { await deleteAccountPet(pet.id); if (active) { pets.value = pets.value.filter(item => item.id !== pet.id); removing.value = ''; notice.value = 'Pet details and their photo removed. Limited dated account activity remains.' } }
    catch { if (active) error.value = 'We could not remove these details. Please try again.' }
    finally { saving.value = false }
  }
  onScopeDispose(() => { active = false; generation++ })
  return { pets, activePets, archivedPets, loading, saving, error, notice, editing, editorOpen, removing, load, edit, closeEditor, save, archive, remove }
}
