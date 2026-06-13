import { ref } from 'vue'
import {
  fetchAccountProfile,
  updateAccountProfile,
} from '../api/account.api.js'

export function useAccountProfile() {
  const profile = ref(null)
  const loading = ref(false)
  const saving = ref(false)
  const error = ref('')

  async function loadProfile() {
    loading.value = true
    error.value = ''

    try {
      profile.value = await fetchAccountProfile()
    }
    catch (loadError) {
      error.value = loadError.message || 'Unable to load profile.'
    }
    finally {
      loading.value = false
    }
  }

  async function saveProfile(payload) {
    saving.value = true
    error.value = ''

    try {
      profile.value = await updateAccountProfile(payload)
      return profile.value
    }
    catch (saveError) {
      error.value = saveError.message || 'Unable to save profile.'
      throw saveError
    }
    finally {
      saving.value = false
    }
  }

  return {
    error,
    loadProfile,
    loading,
    profile,
    saveProfile,
    saving,
  }
}
