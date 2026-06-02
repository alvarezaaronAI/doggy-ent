<script setup>
import { RouterLink } from 'vue-router'
</script>

<template>
  <div class="flex flex-wrap items-start justify-between gap-4">
    <div>
      <p class="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-400">Admin / Operations</p>
      <h1 class="mt-2 text-4xl font-extrabold">Orders</h1>
    </div>

    <RouterLink
      to="/admin"
      class="rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm font-bold text-[var(--brand-4)] transition hover:border-emerald-400 hover:bg-emerald-50"
    >
      ← Back to Dashboard
    </RouterLink>
  </div>
</template>
