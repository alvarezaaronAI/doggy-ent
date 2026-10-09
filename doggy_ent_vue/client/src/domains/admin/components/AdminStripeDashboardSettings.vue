<script setup>
import { ref } from 'vue'
import { useAdminStripeDashboard } from '../composables/useAdminStripeDashboard.js'
const { paymentsUrl, saveUrl } = useAdminStripeDashboard()
const draft = ref(paymentsUrl.value)
const error = ref('')
const message = ref('')
function cancel() {
  draft.value = paymentsUrl.value
  error.value = ''
  message.value = ''
}
function save() {
  error.value = ''
  message.value = ''
  try {
    saveUrl(draft.value)
    draft.value = paymentsUrl.value
    message.value = 'Dashboard link saved for this browser.'
  } catch (cause) {
    error.value = cause.message || 'Browser settings could not be saved.'
  }
}
</script>
<template>
  <details class="mt-4">
    <summary class="text-xs font-medium" @click="cancel">
      Stripe dashboard settings
    </summary>
    <form class="mt-4" @submit.prevent="save">
      <label class="admin-field"
        >Payments base URL<input
          v-model="draft"
          type="url"
          autocomplete="off"
          spellcheck="false"
      /></label>
      <p v-if="error" class="text-red-700 text-xs mt-3" role="alert">
        {{ error }}
      </p>
      <p v-if="message" class="admin-muted mt-3" role="status">{{ message }}</p>
      <div class="flex flex-wrap gap-2 mt-3">
        <button type="button" class="admin-button" @click="cancel">
          Cancel</button
        ><button type="submit" class="admin-button">Save link</button>
      </div>
    </form>
  </details>
</template>
