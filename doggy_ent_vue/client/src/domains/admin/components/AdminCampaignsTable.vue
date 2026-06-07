<script setup>
import {
  formatAdminCampaignPrice,
  formatCampaignDonationRule,
} from '../utils/adminCampaigns.utils'
import AdminCampaignStatusBadge from './AdminCampaignStatusBadge.vue'

defineProps({
  campaigns: {
    type: Array,
    required: true,
  },
  countClass: {
    type: String,
    required: true,
  },
  countLabel: {
    type: String,
    required: true,
  },
  emptyMessage: {
    type: String,
    required: true,
  },
  getCampaignProductNames: {
    type: Function,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
})

const emit = defineEmits([
  'analytics',
  'delete',
  'edit',
])
</script>

<template>
  <section>
    <div class="mb-3 flex items-center justify-between gap-3">
      <h3 class="text-lg font-extrabold text-[var(--brand-4)]">{{ title }}</h3>
      <span class="rounded-full px-3 py-1 text-xs font-bold" :class="countClass">{{ countLabel }}</span>
    </div>

    <div v-if="!campaigns.length" class="rounded-2xl border border-stone-200 bg-white/70 p-4 text-sm text-stone-400">
      {{ emptyMessage }}
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
          <tr v-for="campaign in campaigns" :key="campaign.id" class="border-t border-stone-200 align-top">
            <td class="px-5 py-4">
              <p class="font-extrabold text-[var(--brand-4)]">{{ campaign.name }}</p>
              <p class="mt-1 max-w-xs text-xs text-stone-400">{{ campaign.description || 'No description' }}</p>
            </td>
            <td class="px-5 py-4">
              <p class="font-bold">{{ campaign.donationTarget }}</p>
            </td>
            <td class="px-5 py-4">
              <AdminCampaignStatusBadge :status="campaign.status" />
            </td>
            <td class="px-5 py-4">
              <p class="font-bold">{{ formatCampaignDonationRule(campaign) }}</p>
            </td>
            <td class="px-5 py-4">
              <p class="max-w-xs text-xs leading-relaxed text-stone-400">{{ getCampaignProductNames(campaign) }}</p>
            </td>
            <td class="px-5 py-4">
              <p class="text-xs text-stone-400">Orders</p>
              <p class="font-bold">{{ campaign.orderCount || 0 }}</p>
              <p class="mt-2 text-xs text-stone-400">Donation</p>
              <p class="font-bold text-[var(--success-1)]">{{ formatAdminCampaignPrice(campaign.donationGenerated) }}</p>
              <p class="mt-2 text-xs text-stone-400">Revenue</p>
              <p class="font-bold">{{ formatAdminCampaignPrice(campaign.revenueGenerated) }}</p>
              <div v-if="campaign.orderAttributions?.length" class="mt-3 border-t border-stone-200 pt-3">
                <p class="text-xs font-bold uppercase tracking-[0.12em] text-stone-400">Recent orders</p>
                <div class="mt-2 space-y-1">
                  <p
                    v-for="usage in campaign.orderAttributions.slice(0, 3)"
                    :key="usage.id"
                    class="text-xs text-stone-500"
                  >
                    {{ usage.orderNumber || 'Order' }} · {{ formatAdminCampaignPrice(usage.donationAmount) }}
                  </p>
                </div>
              </div>
            </td>
            <td class="px-5 py-4">
              <div class="flex flex-wrap gap-2">
                <button class="rounded-lg border border-stone-300 px-3 py-2 text-xs font-bold text-stone-600 hover:border-emerald-400 hover:bg-emerald-50" @click="emit('analytics', campaign)">
                  Analytics
                </button>
                <button class="rounded-lg border border-emerald-400 px-3 py-2 text-xs font-bold text-emerald-400 hover:bg-stone-900" @click="emit('edit', campaign)">
                  Edit
                </button>
                <button class="rounded-lg border border-red-200 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50" @click="emit('delete', campaign)">
                  Delete
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>
