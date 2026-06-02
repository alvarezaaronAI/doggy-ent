<script setup>
import { RouterLink } from 'vue-router'
</script>

<template>
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
</template>
