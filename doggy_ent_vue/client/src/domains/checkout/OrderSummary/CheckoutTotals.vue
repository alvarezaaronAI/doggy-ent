<script setup>
import { computed } from 'vue'
import { RefreshCw } from '@lucide/vue'
import TaxBreakdown from '../components/TaxBreakdown.vue'
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
  isRefreshingCheckoutPreview: { type: Boolean, required: true },
  formatPrice: { type: Function, required: true },
})
defineEmits(['retry-preview'])
const rate = computed(() => props.summaryTax != null && props.summaryTaxDetails?.status === 'calculated'
  ? mapTaxDetails(props.summaryTaxDetails)?.rate : null)
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
        <dt class="text-stone-600">Estimated tax<span v-if="rate" class="ml-1">({{ rate }})</span></dt>
        <dd class="shrink-0 font-medium tabular-nums text-stone-800">{{ summaryTax == null ? 'Pending' : formatPrice(summaryTax) }}</dd>
      </div>
      <div><dt class="sr-only">Tax details</dt><dd><TaxBreakdown :tax-details="summaryTaxDetails" :tax-amount="summaryTax" :pending="isRefreshingCheckoutPreview || (!summaryTaxDetails && summaryTax == null)" :format-price="formatPrice" /></dd></div>
      <div class="!mt-5 flex items-baseline justify-between gap-5 border-t border-stone-200 pt-5">
        <dt class="text-base font-semibold text-stone-900">{{ summaryTotal == null ? 'Estimated total' : 'Order total' }}</dt>
        <dd class="shrink-0 text-xl font-semibold tabular-nums text-stone-900">{{ summaryTotal == null ? 'Pending' : formatPrice(summaryTotal) }}</dd>
      </div>
    </dl>
    <p v-if="isRefreshingCheckoutPreview" class="mt-2 text-xs text-stone-500" role="status">Updating tax and total...</p>
    <div v-else-if="checkoutPreviewError" class="mt-3 text-sm text-red-700" role="alert"><p>{{ checkoutPreviewError }}</p><button type="button" class="mt-2 inline-flex min-h-11 items-center gap-2 rounded-md border border-stone-200 bg-stone-50 px-3 font-medium text-stone-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#315bc5]" @click="$emit('retry-preview')"><RefreshCw :size="14" aria-hidden="true" />Retry order total</button></div>
  </section>
</template>
