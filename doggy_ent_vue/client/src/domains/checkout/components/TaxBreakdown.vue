<script setup>
import { computed } from 'vue'
import { ChevronDown } from '@lucide/vue'
import { mapTaxDetails } from '../mappers/taxDetails.mapper.js'

const props = defineProps({
  taxDetails: { type: Object, default: null },
  taxAmount: { type: Number, default: null },
  saved: Boolean,
  pending: Boolean,
  formatPrice: { type: Function, required: true },
})
const details = computed(() => props.pending ? null : mapTaxDetails(props.taxDetails))
const message = computed(() => {
  if (props.pending) return 'Tax and total are pending a current order preview.'
  if (!details.value) return props.saved
    ? 'A tax rate and jurisdiction breakdown were not saved for this order.'
    : 'A tax rate and jurisdiction breakdown are not available.'
  if (details.value.status === 'not_configured') return props.saved
    ? 'Tax was not collected. Tax collection setup was pending for this order.'
    : 'Tax is not being collected. Tax collection setup is pending.'
  if (details.value.status === 'pending_address') return 'Enter your complete US shipping address to calculate tax.'
  if (details.value.status === 'not_collecting') return props.saved
    ? 'Tax was not collected for this destination.'
    : 'Tax is not collected for this destination.'
  return props.taxAmount === 0
    ? 'The tax calculation returned no tax to collect. See any supplied jurisdiction details below.'
    : ''
})
</script>

<template>
  <div class="min-w-0 text-xs leading-relaxed text-stone-600">
    <p v-if="message">{{ message }}</p>
    <details v-if="details" class="mt-2">
      <summary class="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 rounded-md border border-stone-200 bg-stone-50 px-3 py-2 font-medium text-stone-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#315bc5] [&::-webkit-details-marker]:hidden">
        <span>Tax destination &amp; breakdown</span><ChevronDown :size="16" class="shrink-0" aria-hidden="true" />
      </summary>
      <div class="space-y-3 pt-3">
        <p class="break-words"><span class="font-medium">Destination:</span> {{ details.destination }}</p>
        <p v-if="details.status === 'calculated'">{{ details.rate ? 'Tax rate: ' + details.rate : 'No single tax rate was supplied.' }}</p>
        <ul v-if="details.breakdown.length" class="space-y-3" aria-label="Tax jurisdictions">
          <li v-for="(row, index) in details.breakdown" :key="index" class="border-t border-stone-200 pt-3">
            <div class="flex items-baseline justify-between gap-3"><span class="min-w-0 break-words font-medium">{{ row.label }}<span v-if="row.rate" class="ml-1">({{ row.rate }})</span></span><span class="shrink-0 tabular-nums">{{ formatPrice(row.taxAmount) }}</span></div>
            <p>Taxable amount: {{ formatPrice(row.taxableAmount) }}</p>
            <p v-if="row.reason">{{ row.reason }}</p>
          </li>
        </ul>
        <p v-else>No jurisdiction breakdown was {{ saved ? 'saved' : 'provided' }}.</p>
      </div>
    </details>
  </div>
</template>
