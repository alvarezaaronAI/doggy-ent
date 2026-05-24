<script setup>
import {
  computed,
  onMounted,
  ref,
  watch,
} from 'vue'

import {
  DISCOUNT_TYPE_OPTIONS,
  PROMO_STATUS_OPTIONS,
  PROMO_TYPE_OPTIONS,
} from '../../promos/constants/promo.constants'

import {
  formatPromoDiscount,
  formatPromoType,
  formatPromoUsageLimit,
} from '../../promos/utils/promo.utils'

import {
  normalizePromoForm,
  validatePromoForm,
} from '../../promos/utils/promo.rules'


import {
  fetchPromoAnalytics,
  validatePromoCode,
} from '../../promos/api/promos.api'
import { usePromos } from '../../promos/composables/usePromos'

import PromoBadge from '../../promos/components/PromoBadge.vue'
import PromoStatusPill from '../../promos/components/PromoStatusPill.vue'
import PromoForm from '../../promos/components/PromoForm.vue'
import PromoCodeTester from '../../promos/components/PromoCodeTester.vue'
import PromoTable from '../../promos/components/PromoTable.vue'
import PromoAnalyticsModal from '../../promos/components/PromoAnalyticsModal.vue'

const {
  promos,
  isLoading,
  isSaving,
  errorMessage,
  successMessage,
  loadPromos,
  savePromo: savePromoRequest,
  removePromo,
  clearMessages,
} = usePromos()
const editingPromoId = ref(null)

const isTestingPromo = ref(false)
const promoTestResult = ref(null)
const promoTestForm = ref({
  code: '',
  subtotal: 50,
  customerEmail: '',
})

const isAnalyticsModalOpen = ref(false)
const isLoadingAnalytics = ref(false)
const selectedPromoAnalytics = ref(null)


const form = ref(getEmptyForm())

// Promo library search/filter controls
const promoSearchQuery = ref('')
const promoTypeFilter = ref('all')
const promoStatusFilter = ref('all')

const isUniquePromo = computed(
  () => form.value.type === 'UNIQUE',
)

const isReferralPromo = computed(
  () => form.value.type === 'REFERRAL',
)

const activePromos = computed(
  () => promos.value.filter(
    (promo) => promo.status === 'ACTIVE',
  ),
)
const totalUses = computed(() => promos.value.reduce((total, promo) => total + Number(promo.usedCount || 0), 0))
const totalDiscountGiven = computed(() => promos.value.reduce((total, promo) => total + Number(promo.discountGiven || 0), 0))

const totalRevenueGenerated = computed(() => promos.value.reduce((total, promo) => total + Number(promo.revenueGenerated || 0), 0))

// Filtering and grouping for promo library UI
const filteredPromos = computed(() => {
  const query = promoSearchQuery.value.trim().toLowerCase()

  return promos.value.filter((promo) => {
    const matchesQuery = !query || [
      promo.code,
      promo.name,
      promo.type,
      promo.status,
      promo.assignedCustomerEmail,
      promo.referralOwnerName,
    ]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(query))

    const matchesType = (
      promoTypeFilter.value === 'all'
      || promo.type === promoTypeFilter.value
    )

    const matchesStatus = (
      promoStatusFilter.value === 'all'
      || promo.status === promoStatusFilter.value
    )

    return matchesQuery && matchesType && matchesStatus
  })
})

const activeFilteredPromos = computed(
  () => filteredPromos.value.filter(
    (promo) => promo.status === 'ACTIVE',
  ),
)

const inactiveFilteredPromos = computed(
  () => filteredPromos.value.filter(
    (promo) => promo.status !== 'ACTIVE',
  ),
)

