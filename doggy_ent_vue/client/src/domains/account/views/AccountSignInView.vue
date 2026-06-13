<template>
  <AccountShell
    title="Welcome back"
    subtitle="Sign in for faster checkout, order history, and the rewards/tracking features coming next."
    :show-nav="false"
  >
    <div class="grid gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(320px,0.65fr)]">
      <form class="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm" @submit.prevent="submit">
        <label class="block text-sm font-bold text-stone-700">
          Email
          <input
            v-model="form.email"
            class="mt-2 w-full rounded-xl border border-stone-300 px-4 py-3 text-sm outline-none focus:border-emerald-500"
            type="email"
            autocomplete="email"
            placeholder="you@example.com"
          />
        </label>

        <label class="mt-4 block text-sm font-bold text-stone-700">
          Password
          <input
            v-model="form.password"
            class="mt-2 w-full rounded-xl border border-stone-300 px-4 py-3 text-sm outline-none focus:border-emerald-500"
            type="password"
            autocomplete="current-password"
            placeholder="Your password"
          />
        </label>

        <p v-if="message" class="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {{ message }}
        </p>

        <div class="mt-6 flex flex-wrap items-center gap-3">
          <button
            class="rounded-xl bg-emerald-600 px-5 py-3 text-sm font-black text-white transition hover:bg-emerald-700 disabled:opacity-60"
            :disabled="loading"
            type="submit"
          >
            {{ loading ? 'Signing in...' : 'Sign in' }}
          </button>

          <RouterLink class="text-sm font-bold text-emerald-700 hover:text-emerald-900" to="/account/create">
            Create account
          </RouterLink>

          <RouterLink class="text-sm font-bold text-stone-500 hover:text-stone-800" to="/account/forgot-password">
            Forgot password?
          </RouterLink>
        </div>

        <p class="mt-5 text-sm text-stone-500">
          Prefer to keep moving? Guest checkout stays available.
        </p>
      </form>

      <div class="rounded-2xl border border-emerald-100 bg-emerald-50 p-6">
        <p class="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">
          Treat perks
        </p>
        <h2 class="mt-2 text-2xl font-black text-[var(--brand-4)]">
          Your shop trail, all in one place.
        </h2>
        <ul class="mt-5 space-y-3 text-sm font-semibold text-stone-700">
          <li class="flex gap-3">
            <i class="fa-solid fa-bag-shopping mt-1 text-emerald-600"></i>
            <span>View order history and totals.</span>
          </li>
          <li class="flex gap-3">
            <i class="fa-solid fa-bolt mt-1 text-emerald-600"></i>
            <span>Prefill safe checkout details.</span>
          </li>
          <li class="flex gap-3">
            <i class="fa-solid fa-gift mt-1 text-emerald-600"></i>
            <span>Ready for future rewards and tracking.</span>
          </li>
        </ul>
      </div>
    </div>
  </AccountShell>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AccountShell from '../components/AccountShell.vue'
import {
  useAccountAuth,
} from '../composables/useAccountAuth.js'
import {
  normalizeAccountEmail,
  validateSignInForm,
} from '../validators/account.validators.js'

const router = useRouter()
const route = useRoute()
const { loading, signIn } = useAccountAuth()
const message = ref('')
const form = reactive({
  email: '',
  password: '',
})

async function submit() {
  message.value = validateSignInForm(form)

  if (message.value) {
    return
  }

  try {
    await signIn({
      ...form,
      email: normalizeAccountEmail(form.email),
    })

    router.push(String(route.query.redirect || '/account'))
  }
  catch (error) {
    message.value = error.message || 'Unable to sign in.'
  }
}
</script>
