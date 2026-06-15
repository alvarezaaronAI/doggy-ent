<template>
  <AccountShell
    title="Profile"
    subtitle="Manage the customer details attached to your account."
  >
    <div class="grid gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(320px,0.65fr)]">
      <form class="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm" @submit.prevent="submit">
        <div class="grid gap-4 md:grid-cols-2">
          <label class="block text-sm font-bold text-stone-700">
            First name
            <input
              v-model="form.firstName"
              class="mt-2 w-full rounded-xl border border-stone-300 px-4 py-3 text-sm outline-none focus:border-emerald-500"
              type="text"
            />
          </label>

          <label class="block text-sm font-bold text-stone-700">
            Last name
            <input
              v-model="form.lastName"
              class="mt-2 w-full rounded-xl border border-stone-300 px-4 py-3 text-sm outline-none focus:border-emerald-500"
              type="text"
            />
          </label>
        </div>

        <label class="mt-4 block text-sm font-bold text-stone-700">
          Phone
          <input
            v-model="form.phone"
            class="mt-2 w-full rounded-xl border border-stone-300 px-4 py-3 text-sm outline-none focus:border-emerald-500"
            type="tel"
          />
        </label>

        <fieldset class="mt-5 rounded-xl border border-stone-200 bg-stone-50 p-4">
          <legend class="px-1 text-sm font-black text-stone-800">
            Marketing preferences
          </legend>

          <div class="mt-3 grid gap-3 sm:grid-cols-2">
            <label
              v-for="option in marketingOptions"
              :key="option.value"
              class="flex items-start gap-3 rounded-xl border bg-white p-4 text-sm font-semibold text-stone-700"
              :class="form.marketingOptIn === option.value ? 'border-emerald-400 ring-2 ring-emerald-100' : 'border-stone-200'"
            >
              <input
                v-model="form.marketingOptIn"
                class="mt-1"
                type="radio"
                :value="option.value"
              />
              <span>
                <span class="block font-black text-stone-900">{{ option.label }}</span>
                <span class="mt-1 block text-stone-500">{{ option.description }}</span>
              </span>
            </label>
          </div>
        </fieldset>

        <fieldset class="mt-5 rounded-xl border border-stone-200 bg-white p-4">
          <legend class="px-1 text-sm font-black text-stone-800">
            Preferred contact method
          </legend>

          <div class="mt-3 grid gap-3 sm:grid-cols-3">
            <label
              v-for="option in contactOptions"
              :key="option.value"
              class="flex items-center gap-2 rounded-xl border px-3 py-3 text-sm font-bold text-stone-700"
              :class="form.preferredContactMethod === option.value ? 'border-emerald-400 bg-emerald-50 text-emerald-800' : 'border-stone-200'"
            >
              <input
                v-model="form.preferredContactMethod"
                type="radio"
                :value="option.value"
              />
              <span>{{ option.label }}</span>
            </label>
          </div>

          <p class="mt-3 text-xs font-semibold text-stone-500">
            Order confirmations still go to your account email. This preference prepares future support and notification flows.
          </p>
        </fieldset>

        <p v-if="message" class="mt-4 rounded-xl px-4 py-3 text-sm font-semibold" :class="messageClass">
          {{ message }}
        </p>

        <button
          class="mt-6 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-black text-white transition hover:bg-emerald-700 disabled:opacity-60"
          :disabled="saving"
          type="submit"
        >
          {{ saving ? 'Saving...' : 'Save profile' }}
        </button>
      </form>

      <aside class="space-y-4">
        <section class="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
          <p class="text-xs font-black uppercase tracking-[0.18em] text-stone-400">
            Account email
          </p>
          <p class="mt-2 break-words font-black text-[var(--brand-4)]">
            {{ profile?.email || 'Loading...' }}
          </p>
          <p class="mt-2 text-sm font-semibold" :class="profile?.emailVerified ? 'text-emerald-700' : 'text-amber-700'">
            {{ profile?.emailVerified ? 'Verified email' : 'Email verification pending' }}
          </p>
          <p class="mt-3 text-sm text-stone-500">
            Email changes are disabled until the verification flow is fully implemented.
          </p>
        </section>

        <section class="rounded-2xl border border-dashed border-stone-300 bg-white p-6">
          <p class="text-xs font-black uppercase tracking-[0.18em] text-stone-400">
            Coming in future phase
          </p>
          <h2 class="mt-2 font-black text-[var(--brand-4)]">Saved addresses</h2>
          <p class="mt-2 text-sm text-stone-500">
            The profile has a foundation for saved checkout details, but the full address book is intentionally not active yet.
          </p>
          <div class="mt-4 space-y-3 text-sm">
            <div class="rounded-xl bg-stone-50 p-4">
              <p class="font-black text-stone-900">Default shipping address</p>
              <p class="mt-1 text-stone-500">Coming in future phase.</p>
            </div>
            <div class="rounded-xl bg-stone-50 p-4">
              <p class="font-black text-stone-900">Default billing address</p>
              <p class="mt-1 text-stone-500">Coming in future phase.</p>
            </div>
            <div class="rounded-xl bg-stone-50 p-4">
              <p class="font-black text-stone-900">Preferred shipping profile</p>
              <p class="mt-1 text-stone-500">Coming in future phase.</p>
            </div>
          </div>
        </section>
      </aside>
    </div>
  </AccountShell>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import AccountShell from '../components/AccountShell.vue'
import {
  useAccountProfile,
} from '../composables/useAccountProfile.js'
import {
  validateProfileForm,
} from '../validators/account.validators.js'

const {
  loadProfile,
  profile,
  saveProfile,
  saving,
} = useAccountProfile()

const message = ref('')
const messageType = ref('error')
const form = reactive({
  firstName: '',
  lastName: '',
  phone: '',
  marketingOptIn: false,
  preferredContactMethod: 'EMAIL',
})

const marketingOptions = [
  {
    label: 'Opt in',
    description: 'Send new drops, offers, rewards, and account updates.',
    value: true,
  },
  {
    label: 'Opt out',
    description: 'Only send transactional order and account messages.',
    value: false,
  },
]

const contactOptions = [
  {
    label: 'Email',
    value: 'EMAIL',
  },
  {
    label: 'Phone',
    value: 'PHONE',
  },
  {
    label: 'Text',
    value: 'TEXT',
  },
]

const messageClass = computed(() =>
  messageType.value === 'success'
    ? 'bg-emerald-50 text-emerald-700'
    : 'bg-red-50 text-red-700',
)

function syncForm() {
  form.firstName = profile.value?.profile?.firstName || ''
  form.lastName = profile.value?.profile?.lastName || ''
  form.phone = profile.value?.profile?.phone || ''
  form.marketingOptIn = Boolean(profile.value?.profile?.marketingOptIn)
  form.preferredContactMethod =
    profile.value?.profile?.preferredContactMethod || 'EMAIL'
}

async function submit() {
  message.value = validateProfileForm(form)
  messageType.value = 'error'

  if (message.value) {
    return
  }

  try {
    await saveProfile(form)
    messageType.value = 'success'
    message.value = 'Profile saved.'
  }
  catch (error) {
    message.value = error.message || 'Unable to save profile.'
  }
}

onMounted(async () => {
  await loadProfile()
  syncForm()
})
</script>
