<template>
  <AccountShell
    title="Create account"
    subtitle="Keep your treat orders together, speed up checkout, and get ready for future tracking and rewards."
    :show-nav="false"
  >
    <div class="grid gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(320px,0.65fr)]">
      <form class="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm" @submit.prevent="submit">
        <label class="block text-sm font-bold text-stone-700">
          Name
          <input
            v-model="form.name"
            class="mt-2 w-full rounded-xl border border-stone-300 px-4 py-3 text-sm outline-none focus:border-emerald-500"
            type="text"
            autocomplete="name"
            placeholder="Your name"
          />
        </label>

        <label class="mt-4 block text-sm font-bold text-stone-700">
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
            autocomplete="new-password"
            placeholder="At least 8 characters"
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
            {{ loading ? 'Creating account...' : 'Create account' }}
          </button>

          <RouterLink class="text-sm font-bold text-emerald-700 hover:text-emerald-900" to="/account/sign-in">
            Sign in instead
          </RouterLink>
        </div>

        <p class="mt-5 text-sm text-stone-500">
          Your account starts as a customer account. Admin access cannot be created from this form.
        </p>
      </form>

      <div class="rounded-2xl border border-[color-mix(in_srgb,var(--brand-1)_28%,white)] bg-white p-6 shadow-sm">
        <p class="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">
          Why create one?
        </p>
        <div class="mt-5 space-y-4">
          <div class="rounded-xl bg-stone-50 p-4">
            <h2 class="font-black text-[var(--brand-4)]">Faster checkout</h2>
            <p class="mt-1 text-sm text-stone-600">Profile details can help prefill safe fields later.</p>
          </div>
          <div class="rounded-xl bg-stone-50 p-4">
            <h2 class="font-black text-[var(--brand-4)]">Order history</h2>
            <p class="mt-1 text-sm text-stone-600">Find references, totals, and item snapshots.</p>
          </div>
          <div class="rounded-xl bg-stone-50 p-4">
            <h2 class="font-black text-[var(--brand-4)]">Future rewards</h2>
            <p class="mt-1 text-sm text-stone-600">Loyalty, reviews, and referrals have room to grow.</p>
          </div>
        </div>
      </div>
    </div>
  </AccountShell>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import AccountShell from '../components/AccountShell.vue'
import {
  useAccountAuth,
} from '../composables/useAccountAuth.js'
import {
  normalizeAccountEmail,
  validateCreateAccountForm,
} from '../validators/account.validators.js'

const router = useRouter()
const { loading, signUp } = useAccountAuth()
const message = ref('')
const form = reactive({
  name: '',
  email: '',
  password: '',
})

async function submit() {
  message.value = validateCreateAccountForm(form)

  if (message.value) {
    return
  }

  try {
    await signUp({
      ...form,
      email: normalizeAccountEmail(form.email),
    })

    router.push('/account')
  }
  catch (error) {
    message.value = error.message || 'Unable to create account.'
  }
}
</script>
