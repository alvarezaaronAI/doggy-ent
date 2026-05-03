<script setup>
import { computed, onMounted, ref } from 'vue'

const API_BASE_URL = '/api/admin/promos'

const promos = ref([])
const isLoading = ref(false)
const isSaving = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const editingPromoId = ref(null)

const isTestingPromo = ref(false)
const promoTestResult = ref(null)
const promoTestForm = ref({
  code: '',
  subtotal: 50,
  customerEmail: '',
})

const form = ref(getEmptyForm())

const activePromos = computed(() => promos.value.filter((promo) => promo.status === 'active'))
const totalUses = computed(() => promos.value.reduce((total, promo) => total + Number(promo.usedCount || 0), 0))
const totalDiscountGiven = computed(() => promos.value.reduce((total, promo) => total + Number(promo.discountGiven || 0), 0))
const totalDonationGenerated = computed(() => promos.value.reduce((total, promo) => total + Number(promo.donationGenerated || 0), 0))
const totalRevenueGenerated = computed(() => promos.value.reduce((total, promo) => total + Number(promo.revenueGenerated || 0), 0))

function getEmptyForm() {
  return {
    code: '',
    name: '',
    type: 'global',
    status: 'draft',
    discountType: 'fixed',
    discountValue: 0,
    minimumSubtotal: 0,
    usageLimitTotal: '',
    usageLimitPerCustomer: 1,
    assignedCustomerEmail: '',
    referralOwnerName: '',
    donationTarget: '',
    donationType: '',
    donationValue: 0,
    startsAt: '',
    endsAt: '',
  }
}

function normalizeOptionalNumber(value) {
  if (value === '' || value === null || value === undefined) return null
  return Number(value)
}

function normalizeOptionalString(value) {
  const normalized = String(value || '').trim()
  return normalized || null
}

function buildPayload() {
  return {
    code: form.value.code,
    name: form.value.name,
    type: form.value.type,
    status: form.value.status,
    discountType: form.value.discountType,
    discountValue: Number(form.value.discountValue || 0),
    minimumSubtotal: Number(form.value.minimumSubtotal || 0),
    usageLimitTotal: normalizeOptionalNumber(form.value.usageLimitTotal),
    usageLimitPerCustomer: normalizeOptionalNumber(form.value.usageLimitPerCustomer),
    assignedCustomerEmail: normalizeOptionalString(form.value.assignedCustomerEmail),
    referralOwnerName: normalizeOptionalString(form.value.referralOwnerName),
    donationTarget: normalizeOptionalString(form.value.donationTarget),
    donationType: normalizeOptionalString(form.value.donationType),
    donationValue: Number(form.value.donationValue || 0),
    startsAt: normalizeOptionalString(form.value.startsAt),
    endsAt: normalizeOptionalString(form.value.endsAt),
  }
}

function formatPrice(value) {
  return `$${Number(value || 0).toFixed(2)}`
}

function formatDiscount(promo) {
  if (promo.discountType === 'percent') return `${Number(promo.discountValue || 0)}% off`
  return `${formatPrice(promo.discountValue)} off`
}

function formatDonationRule(promo) {
  if (!promo.donationType || !promo.donationValue) return 'No donation rule'
  if (promo.donationType === 'percent') return `${Number(promo.donationValue)}% of subtotal`
  return `${formatPrice(promo.donationValue)} per order`
}

function getPromoTypeLabel(type) {
  const labels = {
    global: 'Global',
    unique: 'Unique customer',
    referral: 'Referral',
    shelter: 'Shelter donation',
  }

  return labels[type] || type
}

function selectPromoForTest(promo) {
  promoTestForm.value.code = promo.code
}

async function testPromoCode() {
  isTestingPromo.value = true
  promoTestResult.value = null
  errorMessage.value = ''

  try {
    const response = await fetch('/api/promos/validate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code: promoTestForm.value.code,
        customerEmail: normalizeOptionalString(promoTestForm.value.customerEmail),
        cart: {
          subtotal: Number(promoTestForm.value.subtotal || 0),
          items: [],
        },
      }),
    })

    const data = await response.json()

    promoTestResult.value = {
      ...data,
      statusCode: response.status,
    }
  } catch (error) {
    promoTestResult.value = {
      valid: false,
      message: error.message || 'Unable to test promo code.',
      discountAmount: 0,
      donationAmount: 0,
      statusCode: 500,
    }
  } finally {
    isTestingPromo.value = false
  }
}

