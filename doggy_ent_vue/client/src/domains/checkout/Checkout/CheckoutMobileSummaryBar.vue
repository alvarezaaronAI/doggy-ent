<script setup>
defineProps({
  summaryTotal: {
    type: Number,
    required: true,
  },
  itemCount: {
    type: Number,
    required: true,
  },
  mobileSummaryOpen: {
    type: Boolean,
    required: true,
  },
  isProcessingOrder: {
    type: Boolean,
    required: true,
  },
  checkoutRequirementsComplete: {
    type: Boolean,
    required: true,
  },
  formatPrice: {
    type: Function,
    required: true,
  },
})

const emit = defineEmits([
  'toggle-summary',
  'place-order',
])
</script>

<template>
  <section class="section-panel overflow-hidden xl:hidden mb-28">
    <button
      type="button"
      class="flex w-full items-center justify-between gap-4 p-4 text-left"
      @click="emit('toggle-summary')"
    >
      <div>
        <p class="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-400">
          Order Summary
        </p>

        <p class="mt-1 text-lg font-extrabold text-[var(--brand-4)]">
          {{ formatPrice(summaryTotal) }}
        </p>
      </div>

      <div class="flex items-center gap-3">
        <span class="rounded-full border border-stone-800 bg-[color-mix(in_srgb,var(--brand-5)_72%,white)] px-3 py-1.5 text-xs font-bold text-[var(--brand-4)]">
          {{ itemCount }} items
        </span>

        <i
          class="fa-solid transition"
          :class="mobileSummaryOpen ? 'fa-chevron-up rotate-180' : 'fa-chevron-down'"
        ></i>
      </div>
    </button>
  </section>

  <div class="fixed inset-x-0 bottom-0 z-[90] border-t border-stone-300 bg-white/95 p-4 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] backdrop-blur supports-[backdrop-filter]:bg-white/80 xl:hidden">
    <div class="mx-auto flex max-w-7xl items-center gap-3 pb-[env(safe-area-inset-bottom)]">
      <div class="min-w-0 flex-1">
        <p class="text-xs font-semibold uppercase tracking-[0.08em] text-stone-400">
          Total
        </p>

        <p class="truncate text-lg font-extrabold text-[var(--brand-4)]">
          {{ formatPrice(summaryTotal) }}
        </p>
      </div>

      <button
        type="button"
        class="focus-ring rounded-2xl px-5 py-3 font-extrabold transition"
        :disabled="isProcessingOrder || !checkoutRequirementsComplete"
        :class="checkoutRequirementsComplete
          ? 'bg-emerald-400 text-[var(--brand-4)] shadow-md'
          : 'bg-stone-200 text-stone-400 shadow-none cursor-not-allowed grayscale saturate-0'
        "
        @click="emit('place-order')"
      >
        <i
          :class="isProcessingOrder
            ? 'fa-solid fa-spinner animate-spin mr-2'
            : 'fa-solid fa-lock mr-2'
          "
        ></i>
        {{ isProcessingOrder ? 'Processing...' : 'Complete Order' }}
      </button>
    </div>
  </div>
</template>