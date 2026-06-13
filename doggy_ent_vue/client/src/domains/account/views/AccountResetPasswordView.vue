<template>
  <AccountShell
    title="Set new password"
    subtitle="Use the token from your password reset email."
    :show-nav="false"
  >
    <form class="max-w-xl rounded-xl border border-stone-200 bg-white p-6 shadow-sm" @submit.prevent="submit">
      <label class="block text-sm font-semibold text-stone-700">
        Reset token
        <input
          v-model="token"
          class="mt-2 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none focus:border-emerald-500"
          type="text"
        />
      </label>

      <label class="mt-4 block text-sm font-semibold text-stone-700">
        New password
        <input
          v-model="password"
          class="mt-2 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm outline-none focus:border-emerald-500"
          type="password"
          autocomplete="new-password"
        />
      </label>

      <p v-if="message" class="mt-4 text-sm font-semibold" :class="messageClass">
        {{ message }}
      </p>

      <button
        class="mt-6 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-emerald-700"
        type="submit"
      >
        Save password
      </button>
    </form>
  </AccountShell>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import AccountShell from '../components/AccountShell.vue'
import {
  resetCustomerPassword,
} from '../api/accountAuth.api.js'

const route = useRoute()
const token = ref(String(route.query.token || ''))
const password = ref('')
const message = ref('')
const messageType = ref('error')
const messageClass = computed(() =>
  messageType.value === 'success'
    ? 'text-emerald-700'
    : 'text-red-600',
)

async function submit() {
  if (!token.value || password.value.length < 8) {
    messageType.value = 'error'
    message.value = 'Token and an 8-character password are required.'
    return
  }

  try {
    await resetCustomerPassword({
      token: token.value,
      password: password.value,
    })

    messageType.value = 'success'
    message.value = 'Password reset complete. You can sign in now.'
  }
  catch (error) {
    messageType.value = 'error'
    message.value = error.message || 'Unable to reset password.'
  }
}
</script>
