

import { ref } from 'vue'

import {
  createPromo,
  deletePromo,
  fetchPromos,
  updatePromo,
} from '../api/promos.api'

export function usePromos() {
  const promos = ref([])
  const isLoading = ref(false)
  const isSaving = ref(false)
  const errorMessage = ref('')
  const successMessage = ref('')

  async function loadPromos() {
    isLoading.value = true
    errorMessage.value = ''

    try {
      promos.value = await fetchPromos()
    } catch (error) {
      errorMessage.value = (
        error.message
        || 'Unable to load promo codes.'
      )
    } finally {
      isLoading.value = false
    }
  }

  async function savePromo({
    editingPromoId,
    payload,
    onSuccess,
  }) {
    isSaving.value = true
    errorMessage.value = ''
    successMessage.value = ''

    try {
      if (editingPromoId) {
        await updatePromo(
          editingPromoId,
          payload,
        )

        successMessage.value = 'Promo updated successfully.'
      } else {
        await createPromo(payload)

        successMessage.value = 'Promo created successfully.'
      }

      await loadPromos()

      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      errorMessage.value = (
        error.message
        || 'Unable to save promo code.'
      )
    } finally {
      isSaving.value = false
    }
  }

  async function removePromo({
    promoId,
    onSuccess,
  }) {
    errorMessage.value = ''
    successMessage.value = ''

    try {
      await deletePromo(promoId)

      successMessage.value = 'Promo deleted successfully.'

      await loadPromos()

      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      errorMessage.value = (
        error.message
        || 'Unable to delete promo code.'
      )
    }
  }

  function clearMessages() {
    errorMessage.value = ''
    successMessage.value = ''
  }

  return {
    promos,
    isLoading,
    isSaving,
    errorMessage,
    successMessage,
    loadPromos,
    savePromo,
    removePromo,
    clearMessages,
  }
}