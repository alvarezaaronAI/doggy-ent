

<script setup>
import { computed, onMounted, ref } from 'vue'

const CAMPAIGNS_API_URL = '/api/admin/campaigns'
const PRODUCTS_API_URL = '/api/products'

const campaigns = ref([])
const products = ref([])
const isLoading = ref(false)
const isSaving = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const editingCampaignId = ref(null)


const form = ref(getEmptyForm())

const campaignSearchQuery = ref('')
const campaignStatusFilter = ref('all')

const activeCampaigns = computed(() => campaigns.value.filter((campaign) => campaign.status === 'active'))
const totalDonationGenerated = computed(() => campaigns.value.reduce((total, campaign) => total + Number(campaign.donationGenerated || 0), 0))
const totalRevenueGenerated = computed(() => campaigns.value.reduce((total, campaign) => total + Number(campaign.revenueGenerated || 0), 0))
const totalOrders = computed(() => campaigns.value.reduce((total, campaign) => total + Number(campaign.orderCount || 0), 0))

const filteredCampaigns = computed(() => {
  const query = campaignSearchQuery.value.trim().toLowerCase()

  return campaigns.value.filter((campaign) => {
    const matchesQuery = !query || [
      campaign.name,
      campaign.description,
      campaign.donationTarget,
      campaign.status,
    ]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(query))

    const matchesStatus = campaignStatusFilter.value === 'all' || campaign.status === campaignStatusFilter.value

    return matchesQuery && matchesStatus
  })
})

const activeFilteredCampaigns = computed(() => filteredCampaigns.value.filter((campaign) => campaign.status === 'active'))
const inactiveFilteredCampaigns = computed(() => filteredCampaigns.value.filter((campaign) => campaign.status !== 'active'))

function getEmptyForm() {
  return {
    name: '',
    description: '',
    status: 'draft',
    donationTarget: '',
    donationType: 'percent',
    donationValue: 5,
    productIds: [],
    startsDate: '',
    startsTime: '',
    endsDate: '',
    endsTime: '',
  }
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
  return {
    name: form.value.name,
    description: form.value.description,
    status: form.value.status,
    donationTarget: form.value.donationTarget,
    donationType: form.value.donationType,
    donationValue: Number(form.value.donationValue || 0),
    productIds: form.value.productIds,
    startsAt: combineDateTime(form.value.startsDate, form.value.startsTime),
    endsAt: combineDateTime(form.value.endsDate, form.value.endsTime),
  }
}

function formatPrice(value) {
  return `$${Number(value || 0).toFixed(2)}`
}

function formatDonationRule(campaign) {
  if (campaign.donationType === 'percent') {
    return `${Number(campaign.donationValue || 0)}% of selected product sales`
  }

  return `${formatPrice(campaign.donationValue)} per matched order`
}

function getCampaignStatusClass(status) {
  if (status === 'active') return 'bg-green-50 text-green-700'
  if (status === 'ended') return 'bg-red-50 text-red-700'
  if (status === 'paused') return 'bg-amber-50 text-amber-700'
  return 'bg-stone-100 text-stone-500'
}

function clearCampaignFilters() {
  campaignSearchQuery.value = ''
  campaignStatusFilter.value = 'all'
}

function getProductName(productId) {
  return products.value.find((product) => String(product.id) === String(productId))?.name || productId
}

function getCampaignProductNames(campaign) {
  if (!campaign.productIds?.length) return 'No products selected'

  return campaign.productIds.map(getProductName).join(', ')
}

async function loadCampaigns() {
  const response = await fetch(CAMPAIGNS_API_URL)
  if (!response.ok) throw new Error('Unable to load campaigns.')
  campaigns.value = await response.json()
}

async function loadProducts() {
  const response = await fetch(PRODUCTS_API_URL)
  if (!response.ok) throw new Error('Unable to load products.')
  products.value = await response.json()
}

async function loadPageData() {
  isLoading.value = true
  errorMessage.value = ''

  try {
    await Promise.all([loadCampaigns(), loadProducts()])
  } catch (error) {
    errorMessage.value = error.message || 'Unable to load campaigns.'
  } finally {
    isLoading.value = false
  }
}

