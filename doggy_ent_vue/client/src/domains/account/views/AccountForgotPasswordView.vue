<template>
  <AccountShell
    title="Reset password"
    subtitle="Password reset email flow is ready for the email provider."
    :show-nav="false"
  >
    <form class="max-w-xl rounded-xl border border-stone-200 bg-white p-6 shadow-sm" @submit.prevent="submit">
      <label class="block text-sm font-semibold text-stone-700">
        Email
        <input
          v-model="email"
          class="mt-2 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none focus:border-emerald-500"
          type="email"
          autocomplete="email"
        />
      </label>

      <p v-if="message" class="mt-4 text-sm font-semibold" :class="messageClass">
        {{ message }}
      </p>

      <button
        class="mt-6 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-emerald-700"
        type="submit"
      >
        Request reset
      </button>
    </form>
  </AccountShell>
</template>

<script setup>
import { computed, ref } from 'vue'
import AccountShell from '../components/AccountShell.vue'
import {
  useAccountAuth,
} from '../composables/useAccountAuth.js'
import {
  normalizeAccountEmail,
} from '../validators/account.validators.js'

const {
  requestPasswordReset,
} = useAccountAuth()

const email = ref('')
const message = ref('')
const messageType = ref('error')
const messageClass = computed(() =>
  messageType.value === 'success'
    ? 'text-emerald-700'
    : 'text-red-600',
)

async function submit() {
  const normalizedEmail = normalizeAccountEmail(email.value)

  if (!normalizedEmail) {
    messageType.value = 'error'
    message.value = 'Email is required.'
    return
  }

  try {
    await requestPasswordReset({
      email: normalizedEmail,
      redirectTo: `${window.location.origin}/account/reset-password`,
    })

    messageType.value = 'success'
    message.value = 'If email delivery is configured, a reset link will be sent.'
  }
  catch (error) {
    messageType.value = 'error'
    message.value = error.message || 'Unable to request reset.'
  }
}
</script>
