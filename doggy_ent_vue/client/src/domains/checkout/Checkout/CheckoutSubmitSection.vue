

<script setup>
defineProps({
  isProcessingOrder: {
    type: Boolean,
    required: true,
  },
  checkoutRequirementsComplete: {
    type: Boolean,
    required: true,
  },
  checkoutStatus: {
    type: String,
    default: '',
  },
  checkoutStatusType: {
    type: String,
    default: '',
  },
})
</script>

<template>
  <div class="rounded-2xl border border-stone-700 bg-[color-mix(in_srgb,var(--brand-5)_48%,white)] p-5">
    <div class="hidden flex-col gap-4 md:flex-row md:items-center md:justify-between xl:flex">
      <p class="max-w-2xl text-sm text-stone-300">
        By placing your order, you agree to our store policies, shipping terms, and secure payment authorization.
      </p>

      <button
        type="submit"
        class="focus-ring rounded-2xl px-6 py-4 font-extrabold transition md:min-w-[240px]"
        :disabled="isProcessingOrder || !checkoutRequirementsComplete"
        :class="checkoutRequirementsComplete
          ? 'bg-emerald-400 hover:bg-emerald-300 text-[var(--brand-4)] shadow-md hover:-translate-y-0.5'
          : 'bg-stone-200 text-stone-400 shadow-none cursor-not-allowed grayscale saturate-0'
        "
      >
        <i
          :class="isProcessingOrder
            ? 'fa-solid fa-spinner animate-spin mr-2'
            : 'fa-solid fa-lock mr-2'
          "
        ></i>
        {{ isProcessingOrder ? 'Processing Secure Payment...' : 'Complete Secure Order' }}
      </button>
    </div>

    <div
      v-if="checkoutStatus"
      class="mt-4 rounded-2xl border p-4 text-sm font-bold"
      :class="checkoutStatusType === 'success'
        ? 'border-green-200 bg-green-50 text-green-800'
        : 'border-red-200 bg-red-50 text-red-800'"
    >
      {{ checkoutStatus }}
    </div>
  </div>
</template>