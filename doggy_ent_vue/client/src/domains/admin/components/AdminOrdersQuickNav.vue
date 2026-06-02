<script setup>
defineProps({
  cancelledCount: {
    type: Number,
    required: true,
  },
  fulfilledCount: {
    type: Number,
    required: true,
  },
  needsAttentionCount: {
    type: Number,
    required: true,
  },
  readyCount: {
    type: Number,
    required: true,
  },
})
</script>

<template>
  <div class="sticky top-0 z-10 mt-6 rounded-2xl border border-[var(--brand-3)] bg-white/95 p-3 shadow-sm backdrop-blur">
    <div class="grid gap-3 md:grid-cols-4">
      <a href="#needs-attention" class="rounded-xl border border-red-100 bg-red-50 px-4 py-3 transition hover:border-red-200">
        <p class="text-xs font-semibold uppercase tracking-[0.14em] text-red-400">Needs attention</p>
        <p class="mt-1 text-2xl font-extrabold text-red-700">{{ needsAttentionCount }}</p>
      </a>

      <a href="#ready-to-fulfill" class="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 transition hover:border-emerald-200">
        <p class="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-500">Ready</p>
        <p class="mt-1 text-2xl font-extrabold text-emerald-700">{{ readyCount }}</p>
      </a>

      <a href="#fulfilled" class="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 transition hover:border-blue-200">
        <p class="text-xs font-semibold uppercase tracking-[0.14em] text-blue-400">Fulfilled</p>
        <p class="mt-1 text-2xl font-extrabold text-blue-700">{{ fulfilledCount }}</p>
      </a>

      <a href="#cancelled" class="rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 transition hover:border-stone-300">
        <p class="text-xs font-semibold uppercase tracking-[0.14em] text-stone-400">Cancelled</p>
        <p class="mt-1 text-2xl font-extrabold text-stone-700">{{ cancelledCount }}</p>
      </a>
    </div>
  </div>
</template>
