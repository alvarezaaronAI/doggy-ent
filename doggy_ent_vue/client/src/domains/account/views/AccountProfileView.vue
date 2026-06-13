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

        <label class="mt-5 flex items-start gap-3 rounded-xl bg-emerald-50 p-4 text-sm font-semibold text-stone-700">
          <input
            v-model="form.marketingOptIn"
            class="mt-1"
            type="checkbox"
          />
          <span>Email me about new treat drops, exclusive offers, and future rewards.</span>
        </label>

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
          <h2 class="font-black text-[var(--brand-4)]">Address readiness</h2>
          <p class="mt-2 text-sm text-stone-500">
            Saved addresses are prepared in the account architecture and will be added after the verification and address safety flow is ready.
          </p>
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
})

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