async function saveCampaign() {
  isSaving.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    const payload = buildPayload()
    const url = editingCampaignId.value ? `${CAMPAIGNS_API_URL}/${editingCampaignId.value}` : CAMPAIGNS_API_URL
    const method = editingCampaignId.value ? 'PUT' : 'POST'

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Unable to save campaign.')
    }

    successMessage.value = editingCampaignId.value ? 'Campaign updated successfully.' : 'Campaign created successfully.'
    resetForm()
    await loadCampaigns()
  } catch (error) {
    errorMessage.value = error.message || 'Unable to save campaign.'
  } finally {
    isSaving.value = false
  }
}

function editCampaign(campaign) {
  editingCampaignId.value = campaign.id
  successMessage.value = ''
  errorMessage.value = ''

  const starts = splitDateTime(campaign.startsAt)
  const ends = splitDateTime(campaign.endsAt)

  form.value = {
    name: campaign.name || '',
    description: campaign.description || '',
    status: campaign.status || 'draft',
    donationTarget: campaign.donationTarget || '',
    donationType: campaign.donationType || 'percent',
    donationValue: Number(campaign.donationValue || 0),
    productIds: Array.isArray(campaign.productIds) ? [...campaign.productIds] : [],
    startsDate: starts.date,
    startsTime: starts.time,
    endsDate: ends.date,
    endsTime: ends.time,
  }

  window.scrollTo({ top: 0, behavior: 'smooth' })
}