async function loadPromos() {
  isLoading.value = true
  errorMessage.value = ''

  try {
    const response = await fetch(API_BASE_URL)
    if (!response.ok) throw new Error('Unable to load promo codes.')
    promos.value = await response.json()
  } catch (error) {
    errorMessage.value = error.message || 'Unable to load promo codes.'
  } finally {
    isLoading.value = false
  }
}

async function savePromo() {
  isSaving.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    const payload = buildPayload()
    const url = editingPromoId.value ? `${API_BASE_URL}/${editingPromoId.value}` : API_BASE_URL
    const method = editingPromoId.value ? 'PUT' : 'POST'

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Unable to save promo code.')
    }

    successMessage.value = editingPromoId.value ? 'Promo updated successfully.' : 'Promo created successfully.'
    resetForm()
    await loadPromos()
  } catch (error) {
    errorMessage.value = error.message || 'Unable to save promo code.'
  } finally {
    isSaving.value = false
  }
}

function editPromo(promo) {
  editingPromoId.value = promo.id
  successMessage.value = ''
  errorMessage.value = ''

  form.value = {
    code: promo.code || '',
    name: promo.name || '',
    type: promo.type || 'global',
    status: promo.status || 'draft',
    discountType: promo.discountType || 'fixed',
    discountValue: Number(promo.discountValue || 0),
    minimumSubtotal: Number(promo.minimumSubtotal || 0),
    usageLimitTotal: promo.usageLimitTotal ?? '',
    usageLimitPerCustomer: promo.usageLimitPerCustomer ?? '',
    assignedCustomerEmail: promo.assignedCustomerEmail || '',
    referralOwnerName: promo.referralOwnerName || '',
    donationTarget: promo.donationTarget || '',
    donationType: promo.donationType || '',
    donationValue: Number(promo.donationValue || 0),
    startsAt: promo.startsAt || '',
    endsAt: promo.endsAt || '',
  }

  window.scrollTo({ top: 0, behavior: 'smooth' })
}

