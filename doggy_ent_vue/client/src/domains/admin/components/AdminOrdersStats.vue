<script setup>
import {
  formatAdminOrderPrice,
} from '../utils/adminOrders.utils'

defineProps({
  stats: {
    type: Object,
    required: true,
  },
})
</script>

<template>
  <div class="mt-6 grid gap-4 md:grid-cols-4">
    <article class="rounded-2xl border border-[var(--brand-3)] bg-white p-5 shadow-sm">
      <p class="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">Total orders</p>
      <p class="mt-2 text-3xl font-extrabold text-[var(--brand-4)]">{{ stats.totalOrders }}</p>
    </article>

    <article class="rounded-2xl border border-[var(--brand-3)] bg-white p-5 shadow-sm">
      <p class="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">Pending</p>
      <p class="mt-2 text-3xl font-extrabold text-[var(--brand-4)]">{{ stats.pendingOrders }}</p>
    </article>

    <article class="rounded-2xl border border-[var(--brand-3)] bg-white p-5 shadow-sm">
      <p class="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">Revenue</p>
      <p class="mt-2 text-3xl font-extrabold text-[var(--brand-4)]">{{ formatAdminOrderPrice(stats.totalRevenue) }}</p>
    </article>

    <article class="rounded-2xl border border-[var(--brand-3)] bg-white p-5 shadow-sm">
      <p class="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">Donations</p>
      <p class="mt-2 text-3xl font-extrabold text-[var(--success-1)]">{{ formatAdminOrderPrice(stats.totalDonationGenerated) }}</p>
    </article>
  </div>
</template>
