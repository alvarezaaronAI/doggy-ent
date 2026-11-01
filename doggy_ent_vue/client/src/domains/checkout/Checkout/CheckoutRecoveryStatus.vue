<script setup>
import { computed, nextTick, ref, watch } from 'vue'
import { CircleHelp, RefreshCw, X, Check, ShoppingBag } from '@lucide/vue'
const props = defineProps({ status: String, message: String, busy: Boolean, canCheck: Boolean, canCancel: Boolean, canFinalize: Boolean, canPrepare: Boolean, canStartNew: Boolean })
defineEmits(['check', 'cancel', 'finalize', 'prepare', 'start-new'])
const confirmingCancel = ref(false)
const keepButton = ref(null), cancelButton = ref(null), statusElement = ref(null)
async function reviewCancellation() { confirmingCancel.value = true; await nextTick(); keepButton.value?.focus() }
async function keepAttempt() { confirmingCancel.value = false; await nextTick(); cancelButton.value?.focus() }
watch(() => props.canCancel, async value => { if (!value && confirmingCancel.value) { confirmingCancel.value = false; await nextTick(); statusElement.value?.focus() } })
const copy = computed(() => ({
  PREPARED: 'Your payment attempt is saved. Continue only after reviewing the order total.',
  OPEN: 'Your payment attempt is saved. Review the order total before continuing.',
  PROCESSING: 'Your payment is still being checked. Do not pay again.',
  PAID_PENDING_ORDER: 'Payment was received. We are finishing your order. Do not pay again.',
  COMPLETED: 'Your order is saved. Open its confirmation without paying again.',
  PAID_REVIEW: 'Your payment needs review. Do not pay again. Contact us for help.',
  CANCELED: 'This payment attempt was canceled. Check its status before starting over.',
  EXPIRED: 'This payment attempt has expired. Check its status before starting over.',
}[props.status] || 'We are checking your saved payment. Do not start another payment.'))
</script>
<template>
  <section ref="statusElement" tabindex="-1" class="mb-5 border-b border-stone-200 pb-5" aria-label="Payment recovery" :aria-busy="busy">
    <p class="flex items-start gap-2 text-sm text-stone-700" role="status"><CircleHelp :size="18" class="mt-0.5 shrink-0" aria-hidden="true" />{{ message || copy }}</p>
    <div class="mt-3 flex flex-wrap gap-2">
      <button v-if="canCheck" type="button" class="focus-ring inline-flex min-h-11 items-center gap-2 rounded-md border border-stone-200 bg-stone-50 px-3 text-sm disabled:opacity-50" :disabled="busy" @click="$emit('check')"><RefreshCw :size="16" aria-hidden="true" />{{ busy ? 'Checking payment...' : status === 'COMPLETED' ? 'Open confirmation' : 'Check payment' }}</button>
      <button v-if="canFinalize" type="button" class="focus-ring inline-flex min-h-11 items-center gap-2 rounded-md border border-stone-200 bg-stone-50 px-3 text-sm" :disabled="busy" @click="$emit('finalize')"><Check :size="16" aria-hidden="true" />Finish order</button>
      <button v-if="canPrepare" type="button" class="focus-ring inline-flex min-h-11 items-center gap-2 rounded-md border border-stone-200 bg-stone-50 px-3 text-sm" :disabled="busy" @click="$emit('prepare')"><RefreshCw :size="16" aria-hidden="true" />Resume checkout</button>
      <button v-if="canStartNew" type="button" class="focus-ring inline-flex min-h-11 items-center gap-2 rounded-md border border-stone-200 bg-stone-50 px-3 text-sm" :disabled="busy" @click="$emit('start-new')"><ShoppingBag :size="16" aria-hidden="true" />Start a new order</button>
      <button v-if="canCancel && !confirmingCancel" ref="cancelButton" type="button" class="focus-ring inline-flex min-h-11 items-center gap-2 rounded-md border border-stone-200 bg-stone-50 px-3 text-sm" :disabled="busy" @click="reviewCancellation"><X :size="16" aria-hidden="true" />Cancel unpaid attempt</button>
      <RouterLink v-if="status === 'PAID_REVIEW' || !status" to="/contact" class="focus-ring inline-flex min-h-11 items-center rounded-md border border-stone-200 bg-stone-50 px-3 text-sm">Contact us</RouterLink>
    </div>
    <div v-if="confirmingCancel && canCancel" class="mt-3 text-sm">
      <p>Cancel this unpaid payment attempt? Your bag stays unchanged.</p>
      <div class="mt-2 flex flex-wrap gap-2">
        <button ref="keepButton" type="button" class="focus-ring min-h-11 rounded-md border border-stone-200 bg-stone-50 px-3" :disabled="busy" @click="keepAttempt">Keep attempt</button>
        <button type="button" class="focus-ring min-h-11 rounded-md border border-stone-200 bg-stone-50 px-3" :disabled="busy" @click="$emit('cancel')">Confirm cancellation</button>
      </div>
    </div>
  </section>
</template>