async function deleteCampaign(campaign) {
  const shouldDelete = window.confirm(`Delete campaign ${campaign.name}?`)
  if (!shouldDelete) return

  errorMessage.value = ''
  successMessage.value = ''

  try {
    const response = await fetch(`${CAMPAIGNS_API_URL}/${campaign.id}`, {
      method: 'DELETE',
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Unable to delete campaign.')
    }

    successMessage.value = 'Campaign deleted successfully.'
    await loadCampaigns()
  } catch (error) {
    errorMessage.value = error.message || 'Unable to delete campaign.'
  }
}

function resetForm() {
  editingCampaignId.value = null
  form.value = getEmptyForm()
}

onMounted(loadPageData)
</script>

<template>
  <section class="mx-auto max-w-7xl px-5 py-8 md:px-6">
    <div class="mb-8 flex flex-wrap items-start justify-between gap-4">
      <div>
        <p class="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-400">Admin</p>
        <h1 class="mt-2 text-3xl font-extrabold text-[var(--brand-4)]">Donation Campaigns</h1>
        <p class="mt-2 max-w-2xl text-stone-300">
          Create product-based shelter campaigns that automatically generate donations without requiring promo codes.
        </p>
      </div>

      <RouterLink
        to="/admin"
        class="rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm font-bold text-[var(--brand-4)] transition hover:border-emerald-400 hover:bg-emerald-50"
      >
        ← Back to Dashboard
      </RouterLink>
    </div>

    <div class="mb-8 grid gap-4 md:grid-cols-4">
      <article class="section-panel p-5">
        <p class="text-sm font-semibold text-stone-400">Active campaigns</p>
        <p class="mt-2 text-3xl font-extrabold text-[var(--brand-4)]">{{ activeCampaigns.length }}</p>
      </article>
      <article class="section-panel p-5">
        <p class="text-sm font-semibold text-stone-400">Orders tracked</p>
        <p class="mt-2 text-3xl font-extrabold text-[var(--brand-4)]">{{ totalOrders }}</p>
      </article>
      <article class="section-panel p-5">
        <p class="text-sm font-semibold text-stone-400">Revenue tracked</p>
        <p class="mt-2 text-3xl font-extrabold text-[var(--brand-4)]">{{ formatPrice(totalRevenueGenerated) }}</p>
      </article>
      <article class="section-panel p-5">
        <p class="text-sm font-semibold text-stone-400">Donation generated</p>
        <p class="mt-2 text-3xl font-extrabold text-[var(--brand-4)]">{{ formatPrice(totalDonationGenerated) }}</p>
      </article>
    </div>

    <div class="grid gap-6 lg:grid-cols-[420px_minmax(0,1fr)]">
      <form class="section-panel space-y-5 p-5 md:p-6" @submit.prevent="saveCampaign">
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-400">
            {{ editingCampaignId ? 'Edit campaign' : 'Create campaign' }}
          </p>
          <h2 class="mt-2 text-2xl font-extrabold text-[var(--brand-4)]">
            {{ editingCampaignId ? 'Update donation campaign' : 'New donation campaign' }}
          </h2>
        </div>

        <div v-if="errorMessage" class="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-800">
          {{ errorMessage }}
        </div>
        <div v-if="successMessage" class="rounded-2xl border border-green-200 bg-green-50 p-4 text-sm font-semibold text-green-800">
          {{ successMessage }}
        </div>

        <label class="block">
          <span class="mb-2 block text-sm font-semibold text-[var(--brand-4)]">Campaign name *</span>
          <input v-model="form.name" required class="w-full rounded-2xl border border-stone-700 bg-white px-4 py-3 outline-none focus:border-emerald-400" placeholder="LA Dogs May Drive" />
        </label>

        <label class="block">
          <span class="mb-2 block text-sm font-semibold text-[var(--brand-4)]">Description</span>
          <textarea v-model="form.description" rows="3" class="w-full rounded-2xl border border-stone-700 bg-white px-4 py-3 outline-none focus:border-emerald-400" placeholder="Limited-time shelter support campaign."></textarea>
        </label>

        <div class="grid gap-4 md:grid-cols-2">
          <label class="block">
            <span class="mb-2 block text-sm font-semibold text-[var(--brand-4)]">Status</span>
            <select v-model="form.status" class="w-full rounded-2xl border border-stone-700 bg-white px-4 py-3 outline-none focus:border-emerald-400">
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="ended">Ended</option>
            </select>
          </label>

          <label class="block">
            <span class="mb-2 block text-sm font-semibold text-[var(--brand-4)]">Shelter / donation target *</span>
            <input v-model="form.donationTarget" required class="w-full rounded-2xl border border-stone-700 bg-white px-4 py-3 outline-none focus:border-emerald-400" placeholder="LA Dogs Shelter" />
          </label>
        </div>

        <div class="grid gap-4 md:grid-cols-2">
          <label class="block">
            <span class="mb-2 block text-sm font-semibold text-[var(--brand-4)]">Donation type</span>
            <select v-model="form.donationType" class="w-full rounded-2xl border border-stone-700 bg-white px-4 py-3 outline-none focus:border-emerald-400">
              <option value="percent">Percent of product sales</option>
              <option value="fixed">Fixed amount</option>
            </select>
          </label>

          <label class="block">
            <span class="mb-2 block text-sm font-semibold text-[var(--brand-4)]">Donation value</span>
            <input v-model.number="form.donationValue" type="number" min="0" step="0.01" class="w-full rounded-2xl border border-stone-700 bg-white px-4 py-3 outline-none focus:border-emerald-400" />
          </label>
        </div>

        <div>
          <span class="mb-2 block text-sm font-semibold text-[var(--brand-4)]">Products included</span>
          <div class="max-h-72 space-y-2 overflow-y-auto rounded-2xl border border-stone-700 bg-white p-3">
            <label
              v-for="product in products"
              :key="product.id"
              class="flex cursor-pointer items-start gap-3 rounded-xl px-3 py-2 hover:bg-[color-mix(in_srgb,var(--brand-5)_55%,white)]"
            >
              <input v-model="form.productIds" type="checkbox" :value="product.id" class="mt-1" />
              <span>
                <span class="block font-semibold text-[var(--brand-4)]">{{ product.name }}</span>
                <span class="block text-xs text-stone-400">{{ product.status }} · {{ product.category }}</span>
              </span>
            </label>
          </div>
          <p class="mt-2 text-xs text-stone-400">
            Donations are calculated only from selected products in this campaign.
          </p>
        </div>

        <div class="rounded-2xl border border-stone-200 bg-[color-mix(in_srgb,var(--brand-5)_55%,white)] p-4">
          <div>
            <h3 class="font-extrabold text-[var(--brand-4)]">Schedule</h3>
            <p class="mt-1 text-sm text-stone-400">
              Optional. Leave blank for campaigns that remain active until paused or ended.
            </p>
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

        <div class="flex flex-wrap gap-3">
          <button type="submit" class="focus-ring rounded-lg bg-emerald-400 px-5 py-3 font-semibold text-[var(--brand-4)] hover:bg-emerald-300 disabled:opacity-60" :disabled="isSaving">
            {{ isSaving ? 'Saving...' : editingCampaignId ? 'Update Campaign' : 'Create Campaign' }}
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
              <p class="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-400">Campaign library</p>
              <h2 class="mt-2 text-2xl font-extrabold text-[var(--brand-4)]">Campaigns & donations</h2>
              <p class="mt-2 text-sm text-stone-400">
                Active campaigns appear first. Use filters to quickly manage live donation drives.
              </p>
            </div>
            <button class="rounded-lg border border-emerald-400 px-4 py-2 font-semibold text-emerald-400 hover:bg-stone-900" @click="loadPageData">
              Refresh
            </button>
          </div>

          <div class="mt-5 grid gap-3 lg:grid-cols-[1.4fr_0.8fr_auto] lg:items-end">
            <label class="block">
              <span class="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-stone-400">Search</span>
              <input
                v-model="campaignSearchQuery"
                class="w-full rounded-2xl border border-stone-700 bg-white px-4 py-3 outline-none focus:border-emerald-400"
                placeholder="Search campaign, shelter, status..."
              />
            </label>

            <label class="block">
              <span class="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-stone-400">Status</span>
              <select v-model="campaignStatusFilter" class="w-full rounded-2xl border border-stone-700 bg-white px-4 py-3 outline-none focus:border-emerald-400">
                <option value="all">All statuses</option>
                <option value="active">Active</option>
                <option value="draft">Draft</option>
                <option value="paused">Paused</option>
                <option value="ended">Ended</option>
              </select>
            </label>

            <button
              type="button"
              class="rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm font-bold text-[var(--brand-4)] transition hover:border-emerald-400 hover:bg-emerald-50"
              @click="clearCampaignFilters"
            >
              Clear
            </button>
          </div>
        </div>

        <div v-if="isLoading" class="p-6 text-stone-300">Loading campaigns...</div>

        <div v-else-if="!campaigns.length" class="p-6 text-stone-300">
          No campaigns yet.
        </div>

        <div v-else-if="!filteredCampaigns.length" class="p-6 text-stone-300">
          No campaigns match your filters.
        </div>

        <div v-else class="space-y-8 p-5 md:p-6">
          <section>
            <div class="mb-3 flex items-center justify-between gap-3">
              <h3 class="text-lg font-extrabold text-[var(--brand-4)]">Active campaigns</h3>
              <span class="rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-700">{{ activeFilteredCampaigns.length }} active</span>
            </div>

            <div v-if="!activeFilteredCampaigns.length" class="rounded-2xl border border-stone-200 bg-white/70 p-4 text-sm text-stone-400">
              No active campaigns match this view.
            </div>

            <div v-else class="overflow-x-auto rounded-2xl border border-stone-200 bg-white/70">
              <table class="min-w-full text-left text-sm">
                <thead class="bg-[color:var(--brand-5)]/65 text-[var(--brand-4)]">
                  <tr>
                    <th class="px-5 py-4 font-extrabold">Campaign</th>
                    <th class="px-5 py-4 font-extrabold">Target</th>
                    <th class="px-5 py-4 font-extrabold">Status</th>
                    <th class="px-5 py-4 font-extrabold">Donation rule</th>
                    <th class="px-5 py-4 font-extrabold">Products</th>
                    <th class="px-5 py-4 font-extrabold">Performance</th>
                    <th class="px-5 py-4 font-extrabold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="campaign in activeFilteredCampaigns" :key="campaign.id" class="border-t border-stone-200 align-top">
                    <td class="px-5 py-4">
                      <p class="font-extrabold text-[var(--brand-4)]">{{ campaign.name }}</p>
                      <p class="mt-1 max-w-xs text-xs text-stone-400">{{ campaign.description || 'No description' }}</p>
                    </td>
                    <td class="px-5 py-4">
                      <p class="font-bold">{{ campaign.donationTarget }}</p>
                    </td>
                    <td class="px-5 py-4">
                      <span class="rounded-full px-3 py-1 text-xs font-bold" :class="getCampaignStatusClass(campaign.status)">
                        {{ campaign.status }}
                      </span>
                    </td>
                    <td class="px-5 py-4">
                      <p class="font-bold">{{ formatDonationRule(campaign) }}</p>
                    </td>
                    <td class="px-5 py-4">
                      <p class="max-w-xs text-xs leading-relaxed text-stone-400">{{ getCampaignProductNames(campaign) }}</p>
                    </td>
                    <td class="px-5 py-4">
                      <p class="text-xs text-stone-400">Orders</p>
                      <p class="font-bold">{{ campaign.orderCount || 0 }}</p>
                      <p class="mt-2 text-xs text-stone-400">Donation</p>
                      <p class="font-bold text-[var(--success-1)]">{{ formatPrice(campaign.donationGenerated) }}</p>
                      <p class="mt-2 text-xs text-stone-400">Revenue</p>
                      <p class="font-bold">{{ formatPrice(campaign.revenueGenerated) }}</p>
                    </td>
                    <td class="px-5 py-4">
                      <div class="flex flex-wrap gap-2">
                        <button class="rounded-lg border border-emerald-400 px-3 py-2 text-xs font-bold text-emerald-400 hover:bg-stone-900" @click="editCampaign(campaign)">
                          Edit
                        </button>
                        <button class="rounded-lg border border-red-200 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50" @click="deleteCampaign(campaign)">
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <div class="mb-3 flex items-center justify-between gap-3">
              <h3 class="text-lg font-extrabold text-[var(--brand-4)]">Draft, paused & ended campaigns</h3>
              <span class="rounded-full bg-stone-100 px-3 py-1 text-xs font-bold text-stone-600">{{ inactiveFilteredCampaigns.length }} inactive</span>
            </div>

            <div v-if="!inactiveFilteredCampaigns.length" class="rounded-2xl border border-stone-200 bg-white/70 p-4 text-sm text-stone-400">
              No inactive campaigns match this view.
            </div>

            <div v-else class="overflow-x-auto rounded-2xl border border-stone-200 bg-white/70">
              <table class="min-w-full text-left text-sm">
                <thead class="bg-[color:var(--brand-5)]/65 text-[var(--brand-4)]">
                  <tr>
                    <th class="px-5 py-4 font-extrabold">Campaign</th>
                    <th class="px-5 py-4 font-extrabold">Target</th>
                    <th class="px-5 py-4 font-extrabold">Status</th>
                    <th class="px-5 py-4 font-extrabold">Donation rule</th>
                    <th class="px-5 py-4 font-extrabold">Products</th>
                    <th class="px-5 py-4 font-extrabold">Performance</th>
                    <th class="px-5 py-4 font-extrabold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="campaign in inactiveFilteredCampaigns" :key="campaign.id" class="border-t border-stone-200 align-top">
                    <td class="px-5 py-4">
                      <p class="font-extrabold text-[var(--brand-4)]">{{ campaign.name }}</p>
                      <p class="mt-1 max-w-xs text-xs text-stone-400">{{ campaign.description || 'No description' }}</p>
                    </td>
                    <td class="px-5 py-4">
                      <p class="font-bold">{{ campaign.donationTarget }}</p>
                    </td>
                    <td class="px-5 py-4">
                      <span class="rounded-full px-3 py-1 text-xs font-bold" :class="getCampaignStatusClass(campaign.status)">
                        {{ campaign.status }}
                      </span>
                    </td>
                    <td class="px-5 py-4">
                      <p class="font-bold">{{ formatDonationRule(campaign) }}</p>
                    </td>
                    <td class="px-5 py-4">
                      <p class="max-w-xs text-xs leading-relaxed text-stone-400">{{ getCampaignProductNames(campaign) }}</p>
                    </td>
                    <td class="px-5 py-4">
                      <p class="text-xs text-stone-400">Orders</p>
                      <p class="font-bold">{{ campaign.orderCount || 0 }}</p>
                      <p class="mt-2 text-xs text-stone-400">Donation</p>
                      <p class="font-bold text-[var(--success-1)]">{{ formatPrice(campaign.donationGenerated) }}</p>
                      <p class="mt-2 text-xs text-stone-400">Revenue</p>
                      <p class="font-bold">{{ formatPrice(campaign.revenueGenerated) }}</p>
                    </td>
                    <td class="px-5 py-4">
                      <div class="flex flex-wrap gap-2">
                        <button class="rounded-lg border border-emerald-400 px-3 py-2 text-xs font-bold text-emerald-400 hover:bg-stone-900" @click="editCampaign(campaign)">
                          Edit
                        </button>
                        <button class="rounded-lg border border-red-200 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50" @click="deleteCampaign(campaign)">
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
    </div>
  </section>
</template>