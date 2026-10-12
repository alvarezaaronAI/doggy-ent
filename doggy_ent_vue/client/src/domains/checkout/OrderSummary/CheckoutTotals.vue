<script setup>
defineProps({
  summarySubtotal: { type: Number, required: true },
  summaryDiscount: { type: Number, required: true },
  summaryShipping: { type: Number, required: true },
  summaryTax: { type: Number, required: true },
  summaryTotal: { type: Number, required: true },
  itemCount: { type: Number, default: 0 },
  appliedPromoCode: { type: String, default: '' },
  isRefreshingCheckoutPreview: { type: Boolean, required: true },
  formatPrice: { type: Function, required: true },
})
</script>

<template>
  <section aria-label="Cost summary" class="mt-6 border-t border-stone-200 pt-5" :aria-busy="isRefreshingCheckoutPreview">
    <dl class="space-y-3 text-sm">
      <div class="flex items-baseline justify-between gap-5">
        <dt class="text-stone-600">Items subtotal<span v-if="itemCount" class="ml-1 text-stone-500">({{ itemCount }} {{ itemCount === 1 ? 'item' : 'items' }})</span></dt>
        <dd class="shrink-0 font-medium tabular-nums text-stone-800">{{ formatPrice(summarySubtotal) }}</dd>
      </div>
      <div v-if="summaryDiscount > 0" class="flex items-baseline justify-between gap-5">
        <dt class="min-w-0 text-[#17634c]">Discount<span v-if="appliedPromoCode" class="ml-2 break-words text-xs font-medium">{{ appliedPromoCode }}</span></dt>
        <dd class="shrink-0 font-medium tabular-nums text-[#17634c]">-{{ formatPrice(summaryDiscount) }}</dd>
      </div>
      <div class="flex items-baseline justify-between gap-5">
        <dt class="text-stone-600">Shipping</dt>
        <dd class="shrink-0 font-medium tabular-nums text-stone-800">{{ formatPrice(summaryShipping) }}</dd>
      </div>
      <div class="flex items-baseline justify-between gap-5">
        <dt class="text-stone-600">Estimated tax</dt>
        <dd class="shrink-0 font-medium tabular-nums text-stone-800">{{ formatPrice(summaryTax) }}</dd>
      </div>
      <div class="!mt-5 flex items-baseline justify-between gap-5 border-t border-stone-200 pt-5">
        <dt class="text-base font-semibold text-stone-900">Order total</dt>
        <dd class="shrink-0 text-xl font-semibold tabular-nums text-stone-900">{{ formatPrice(summaryTotal) }}</dd>
      </div>
    </dl>
    <p v-if="isRefreshingCheckoutPreview" class="mt-2 text-xs text-stone-500" role="status">Updating tax and total...</p>
  </section>
</template>
