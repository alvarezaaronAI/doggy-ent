

<template>
  <main class="min-h-screen bg-[var(--brand-5)] text-slate-900">
    <section class="mx-auto flex min-h-screen max-w-xl items-center px-6 py-10">
      <div class="section-panel w-full p-8 md:p-10">
        <p class="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-400">Doggy Ent Admin</p>
        <h1 class="mt-2 text-3xl font-extrabold text-[var(--brand-4)]">Admin Login</h1>
        <p class="mt-3 text-sm text-stone-400">
          Sign in to manage orders, products, promos, and donation campaigns.
        </p>

        <form class="mt-8 space-y-5" @submit.prevent="login">
          <label class="block">
            <span class="mb-2 block text-sm font-semibold text-[var(--brand-4)]">Email</span>
            <input
              v-model="email"
              type="email"
              autocomplete="username"
              required
              class="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 outline-none transition focus:border-emerald-400"
              placeholder="admin@doggyent.local"
            />
          </label>

          <label class="block">
            <span class="mb-2 block text-sm font-semibold text-[var(--brand-4)]">Password</span>
            <input
              v-model="password"
              type="password"
              autocomplete="current-password"
              required
              class="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 outline-none transition focus:border-emerald-400"
              placeholder="Enter password"
            />
          </label>

          <div
            v-if="message"
            class="rounded-2xl border p-4 text-sm font-semibold"
            :class="messageType === 'success'
              ? 'border-green-200 bg-green-50 text-green-800'
              : 'border-red-200 bg-red-50 text-red-800'"
          >
            {{ message }}
          </div>

          <button
            type="submit"
            class="focus-ring w-full rounded-xl bg-emerald-400 px-5 py-3 font-bold text-[var(--brand-4)] transition hover:bg-emerald-300 disabled:opacity-60"
            :disabled="isLoading"
          >
            {{ isLoading ? 'Signing in...' : 'Sign In' }}
          </button>
        </form>
      </div>
    </section>
  </main>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const email = ref('admin@doggyent.local')
const password = ref('')
const isLoading = ref(false)
const message = ref('')
const messageType = ref('error')

async function login() {
  isLoading.value = true
  message.value = ''
  messageType.value = 'error'

  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email.value,
        password: password.value,
      }),
    })

    const data = await response.json()

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Unable to sign in.')
    }

    messageType.value = 'success'
    message.value = 'Signed in successfully.'

    router.push('/admin')
  } catch (error) {
    messageType.value = 'error'
    message.value = error.message || 'Unable to sign in.'
  } finally {
    isLoading.value = false
  }
}
</script>