function getEmptyForm() {
  return {
    code: '',
    name: '',
    type: 'GLOBAL',
    status: 'DRAFT',
    discountType: 'FIXED',
    discountValue: 0,
    minimumSubtotal: 0,
    usageLimitTotal: '',
    usageLimitPerCustomer: 1,
    assignedCustomerEmail: '',
    referralOwnerName: '',
    startsDate: '',
    startsTime: '',
    endsDate: '',
    endsTime: '',
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

function splitDateTime(value) {
  if (!value) {
    return { date: '', time: '' }
  }

  const [date = '', timeWithSeconds = ''] = String(value).split('T')
  const time = timeWithSeconds.slice(0, 5)

  return { date, time }
}

function combineDateTime(date, time) {
  if (!date) return null
  return `${date}T${time || '00:00'}`
}

function buildPayload() {
  return normalizePromoForm({
    code: form.value.code,
    name: form.value.name,
    type: form.value.type,
    status: form.value.status,
    discountType: form.value.discountType,
    discountValue: Number(form.value.discountValue || 0),
    minimumSubtotal: Number(form.value.minimumSubtotal || 0),
    usageLimitTotal: normalizeOptionalNumber(
      form.value.usageLimitTotal,
    ),
    usageLimitPerCustomer: normalizeOptionalNumber(
      form.value.usageLimitPerCustomer,
    ),
    assignedCustomerEmail: normalizeOptionalString(
      form.value.assignedCustomerEmail,
    ),
    referralOwnerName: normalizeOptionalString(
      form.value.referralOwnerName,
    ),
    startsDate: form.value.startsDate,
    startsTime: form.value.startsTime,
    endsDate: form.value.endsDate,
    endsTime: form.value.endsTime,
    startsAt: combineDateTime(
      form.value.startsDate,
      form.value.startsTime,
    ),
    endsAt: combineDateTime(
      form.value.endsDate,
      form.value.endsTime,
    ),
  })
}

function formatPrice(value) {
  return `$${Number(value || 0).toFixed(2)}`
}


function formatDiscount(promo) {
  return formatPromoDiscount(promo)
}

function getUsageLabel(promo) {
  return `${promo.usedCount || 0} / ${formatPromoUsageLimit(
    promo.usageLimitTotal,
  )}`
}

function clearPromoFilters() {
  promoSearchQuery.value = ''
  promoTypeFilter.value = 'all'
  promoStatusFilter.value = 'all'
}



function selectPromoForTest(promo) {
  promoTestForm.value.code = promo.code
}

async function openPromoAnalytics(promo) {
  isAnalyticsModalOpen.value = true
  isLoadingAnalytics.value = true
  selectedPromoAnalytics.value = null

  try {
    selectedPromoAnalytics.value = (
      await fetchPromoAnalytics(promo.id)
    )
  }
  catch (error) {
    errorMessage.value = (
      error.message
      || 'Unable to load promo analytics.'
    )
  }
  finally {
    isLoadingAnalytics.value = false
  }
}

function closePromoAnalytics() {
  isAnalyticsModalOpen.value = false
}

function getSecureRandomCode(length = 12) {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const randomValues = new Uint32Array(length)
  window.crypto.getRandomValues(randomValues)

  return Array.from(randomValues, (value) => alphabet[value % alphabet.length]).join('')
}

function generateUniquePromoCode() {
  const suffix = getSecureRandomCode(12)

  form.value.code = `VIP-${suffix}`
  form.value.type = 'UNIQUE'
  form.value.status = 'ACTIVE'
  form.value.usageLimitTotal = 1
  form.value.usageLimitPerCustomer = 1

  if (!form.value.name) {
    form.value.name = 'Unique customer code'
  }
}

async function testPromoCode() {
  isTestingPromo.value = true
  promoTestResult.value = null
  errorMessage.value = ''

  try {
    const data = await validatePromoCode({
      code: promoTestForm.value.code,
      customerEmail: normalizeOptionalString(
        promoTestForm.value.customerEmail,
      ),
      cart: {
        subtotal: Number(
          promoTestForm.value.subtotal || 0,
        ),
        items: [],
      },
    })

    promoTestResult.value = {
      ...data,
      statusCode: 200,
    }
  } catch (error) {
    promoTestResult.value = {
      valid: false,
      message: error.message || 'Unable to test promo code.',
      discountAmount: 0,
      statusCode: 500,
    }
  } finally {
    isTestingPromo.value = false
  }
}


async function savePromo() {
  const payload = buildPayload()

  const validation = validatePromoForm(payload)

  if (!validation.valid) {
    errorMessage.value = validation.errors.join(' ')
    successMessage.value = ''

    return
  }

  form.value = {
    ...form.value,
    ...payload,
  }

  await savePromoRequest({
    editingPromoId: editingPromoId.value,
    payload,
    onSuccess: resetForm,
  })
}
function enforcePromoRules() {
  const normalized = normalizePromoForm({
    ...form.value,
  })

  form.value = {
    ...form.value,
    ...normalized,
  }
}

function editPromo(promo) {
  editingPromoId.value = promo.id
  clearMessages()

  const starts = splitDateTime(promo.startsAt)
  const ends = splitDateTime(promo.endsAt)

  form.value = {
    code: promo.code || '',
    name: promo.name || '',
    type: promo.type || 'GLOBAL',
    status: promo.status || 'DRAFT',
    discountType: promo.discountType || 'FIXED',
    discountValue: Number(promo.discountValue || 0),
    minimumSubtotal: Number(promo.minimumSubtotal || 0),
    usageLimitTotal: promo.usageLimitTotal ?? '',
    usageLimitPerCustomer: promo.usageLimitPerCustomer ?? '',
    assignedCustomerEmail: promo.assignedCustomerEmail || '',
    referralOwnerName: promo.referralOwnerName || '',
    startsDate: starts.date,
    startsTime: starts.time,
    endsDate: ends.date,
    endsTime: ends.time,
  }

  window.scrollTo({ top: 0, behavior: 'smooth' })
}

async function deletePromo(promo) {
  const shouldDelete = window.confirm(
    `Delete promo code ${promo.code}?`,
  )

  if (!shouldDelete) {
    return
  }

  await removePromo({
    promoId: promo.id,
  })
}

function resetForm() {
  editingPromoId.value = null
  form.value = getEmptyForm()
}

watch(
  () => [
    form.value.type,
    form.value.assignedCustomerEmail,
    form.value.referralOwnerName,
    form.value.usageLimitTotal,
    form.value.usageLimitPerCustomer,
  ],
  enforcePromoRules,
)

onMounted(loadPromos)
</script>

<template>
  <section class="mx-auto max-w-7xl px-5 py-8 md:px-6">
    <div class="mb-8 flex flex-wrap items-start justify-between gap-4">
      <div>
        <p class="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-400">Admin</p>
        <h1 class="mt-2 text-3xl font-extrabold text-[var(--brand-4)]">Promo Codes</h1>
        <p class="mt-2 max-w-2xl text-stone-300">
          Create global discounts, unique one-time customer codes, and referral promo codes.
        </p>
      </div>

      <RouterLink
        to="/admin"
        class="rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm font-bold text-[var(--brand-4)] transition hover:border-emerald-400 hover:bg-emerald-50"
      >
        ← Back to Dashboard
      </RouterLink>
    </div>

    <div class="mb-8 grid gap-4 md:grid-cols-3">
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
    </div>

    <PromoCodeTester
      :form="promoTestForm"
      :result="promoTestResult"
      :is-testing="isTestingPromo"
      @submit="testPromoCode"
    />

    <div class="grid gap-6 lg:grid-cols-[420px_minmax(0,1fr)]">
      <PromoForm
        :form="form"
        :is-saving="isSaving"
        :is-editing="Boolean(editingPromoId)"
        :is-unique-promo="isUniquePromo"
        :is-referral-promo="isReferralPromo"
        :error-message="errorMessage"
        :success-message="successMessage"
        @submit="savePromo"
        @reset="resetForm"
        @generate-code="generateUniquePromoCode"
      >
        <template #default>

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

          <label
            class="block"
            v-if="isUniquePromo"
          >
            <span class="mb-2 block text-sm font-semibold text-[var(--brand-4)]">Assigned customer email</span>
            <input v-model="form.assignedCustomerEmail" type="email" class="w-full rounded-2xl border border-stone-700 bg-white px-4 py-3 outline-none focus:border-emerald-400" placeholder="for unique codes" />
          </label>
        </div>

        <div
          class="rounded-2xl border border-stone-800 bg-[color-mix(in_srgb,var(--brand-5)_55%,white)] p-4"
          v-if="isReferralPromo"
        >
          <h3 class="font-extrabold text-[var(--brand-4)]">Referral tracking</h3>
          <p class="mt-1 text-sm text-stone-300">
            Optional owner name for influencer, customer, or partner referral codes.
          </p>

          <label class="mt-4 block">
            <span class="mb-2 block text-sm font-semibold text-[var(--brand-4)]">Referral owner</span>
            <input v-model="form.referralOwnerName" class="w-full rounded-2xl border border-stone-700 bg-white px-4 py-3 outline-none focus:border-emerald-400" placeholder="Influencer, customer, partner, etc." />
          </label>
        </div>

        <div class="rounded-2xl border border-stone-200 bg-[color-mix(in_srgb,var(--brand-5)_55%,white)] p-4">
          <div class="flex items-start justify-between gap-3">
            <div>
              <h3 class="font-extrabold text-[var(--brand-4)]">Schedule</h3>
              <p class="mt-1 text-sm text-stone-400">
                Optional. Leave blank for codes that are available until paused, expired, or deleted.
              </p>
            </div>
          </div>

          <div class="mt-4 space-y-4">
            <div class="rounded-2xl border border-stone-200 bg-white/80 p-4">
              <div class="flex items-center justify-between gap-3">
                <p class="text-sm font-extrabold text-[var(--brand-4)]">Starts</p>
                <button
                  type="button"
                  class="text-xs font-bold text-stone-400 transition hover:text-red-500"
                  @click="form.startsDate = ''; form.startsTime = ''"
                >
                  Clear start
                </button>
              </div>
              <div class="mt-3 grid gap-3">
                <label class="block">
                  <span class="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-stone-400">Start date</span>
                  <input
                    v-model="form.startsDate"
                    type="date"
                    class="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-base text-slate-900 outline-none focus:border-emerald-400"
                  />
                </label>

                <label class="block">
                  <span class="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-stone-400">Start time</span>
                  <input
                    v-model="form.startsTime"
                    type="time"
                    class="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-base text-slate-900 outline-none focus:border-emerald-400"
                  />
                </label>
              </div>
            </div>

            <div class="rounded-2xl border border-stone-200 bg-white/80 p-4">
              <div class="flex items-center justify-between gap-3">
                <p class="text-sm font-extrabold text-[var(--brand-4)]">Ends</p>
                <button
                  type="button"
                  class="text-xs font-bold text-stone-400 transition hover:text-red-500"
                  @click="form.endsDate = ''; form.endsTime = ''"
                >
                  Clear end
                </button>
              </div>
              <div class="mt-3 grid gap-3">
                <label class="block">
                  <span class="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-stone-400">End date</span>
                  <input
                    v-model="form.endsDate"
                    type="date"
                    class="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-base text-slate-900 outline-none focus:border-emerald-400"
                  />
                </label>

                <label class="block">
                  <span class="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-stone-400">End time</span>
                  <input
                    v-model="form.endsTime"
                    type="time"
                    class="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-base text-slate-900 outline-none focus:border-emerald-400"
                  />
                </label>
              </div>
            </div>
          </div>
        </div>

      </template>
      </PromoForm>

      <section class="section-panel overflow-hidden">
        <div class="border-b border-stone-800 p-5 md:p-6">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p class="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-400">Promo library</p>
              <h2 class="mt-2 text-2xl font-extrabold text-[var(--brand-4)]">Codes & performance</h2>
              <p class="mt-2 text-sm text-stone-400">
                Active codes appear first. Use filters to quickly find global, referral, or one-time customer codes.
              </p>
            </div>
            <button class="rounded-lg border border-emerald-400 px-4 py-2 font-semibold text-emerald-400 hover:bg-stone-900" @click="loadPromos">
              Refresh
            </button>
          </div>

          <div class="mt-5 grid gap-3 lg:grid-cols-[1.4fr_0.8fr_0.8fr_auto] lg:items-end">
            <label class="block">
              <span class="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-stone-400">Search</span>
              <input
                v-model="promoSearchQuery"
                class="w-full rounded-2xl border border-stone-700 bg-white px-4 py-3 outline-none focus:border-emerald-400"
                placeholder="Search code, email, owner, type..."
              />
            </label>

            <label class="block">
              <span class="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-stone-400">Type</span>
            <select v-model="promoTypeFilter" class="w-full rounded-2xl border border-stone-700 bg-white px-4 py-3 outline-none focus:border-emerald-400">
              <option value="all">All types</option>
              <option
                v-for="option in PROMO_TYPE_OPTIONS"
                :key="option.value"
                :value="option.value"
              >
                {{ option.label }}
              </option>
            </select>
            </label>

            <label class="block">
              <span class="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-stone-400">Status</span>
            <select v-model="promoStatusFilter" class="w-full rounded-2xl border border-stone-700 bg-white px-4 py-3 outline-none focus:border-emerald-400">
              <option value="all">All statuses</option>
              <option
                v-for="option in PROMO_STATUS_OPTIONS"
                :key="option.value"
                :value="option.value"
              >
                {{ option.label }}
              </option>
            </select>
            </label>

            <button
              type="button"
              class="rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm font-bold text-[var(--brand-4)] transition hover:border-emerald-400 hover:bg-emerald-50"
              @click="clearPromoFilters"
            >
              Clear
            </button>
          </div>
        </div>

        <div v-if="isLoading" class="p-6 text-stone-300">Loading promo codes...</div>

        <div v-else-if="!promos.length" class="p-6 text-stone-300">
          No promo codes yet.
        </div>

        <div v-else-if="!filteredPromos.length" class="p-6 text-stone-300">
          No promo codes match your filters.
        </div>

        <div v-else class="space-y-8 p-5 md:p-6">
          <PromoTable
            title="Active promos"
            :promos="activeFilteredPromos"
            empty-message="No active promos match this view."
            :count-label="`${activeFilteredPromos.length} active`"
            count-class="bg-green-50 text-green-700"
            @test="selectPromoForTest"
            @edit="editPromo"
            @delete="deletePromo"
            @analytics="openPromoAnalytics"
          />

          <PromoTable
            title="Inactive promos"
            :promos="inactiveFilteredPromos"
            empty-message="No inactive promos match this view."
            :count-label="`${inactiveFilteredPromos.length} inactive`"
            count-class="bg-stone-100 text-stone-600"
            @test="selectPromoForTest"
            @edit="editPromo"
            @delete="deletePromo"
            @analytics="openPromoAnalytics"
          />
        </div>
      </section>
    </div>
    <PromoAnalyticsModal
      :is-open="isAnalyticsModalOpen"
      :analytics="selectedPromoAnalytics"
      :is-loading="isLoadingAnalytics"
      @close="closePromoAnalytics"
    />
  </section>
</template>