


<script setup>
defineProps({
  summarySubtotal: { type: Number, required: true },
  summaryDiscount: { type: Number, required: true },
  summaryShipping: { type: Number, required: true },
  summaryTax: { type: Number, required: true },
  summaryDonation: { type: Number, required: true },
  summaryTotal: { type: Number, required: true },
  appliedPromoCode: { type: String, default: '' },
  isRefreshingCheckoutPreview: { type: Boolean, required: true },
  formatPrice: { type: Function, required: true },
})
</script>

<template>
  <div class="my-5 h-px bg-[color-mix(in_srgb,var(--brand-3)_30%,white)]"></div>

  <div class="space-y-3 text-sm">
    <div class="flex items-center justify-between">
      <span class="text-stone-300">Subtotal</span>
      <span class="font-bold">{{ formatPrice(summarySubtotal) }}</span>
    </div>

    <div v-if="summaryDiscount" class="flex items-start justify-between gap-3">
      <div>
        <span class="text-sm text-stone-300">Promo applied</span>
        <p class="text-xs font-semibold text-[var(--brand-4)]">{{ appliedPromoCode }}</p>
      </div>
      <span class="font-bold text-[var(--success-1)]">-{{ formatPrice(summaryDiscount) }}</span>
    </div>

    <div class="flex items-center justify-between">
      <span class="text-stone-300">Shipping</span>
      <span class="font-bold">{{ formatPrice(summaryShipping) }}</span>
    </div>

    <div class="flex items-center justify-between">
      <span class="text-stone-300">Taxes</span>
      <span class="font-bold">{{ formatPrice(summaryTax) }}</span>
    </div>

    <div v-if="summaryDonation" class="flex items-center justify-between">
      <span class="text-stone-300">Donation generated</span>
      <span class="font-bold text-[var(--success-1)]">{{ formatPrice(summaryDonation) }}</span>
    </div>
  </div>

  <div class="my-5 h-px bg-[color-mix(in_srgb,var(--brand-3)_30%,white)]"></div>

  <div class="flex items-center justify-between text-lg">
    <span class="font-extrabold">Total</span>
    <span class="font-extrabold text-[var(--brand-4)]">{{ formatPrice(summaryTotal) }}</span>
  </div>

  <p v-if="isRefreshingCheckoutPreview" class="mt-2 text-xs font-semibold text-stone-400">
    Updating tax and total...
  </p>
</template>