<script setup>
import { computed } from 'vue'
import { LoaderCircle, MapPin, RefreshCw } from '@lucide/vue'
import TaxBreakdown from '../components/TaxBreakdown.vue'
import { mapTaxDetails } from '../mappers/taxDetails.mapper.js'
const props = defineProps({
  summarySubtotal: { type: Number, required: true },
  summaryDiscount: { type: Number, required: true },
  summaryShipping: { type: Number, required: true },
  summaryTax: { type: Number, default: null },
  summaryTaxDetails: { type: Object, default: null },
  summaryTotal: { type: Number, default: null },
  estimatedTotal: { type: Number, default: null },
  totalIsEstimate: Boolean,
  checkoutPreviewError: { type: String, default: '' },
  itemCount: { type: Number, default: 0 },
  appliedPromoCode: { type: String, default: '' },
  isRefreshingCheckoutPreview: { type: Boolean, required: true },
  formatPrice: { type: Function, required: true },
})
defineEmits(['retry-preview'])
const rate = computed(() => props.summaryTax != null && props.summaryTaxDetails?.status === 'calculated'
  ? mapTaxDetails(props.summaryTaxDetails)?.rate : null)
const displayedTotal = computed(() => props.summaryTotal ?? props.estimatedTotal)
const totalLabel = computed(() => props.summaryTax == null ? 'Estimated total before tax'
  : props.totalIsEstimate ? 'Estimated total' : 'Order total')
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
        <dt class="text-stone-600">{{ totalIsEstimate ? 'Estimated shipping' : 'Shipping' }}</dt>
        <dd class="shrink-0 font-medium tabular-nums text-stone-800">{{ formatPrice(summaryShipping) }}</dd>
      </div>
      <div class="flex items-baseline justify-between gap-5">
        <dt class="text-stone-600">Tax<span v-if="rate" class="ml-1">({{ rate }})</span></dt>
        <dd class="shrink-0 font-medium tabular-nums text-stone-800">{{ summaryTax == null ? 'At delivery step' : formatPrice(summaryTax) }}</dd>
      </div>
      <div v-if="summaryTaxDetails?.status === 'calculated' || summaryTaxDetails?.status === 'not_collecting'"><dt class="sr-only">Tax details</dt><dd><TaxBreakdown :tax-details="summaryTaxDetails" :tax-amount="summaryTax" :pending="isRefreshingCheckoutPreview" :format-price="formatPrice" /></dd></div>
      <div class="!mt-5 flex items-baseline justify-between gap-5 border-t border-stone-200 pt-5">
        <dt class="min-w-0 text-base font-semibold text-stone-900">{{ totalLabel }}</dt>
        <dd class="shrink-0 text-xl font-semibold tabular-nums text-stone-900">{{ displayedTotal == null ? 'Pending' : formatPrice(displayedTotal) }}</dd>
      </div>
    </dl>
    <p v-if="isRefreshingCheckoutPreview" class="mt-3 flex items-center gap-2 text-xs text-stone-500" role="status"><LoaderCircle :size="14" class="shrink-0 animate-spin motion-reduce:animate-none" aria-hidden="true" />Updating your estimate...</p>
    <div v-else-if="checkoutPreviewError" class="mt-3 border-l-2 border-red-300 pl-3 text-sm text-red-800" role="alert"><p>Your total needs a refresh.</p><button type="button" class="mt-2 inline-flex min-h-11 items-center gap-2 rounded-md border border-stone-200 bg-stone-50 px-3 font-medium text-stone-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#315bc5]" @click="$emit('retry-preview')"><RefreshCw :size="14" aria-hidden="true" />Retry order total</button></div>
    <p v-else-if="totalIsEstimate" class="mt-3 flex items-start gap-2 text-xs text-stone-500"><MapPin :size="14" class="mt-0.5 shrink-0" aria-hidden="true" />Updated with your delivery details before payment.</p>
  </section>
</template>
