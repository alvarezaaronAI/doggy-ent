<script setup>
import {
  CAMPAIGN_STATUS_FILTER_OPTIONS,
} from '../constants/adminCampaigns.constants'
import AdminCampaignsTable from './AdminCampaignsTable.vue'

defineProps({
  campaignGroups: {
    type: Array,
    required: true,
  },
  campaigns: {
    type: Array,
    required: true,
  },
  filteredCampaigns: {
    type: Array,
    required: true,
  },
  getCampaignProductNames: {
    type: Function,
    required: true,
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
})

const campaignSearchQuery = defineModel('campaignSearchQuery', {
  type: String,
  required: true,
})

const campaignStatusFilter = defineModel('campaignStatusFilter', {
  type: String,
  required: true,
})

const emit = defineEmits([
  'analytics',
  'clear-filters',
  'delete',
  'edit',
  'refresh',
])
</script>

<template>
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
        <button class="rounded-lg border border-emerald-400 px-4 py-2 font-semibold text-emerald-400 hover:bg-stone-900" @click="emit('refresh')">
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
            <option
              v-for="option in CAMPAIGN_STATUS_FILTER_OPTIONS"
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
          @click="emit('clear-filters')"
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
      <AdminCampaignsTable
        v-for="group in campaignGroups"
        :key="group.key"
        :campaigns="group.campaigns"
        :count-class="group.countClass"
        :count-label="group.countLabel"
        :empty-message="group.emptyMessage"
        :get-campaign-product-names="getCampaignProductNames"
        :title="group.title"
        @analytics="emit('analytics', $event)"
        @delete="emit('delete', $event)"
        @edit="emit('edit', $event)"
      />
    </div>
  </section>
</template>
