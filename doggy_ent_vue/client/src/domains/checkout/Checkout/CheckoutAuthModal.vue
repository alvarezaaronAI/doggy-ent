<script setup>
import { computed, reactive, ref, watch } from 'vue'
import {
  useAccountAuth,
} from '@domains/account/composables/useAccountAuth.js'
import {
  normalizeAccountEmail,
  validateCreateAccountForm,
  validateSignInForm,
} from '@domains/account/validators/account.validators.js'

const props = defineProps({
  mode: {
    type: String,
    default: 'sign-in',
  },
})

const emit = defineEmits(['authenticated', 'close'])

const { loading, signIn, signUp } = useAccountAuth()
const activeMode = ref(props.mode)
const message = ref('')
const signInForm = reactive({
  email: '',
  password: '',
})
const createForm = reactive({
  name: '',
  email: '',
  password: '',
})

const isCreateMode = computed(() => activeMode.value === 'create')

watch(
  () => props.mode,
  (mode) => {
    activeMode.value = mode || 'sign-in'
    message.value = ''
  },
)

function switchMode(mode) {
  activeMode.value = mode
  message.value = ''
}

async function submit() {
  message.value = isCreateMode.value
    ? validateCreateAccountForm(createForm)
    : validateSignInForm(signInForm)

  if (message.value) {
    return
  }

  try {
    if (isCreateMode.value) {
      await signUp({
        ...createForm,
        email: normalizeAccountEmail(createForm.email),
      })
    }
    else {
      await signIn({
        ...signInForm,
        email: normalizeAccountEmail(signInForm.email),
      })
    }

    emit('authenticated')
  }
  catch (error) {
    message.value = error.message || 'Unable to continue.'
  }
}
</script>

<template>
  <Teleport to="body">
    <div class="fixed inset-0 z-[130] bg-black/50" @click="emit('close')"></div>

    <section
      class="fixed left-1/2 top-1/2 z-[140] w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-stone-200 bg-white p-6 text-stone-900 shadow-2xl"
      aria-modal="true"
      role="dialog"
      aria-labelledby="checkout-auth-title"
    >
      <div class="flex items-start justify-between gap-4">
        <div>
          <p class="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">
            Checkout account
          </p>
          <h2 id="checkout-auth-title" class="mt-1 text-2xl font-black text-[var(--brand-4)]">
            {{ isCreateMode ? 'Create account' : 'Sign in' }}
          </h2>
          <p class="mt-2 text-sm text-stone-500">
            Continue checkout without losing your cart or entered details.
          </p>
        </div>

        <button
          class="inline-flex h-9 w-9 items-center justify-center rounded-full border border-stone-200 text-stone-500 hover:border-emerald-400 hover:text-emerald-700"
          type="button"
          aria-label="Close account sign in"
          @click="emit('close')"
        >
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>

      <form class="mt-5 space-y-4" @submit.prevent="submit">
        <label v-if="isCreateMode" class="block text-sm font-bold text-stone-700">
          Name
          <input
            v-model="createForm.name"
            class="mt-2 w-full rounded-xl border border-stone-300 px-4 py-3 text-sm outline-none focus:border-emerald-500"
            type="text"
            autocomplete="name"
            placeholder="Your name"
          />
        </label>

        <label v-if="isCreateMode" class="block text-sm font-bold text-stone-700">
          Email
          <input
            v-model="createForm.email"
            class="mt-2 w-full rounded-xl border border-stone-300 px-4 py-3 text-sm outline-none focus:border-emerald-500"
            type="email"
            autocomplete="email"
            placeholder="you@example.com"
          />
        </label>

        <label v-else class="block text-sm font-bold text-stone-700">
          Email
          <input
            v-model="signInForm.email"
            class="mt-2 w-full rounded-xl border border-stone-300 px-4 py-3 text-sm outline-none focus:border-emerald-500"
            type="email"
            autocomplete="email"
            placeholder="you@example.com"
          />
        </label>

        <label v-if="isCreateMode" class="block text-sm font-bold text-stone-700">
          Password
          <input
            v-model="createForm.password"
            class="mt-2 w-full rounded-xl border border-stone-300 px-4 py-3 text-sm outline-none focus:border-emerald-500"
            type="password"
            autocomplete="new-password"
            placeholder="At least 8 characters"
          />
        </label>

        <label v-else class="block text-sm font-bold text-stone-700">
          Password
          <input
            v-model="signInForm.password"
            class="mt-2 w-full rounded-xl border border-stone-300 px-4 py-3 text-sm outline-none focus:border-emerald-500"
            type="password"
            autocomplete="current-password"
            placeholder="Your password"
          />
        </label>

        <p v-if="message" class="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {{ message }}
        </p>

        <button
          class="w-full rounded-xl bg-emerald-600 px-5 py-3 text-sm font-black text-white transition hover:bg-emerald-700 disabled:opacity-60"
          :disabled="loading"
          type="submit"
        >
          {{ loading ? 'Working...' : isCreateMode ? 'Create account and return to checkout' : 'Sign in and return to checkout' }}
        </button>
      </form>

      <div class="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm">
        <button
          v-if="isCreateMode"
          class="font-bold text-emerald-700 hover:text-emerald-900"
          type="button"
          @click="switchMode('sign-in')"
        >
          Sign in instead
        </button>
        <button
          v-else
          class="font-bold text-emerald-700 hover:text-emerald-900"
          type="button"
          @click="switchMode('create')"
        >
          Create account instead
        </button>

        <button
          class="font-bold text-stone-500 hover:text-stone-800"
          type="button"
          @click="emit('close')"
        >
          Continue as guest
        </button>
      </div>
    </section>
  </Teleport>
</template>
