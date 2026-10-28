<script setup>
import { computed } from 'vue'
import { ReceiptText, RefreshCw, Tag } from '@lucide/vue'
import { mapTaxDetails } from '../mappers/taxDetails.mapper.js'
const props = defineProps({
  summarySubtotal: { type: Number, required: true },
  summaryDiscount: { type: Number, required: true },
  summaryShipping: { type: Number, required: true },
  summaryTax: { type: Number, default: null },
  summaryTaxDetails: { type: Object, default: null },
  summaryTotal: { type: Number, default: null },
  checkoutPreviewError: { type: String, default: '' },
  itemCount: { type: Number, default: 0 },
  appliedPromoCode: { type: String, default: '' },
  summaryPromo: { type: Object, default: null },
  isRefreshingCheckoutPreview: { type: Boolean, required: true },
  formatPrice: { type: Function, required: true },
})
defineEmits(['retry-preview'])
const percent = new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 })
const afterDiscount = computed(() => Math.max(0, Math.round((props.summarySubtotal - props.summaryDiscount) * 100) / 100))
const promoLabel = computed(() => {
  if (!(props.summarySubtotal > 0 && props.summaryDiscount > 0) || props.isRefreshingCheckoutPreview || props.checkoutPreviewError) return null
  const promo = props.summaryPromo
  const value = promo?.discountValue
  const expected = Math.round(props.summarySubtotal * value) / 100
  if (promo?.valid && promo.discountType === 'PERCENT' && typeof value === 'number' && Number.isFinite(value) && value > 0 && value <= 100
    && Math.round(expected * 100) === Math.round(props.summaryDiscount * 100)) return `${percent.format(value)}% off`
  return `${percent.format(Math.min(100, props.summaryDiscount / props.summarySubtotal * 100))}% saved`
})
const rate = computed(() => {
  if (props.summaryTax == null || props.isRefreshingCheckoutPreview || props.checkoutPreviewError) return null
  if (props.summaryTax === 0) return '0% applied'
  const details = mapTaxDetails(props.summaryTaxDetails)
  if (details?.status === 'calculated' && details.taxAmount === props.summaryTax && details.rate) return details.rate
  const basis = afterDiscount.value + props.summaryShipping
  return basis > 0 ? `${percent.format(props.summaryTax / basis * 100)}% effective` : null
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
        <dt class="min-w-0 text-[#17634c]"><Tag :size="14" class="mr-1 inline-block align-middle" aria-hidden="true" />Discount<span v-if="appliedPromoCode" class="ml-2 inline-block break-words rounded bg-[#e8f3ec] px-2 py-1 text-xs font-medium text-[#17634c]">{{ appliedPromoCode }}</span><span v-if="promoLabel" class="ml-2 inline-block rounded bg-stone-100 px-2 py-1 text-xs font-medium text-stone-600">{{ promoLabel }}</span></dt>
        <dd class="shrink-0 font-medium tabular-nums text-[#17634c]">-{{ formatPrice(summaryDiscount) }}</dd>
      </div>
      <div v-if="summaryDiscount > 0" class="flex items-baseline justify-between gap-3 text-xs">
        <dt class="text-stone-600">Items after discount</dt>
        <dd class="flex min-w-0 flex-wrap justify-end gap-x-2 gap-y-1 tabular-nums"><span class="text-stone-500"><span class="sr-only">Before discount </span><s>{{ formatPrice(summarySubtotal) }}</s></span><span class="font-medium text-[#17634c]"><span class="sr-only">After discount </span>{{ formatPrice(afterDiscount) }}</span></dd>
      </div>
      <div class="flex items-baseline justify-between gap-5">
        <dt class="text-stone-600">Shipping</dt>
        <dd class="shrink-0 font-medium tabular-nums text-stone-800">{{ formatPrice(summaryShipping) }}</dd>
      </div>
      <div class="flex items-baseline justify-between gap-5">
        <dt class="min-w-0 text-[#315bc5]"><ReceiptText :size="14" class="mr-1 inline-block align-middle" aria-hidden="true" />Estimated tax<span v-if="rate" class="ml-2 inline-block rounded bg-stone-100 px-2 py-1 text-xs font-medium text-stone-600">{{ rate }}</span></dt>
        <dd class="shrink-0 font-medium tabular-nums text-[#315bc5]">{{ summaryTax == null ? 'Pending' : formatPrice(summaryTax) }}</dd>
      </div>
      <div class="!mt-5 flex items-baseline justify-between gap-5 border-t border-stone-200 pt-5">
        <dt class="text-base font-semibold text-[var(--storefront-brand-4)]">{{ summaryTotal == null ? 'Estimated total' : 'Order total' }}</dt>
        <dd class="shrink-0 text-xl font-semibold tabular-nums text-[var(--storefront-brand-4)]">{{ summaryTotal == null ? 'Pending' : formatPrice(summaryTotal) }}</dd>
      </div>
    </dl>
    <p v-if="isRefreshingCheckoutPreview" class="mt-2 text-xs text-stone-500" role="status">Updating tax and total...</p>
    <div v-else-if="checkoutPreviewError" class="mt-3 text-sm text-red-700" role="alert"><p>{{ checkoutPreviewError }}</p><button type="button" class="mt-2 inline-flex min-h-11 items-center gap-2 rounded-md border border-stone-200 bg-stone-50 px-3 font-medium text-stone-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#315bc5]" @click="$emit('retry-preview')"><RefreshCw :size="14" aria-hidden="true" />Retry order total</button></div>
  </section>
</template>