async function deletePromo(promo) {
  const shouldDelete = window.confirm(`Delete promo code ${promo.code}?`)
  if (!shouldDelete) return

  errorMessage.value = ''
  successMessage.value = ''

  try {
    const response = await fetch(`${API_BASE_URL}/${promo.id}`, {
      method: 'DELETE',
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Unable to delete promo code.')
    }

    successMessage.value = 'Promo deleted successfully.'
    await loadPromos()
  } catch (error) {
    errorMessage.value = error.message || 'Unable to delete promo code.'
  }
}

function resetForm() {
  editingPromoId.value = null
  form.value = getEmptyForm()
}

onMounted(loadPromos)
</script>

<template>
  <section class="mx-auto max-w-7xl px-5 py-8 md:px-6">
    <div class="mb-8 flex flex-wrap items-center justify-between gap-4">
      <div>
        <p class="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-400">Admin</p>
        <h1 class="mt-2 text-3xl font-extrabold text-[var(--brand-4)]">Promo Codes</h1>
        <p class="mt-2 max-w-2xl text-stone-300">
          Create global discounts, unique customer codes, referral codes, and shelter donation campaigns.
        </p>
      </div>
    </div>

    <div class="mb-8 grid gap-4 md:grid-cols-4">
      <article class="section-panel p-5">
        <p class="text-sm font-semibold text-stone-400">Active codes</p>
        <p class="mt-2 text-3xl font-extrabold text-[var(--brand-4)]">{{ activePromos.length }}</p>
      </article>
      <article class="section-panel p-5">
        <p class="text-sm font-semibold text-stone-400">Total uses</p>
        <p class="mt-2 text-3xl font-extrabold text-[var(--brand-4)]">{{ totalUses }}</p>
      </article>
      <article class="section-panel p-5">
        <p class="text-sm font-semibold text-stone-400">Discount given</p>
        <p class="mt-2 text-3xl font-extrabold text-[var(--brand-4)]">{{ formatPrice(totalDiscountGiven) }}</p>
      </article>
      <article class="section-panel p-5">
        <p class="text-sm font-semibold text-stone-400">Donation generated</p>
        <p class="mt-2 text-3xl font-extrabold text-[var(--brand-4)]">{{ formatPrice(totalDonationGenerated) }}</p>
      </article>
    </div>

    <section class="section-panel mb-8 p-5 md:p-6">
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-400">Test promo</p>
          <h2 class="mt-2 text-2xl font-extrabold text-[var(--brand-4)]">Preview code behavior</h2>
          <p class="mt-2 max-w-2xl text-sm text-stone-300">
            Check if a promo is valid for a subtotal and customer email before using it at checkout.
          </p>
        </div>
      </div>

      <form class="mt-5 grid gap-4 md:grid-cols-[1.2fr_0.8fr_1.2fr_auto] md:items-end" @submit.prevent="testPromoCode">
        <label class="block">
          <span class="mb-2 block text-sm font-semibold text-[var(--brand-4)]">Promo code</span>
          <input
            v-model="promoTestForm.code"
            required
            class="w-full rounded-2xl border border-stone-700 bg-white px-4 py-3 outline-none focus:border-emerald-400"
            placeholder="CHASE10"
          />
        </label>

        <label class="block">
          <span class="mb-2 block text-sm font-semibold text-[var(--brand-4)]">Subtotal</span>
          <input
            v-model.number="promoTestForm.subtotal"
            type="number"
            min="0"
            step="0.01"
            class="w-full rounded-2xl border border-stone-700 bg-white px-4 py-3 outline-none focus:border-emerald-400"
          />
        </label>

        <label class="block">
          <span class="mb-2 block text-sm font-semibold text-[var(--brand-4)]">Customer email</span>
          <input
            v-model="promoTestForm.customerEmail"
            type="email"
            class="w-full rounded-2xl border border-stone-700 bg-white px-4 py-3 outline-none focus:border-emerald-400"
            placeholder="optional for unique codes"
          />
        </label>

        <button
          type="submit"
          class="focus-ring rounded-lg bg-emerald-400 px-5 py-3 font-semibold text-[var(--brand-4)] hover:bg-emerald-300 disabled:opacity-60"
          :disabled="isTestingPromo"
        >
          {{ isTestingPromo ? 'Testing...' : 'Test Code' }}
        </button>
      </form>

      <div
        v-if="promoTestResult"
        class="mt-5 rounded-2xl border p-4"
        :class="promoTestResult.valid ? 'border-green-200 bg-green-50 text-green-800' : 'border-red-200 bg-red-50 text-red-800'"
      >
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p class="text-sm font-extrabold">
              {{ promoTestResult.valid ? 'Promo is valid' : 'Promo is not valid' }}
            </p>
            <p class="mt-1 text-sm">{{ promoTestResult.message }}</p>
          </div>
          <span class="rounded-full bg-white/70 px-3 py-1 text-xs font-bold">
            Status {{ promoTestResult.statusCode }}
          </span>
        </div>

        <div v-if="promoTestResult.valid" class="mt-4 grid gap-3 md:grid-cols-4">
          <div class="rounded-xl bg-white/70 p-3">
            <p class="text-xs font-semibold opacity-70">Discount</p>
            <p class="mt-1 text-lg font-extrabold">{{ formatPrice(promoTestResult.discountAmount) }}</p>
          </div>
          <div class="rounded-xl bg-white/70 p-3">
            <p class="text-xs font-semibold opacity-70">Donation</p>
            <p class="mt-1 text-lg font-extrabold">{{ formatPrice(promoTestResult.donationAmount) }}</p>
          </div>
          <div class="rounded-xl bg-white/70 p-3">
            <p class="text-xs font-semibold opacity-70">Referral owner</p>
            <p class="mt-1 text-sm font-extrabold">{{ promoTestResult.referralOwnerName || 'None' }}</p>
          </div>
          <div class="rounded-xl bg-white/70 p-3">
            <p class="text-xs font-semibold opacity-70">Donation target</p>
            <p class="mt-1 text-sm font-extrabold">{{ promoTestResult.donationTarget || 'None' }}</p>
          </div>
        </div>
      </div>
    </section>

    <div class="grid gap-6 lg:grid-cols-[420px_minmax(0,1fr)]">
      <form class="section-panel space-y-5 p-5 md:p-6" @submit.prevent="savePromo">
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-400">
            {{ editingPromoId ? 'Edit promo' : 'Create promo' }}
          </p>
          <h2 class="mt-2 text-2xl font-extrabold text-[var(--brand-4)]">
            {{ editingPromoId ? 'Update promo code' : 'New promo code' }}
          </h2>
        </div>

        <div v-if="errorMessage" class="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-800">
          {{ errorMessage }}
        </div>
        <div v-if="successMessage" class="rounded-2xl border border-green-200 bg-green-50 p-4 text-sm font-semibold text-green-800">
          {{ successMessage }}
        </div>

        <label class="block">
          <span class="mb-2 block text-sm font-semibold text-[var(--brand-4)]">Code *</span>
          <input v-model="form.code" required class="w-full rounded-2xl border border-stone-700 bg-white px-4 py-3 outline-none focus:border-emerald-400" placeholder="CHASE10" />
        </label>

        <label class="block">
          <span class="mb-2 block text-sm font-semibold text-[var(--brand-4)]">Name *</span>
          <input v-model="form.name" required class="w-full rounded-2xl border border-stone-700 bg-white px-4 py-3 outline-none focus:border-emerald-400" placeholder="Spring shelter campaign" />
        </label>

        <div class="grid gap-4 md:grid-cols-2">
          <label class="block">
            <span class="mb-2 block text-sm font-semibold text-[var(--brand-4)]">Type</span>
            <select v-model="form.type" class="w-full rounded-2xl border border-stone-700 bg-white px-4 py-3 outline-none focus:border-emerald-400">
              <option value="global">Global</option>
              <option value="unique">Unique customer</option>
              <option value="referral">Referral</option>
              <option value="shelter">Shelter donation</option>
            </select>
          </label>

          <label class="block">
            <span class="mb-2 block text-sm font-semibold text-[var(--brand-4)]">Status</span>
            <select v-model="form.status" class="w-full rounded-2xl border border-stone-700 bg-white px-4 py-3 outline-none focus:border-emerald-400">
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="expired">Expired</option>
            </select>
          </label>
        </div>

        <div class="grid gap-4 md:grid-cols-2">
          <label class="block">
            <span class="mb-2 block text-sm font-semibold text-[var(--brand-4)]">Discount type</span>
            <select v-model="form.discountType" class="w-full rounded-2xl border border-stone-700 bg-white px-4 py-3 outline-none focus:border-emerald-400">
              <option value="fixed">Fixed amount</option>
              <option value="percent">Percent</option>
            </select>
          </label>

          <label class="block">
            <span class="mb-2 block text-sm font-semibold text-[var(--brand-4)]">Discount value</span>
            <input v-model.number="form.discountValue" type="number" min="0" step="0.01" class="w-full rounded-2xl border border-stone-700 bg-white px-4 py-3 outline-none focus:border-emerald-400" />
          </label>
        </div>

        <div class="grid gap-4 md:grid-cols-2">
          <label class="block">
            <span class="mb-2 block text-sm font-semibold text-[var(--brand-4)]">Minimum subtotal</span>
            <input v-model.number="form.minimumSubtotal" type="number" min="0" step="0.01" class="w-full rounded-2xl border border-stone-700 bg-white px-4 py-3 outline-none focus:border-emerald-400" />
          </label>

          <label class="block">
            <span class="mb-2 block text-sm font-semibold text-[var(--brand-4)]">Total usage limit</span>
            <input v-model="form.usageLimitTotal" type="number" min="0" class="w-full rounded-2xl border border-stone-700 bg-white px-4 py-3 outline-none focus:border-emerald-400" placeholder="blank = unlimited" />
          </label>
        </div>

        <div class="grid gap-4 md:grid-cols-2">
          <label class="block">
            <span class="mb-2 block text-sm font-semibold text-[var(--brand-4)]">Per-customer limit</span>
            <input v-model="form.usageLimitPerCustomer" type="number" min="0" class="w-full rounded-2xl border border-stone-700 bg-white px-4 py-3 outline-none focus:border-emerald-400" />
          </label>

          <label class="block">
            <span class="mb-2 block text-sm font-semibold text-[var(--brand-4)]">Assigned customer email</span>
            <input v-model="form.assignedCustomerEmail" type="email" class="w-full rounded-2xl border border-stone-700 bg-white px-4 py-3 outline-none focus:border-emerald-400" placeholder="for unique codes" />
          </label>
        </div>

        <div class="rounded-2xl border border-stone-800 bg-[color-mix(in_srgb,var(--brand-5)_55%,white)] p-4">
          <h3 class="font-extrabold text-[var(--brand-4)]">Referral / Donation tracking</h3>
          <p class="mt-1 text-sm text-stone-300">
            Optional fields for referral codes, influencer codes, or shelter donation campaigns.
          </p>

          <div class="mt-4 space-y-4">
            <label class="block">
              <span class="mb-2 block text-sm font-semibold text-[var(--brand-4)]">Referral owner</span>
              <input v-model="form.referralOwnerName" class="w-full rounded-2xl border border-stone-700 bg-white px-4 py-3 outline-none focus:border-emerald-400" placeholder="Influencer, customer, partner, etc." />
            </label>

            <label class="block">
              <span class="mb-2 block text-sm font-semibold text-[var(--brand-4)]">Donation target</span>
              <input v-model="form.donationTarget" class="w-full rounded-2xl border border-stone-700 bg-white px-4 py-3 outline-none focus:border-emerald-400" placeholder="LA Animal Shelter" />
            </label>

            <div class="grid gap-4 md:grid-cols-2">
              <label class="block">
                <span class="mb-2 block text-sm font-semibold text-[var(--brand-4)]">Donation type</span>
                <select v-model="form.donationType" class="w-full rounded-2xl border border-stone-700 bg-white px-4 py-3 outline-none focus:border-emerald-400">
                  <option value="">None</option>
                  <option value="fixed">Fixed amount</option>
                  <option value="percent">Percent</option>
                </select>
              </label>

              <label class="block">
                <span class="mb-2 block text-sm font-semibold text-[var(--brand-4)]">Donation value</span>
                <input v-model.number="form.donationValue" type="number" min="0" step="0.01" class="w-full rounded-2xl border border-stone-700 bg-white px-4 py-3 outline-none focus:border-emerald-400" />
              </label>
            </div>
          </div>
        </div>

        <div class="grid gap-4 md:grid-cols-2">
          <label class="block">
            <span class="mb-2 block text-sm font-semibold text-[var(--brand-4)]">Starts at</span>
            <input v-model="form.startsAt" type="datetime-local" class="w-full rounded-2xl border border-stone-700 bg-white px-4 py-3 outline-none focus:border-emerald-400" />
          </label>

          <label class="block">
            <span class="mb-2 block text-sm font-semibold text-[var(--brand-4)]">Ends at</span>
            <input v-model="form.endsAt" type="datetime-local" class="w-full rounded-2xl border border-stone-700 bg-white px-4 py-3 outline-none focus:border-emerald-400" />
          </label>
        </div>

        <div class="flex flex-wrap gap-3">
          <button type="submit" class="focus-ring rounded-lg bg-emerald-400 px-5 py-3 font-semibold text-[var(--brand-4)] hover:bg-emerald-300 disabled:opacity-60" :disabled="isSaving">
            {{ isSaving ? 'Saving...' : editingPromoId ? 'Update Promo' : 'Create Promo' }}
          </button>
          <button type="button" class="rounded-lg border border-stone-700 px-5 py-3 font-semibold text-stone-500 hover:border-emerald-400" @click="resetForm">
            Reset
          </button>
        </div>
      </form>

      <section class="section-panel overflow-hidden">
        <div class="border-b border-stone-800 p-5 md:p-6">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p class="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-400">Promo library</p>
              <h2 class="mt-2 text-2xl font-extrabold text-[var(--brand-4)]">Codes & performance</h2>
            </div>
            <button class="rounded-lg border border-emerald-400 px-4 py-2 font-semibold text-emerald-400 hover:bg-stone-900" @click="loadPromos">
              Refresh
            </button>
          </div>
        </div>

        <div v-if="isLoading" class="p-6 text-stone-300">Loading promo codes...</div>

        <div v-else-if="!promos.length" class="p-6 text-stone-300">
          No promo codes yet.
        </div>

        <div v-else class="overflow-x-auto">
          <table class="min-w-full text-left text-sm">
            <thead class="bg-[color:var(--brand-5)]/65 text-[var(--brand-4)]">
              <tr>
                <th class="px-5 py-4 font-extrabold">Code</th>
                <th class="px-5 py-4 font-extrabold">Type</th>
                <th class="px-5 py-4 font-extrabold">Status</th>
                <th class="px-5 py-4 font-extrabold">Discount</th>
                <th class="px-5 py-4 font-extrabold">Usage</th>
                <th class="px-5 py-4 font-extrabold">Donation</th>
                <th class="px-5 py-4 font-extrabold">Performance</th>
                <th class="px-5 py-4 font-extrabold">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="promo in promos" :key="promo.id" class="border-t border-stone-800/50 align-top">
                <td class="px-5 py-4">
                  <p class="font-extrabold text-[var(--brand-4)]">{{ promo.code }}</p>
                  <p class="mt-1 text-xs text-stone-400">{{ promo.name }}</p>
                </td>
                <td class="px-5 py-4">
                  <span class="rounded-full bg-[color-mix(in_srgb,var(--brand-5)_70%,white)] px-3 py-1 text-xs font-bold text-[var(--brand-4)]">
                    {{ getPromoTypeLabel(promo.type) }}
                  </span>
                  <p v-if="promo.assignedCustomerEmail" class="mt-2 text-xs text-stone-400">{{ promo.assignedCustomerEmail }}</p>
                </td>
                <td class="px-5 py-4">
                  <span class="rounded-full px-3 py-1 text-xs font-bold" :class="promo.status === 'active' ? 'bg-green-50 text-green-700' : 'bg-stone-100 text-stone-500'">
                    {{ promo.status }}
                  </span>
                </td>
                <td class="px-5 py-4">
                  <p class="font-bold">{{ formatDiscount(promo) }}</p>
                  <p class="mt-1 text-xs text-stone-400">Minimum {{ formatPrice(promo.minimumSubtotal) }}</p>
                </td>
                <td class="px-5 py-4">
                  <p class="font-bold">{{ promo.usedCount || 0 }} used</p>
                  <p class="mt-1 text-xs text-stone-400">Limit {{ promo.usageLimitTotal || 'Unlimited' }}</p>
                  <p class="mt-1 text-xs text-stone-400">Per customer {{ promo.usageLimitPerCustomer || 'Unlimited' }}</p>
                </td>
                <td class="px-5 py-4">
                  <p class="font-bold">{{ promo.donationTarget || 'None' }}</p>
                  <p class="mt-1 text-xs text-stone-400">{{ formatDonationRule(promo) }}</p>
                  <p class="mt-1 text-xs font-semibold text-[var(--success-1)]">{{ formatPrice(promo.donationGenerated) }} generated</p>
                </td>
                <td class="px-5 py-4">
                  <p class="text-xs text-stone-400">Revenue</p>
                  <p class="font-bold">{{ formatPrice(promo.revenueGenerated) }}</p>
                  <p class="mt-2 text-xs text-stone-400">Discount</p>
                  <p class="font-bold">{{ formatPrice(promo.discountGiven) }}</p>
                </td>
                <td class="px-5 py-4">
                  <div class="flex flex-wrap gap-2">
                    <button class="rounded-lg border border-stone-700 px-3 py-2 text-xs font-bold text-stone-500 hover:border-emerald-400" @click="selectPromoForTest(promo)">
                      Test
                    </button>
                    <button class="rounded-lg border border-emerald-400 px-3 py-2 text-xs font-bold text-emerald-400 hover:bg-stone-900" @click="editPromo(promo)">
                      Edit
                    </button>
                    <button class="rounded-lg border border-red-200 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50" @click="deletePromo(promo)">
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  </section>
</template>