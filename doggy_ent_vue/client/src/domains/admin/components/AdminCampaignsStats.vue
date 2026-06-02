<script setup>
import {
  formatAdminCampaignPrice,
} from '../utils/adminCampaigns.utils'

defineProps({
  activeCount: {
    type: Number,
    required: true,
  },
  totalDonationGenerated: {
    type: Number,
    required: true,
  },
  totalOrders: {
    type: Number,
    required: true,
  },
  totalRevenueGenerated: {
    type: Number,
    required: true,
  },
})
</script>

<template>
  <div class="mb-8 grid gap-4 md:grid-cols-4">
    <article class="section-panel p-5">
      <p class="text-sm font-semibold text-stone-400">Active campaigns</p>
      <p class="mt-2 text-3xl font-extrabold text-[var(--brand-4)]">{{ activeCount }}</p>
    </article>
    <article class="section-panel p-5">
      <p class="text-sm font-semibold text-stone-400">Orders tracked</p>
      <p class="mt-2 text-3xl font-extrabold text-[var(--brand-4)]">{{ totalOrders }}</p>
    </article>
    <article class="section-panel p-5">
      <p class="text-sm font-semibold text-stone-400">Revenue tracked</p>
      <p class="mt-2 text-3xl font-extrabold text-[var(--brand-4)]">{{ formatAdminCampaignPrice(totalRevenueGenerated) }}</p>
    </article>
    <article class="section-panel p-5">
      <p class="text-sm font-semibold text-stone-400">Donation generated</p>
      <p class="mt-2 text-3xl font-extrabold text-[var(--brand-4)]">{{ formatAdminCampaignPrice(totalDonationGenerated) }}</p>
    </article>
  </div>
</template>
