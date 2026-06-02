<script setup>
import {
  formatAdminPromoPrice,
} from '../utils/adminPromos.utils'

defineProps({
  activeCount: {
    type: Number,
    required: true,
  },
  totalDiscountGiven: {
    type: Number,
    required: true,
  },
  totalUses: {
    type: Number,
    required: true,
  },
})
</script>

<template>
  <div class="mb-8 grid gap-4 md:grid-cols-3">
    <article class="section-panel p-5">
      <p class="text-sm font-semibold text-stone-400">Active codes</p>
      <p class="mt-2 text-3xl font-extrabold text-[var(--brand-4)]">{{ activeCount }}</p>
    </article>
    <article class="section-panel p-5">
      <p class="text-sm font-semibold text-stone-400">Total uses</p>
      <p class="mt-2 text-3xl font-extrabold text-[var(--brand-4)]">{{ totalUses }}</p>
    </article>
    <article class="section-panel p-5">
      <p class="text-sm font-semibold text-stone-400">Discount given</p>
      <p class="mt-2 text-3xl font-extrabold text-[var(--brand-4)]">{{ formatAdminPromoPrice(totalDiscountGiven) }}</p>
    </article>
  </div>
</template>
