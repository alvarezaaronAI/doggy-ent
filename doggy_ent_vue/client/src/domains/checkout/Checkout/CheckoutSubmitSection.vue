<script setup>
import { ArrowRight, LockKeyhole, LoaderCircle } from '@lucide/vue'
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
  nextAction: { type: Object, default: null },
  checkoutTotal: { type: Number, default: null },
  paymentCompleted: Boolean,
})
defineEmits(['continue'])
</script>

<template>
  <div class="rounded-lg border border-stone-200 bg-white p-5 shadow-[0_8px_24px_#24352d0a]">
    <div class="flex flex-col gap-4">
      <p v-if="checkoutRequirementsComplete || isProcessingOrder" class="max-w-2xl text-sm text-stone-600">
        By placing your order, you agree to our store policies, shipping terms, and secure payment authorization.
      </p>

      <button
        v-if="!isProcessingOrder && !checkoutRequirementsComplete && nextAction"
        type="button"
        class="focus-ring inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-md border border-[var(--storefront-brand-3)] bg-[var(--storefront-brand-2)] px-5 py-4 font-semibold text-[var(--storefront-brand-4)] shadow-sm transition enabled:hover:brightness-95 disabled:cursor-wait"
        :disabled="nextAction.busy"
        @click="$emit('continue', nextAction.step)"
      ><LoaderCircle v-if="nextAction.busy" :size="18" class="animate-spin motion-reduce:animate-none" aria-hidden="true" />{{ nextAction.busy ? nextAction.busyLabel || 'Updating your total' : nextAction.label }}<ArrowRight v-if="!nextAction.busy" :size="18" aria-hidden="true" /></button>

      <button
        v-else
        type="submit"
        class="focus-ring inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-md border px-5 py-4 font-semibold transition"
        :disabled="isProcessingOrder || !checkoutRequirementsComplete"
        :class="checkoutRequirementsComplete
          ? 'border-[var(--storefront-brand-3)] bg-[var(--storefront-brand-2)] text-[var(--storefront-brand-4)] shadow-sm enabled:hover:brightness-95 disabled:cursor-wait'
          : 'border-stone-200 bg-stone-100 text-stone-500 shadow-none cursor-not-allowed'
        "
      >
        <LoaderCircle v-if="isProcessingOrder" :size="18" class="shrink-0 animate-spin motion-reduce:animate-none" aria-hidden="true" />
        <LockKeyhole v-else :size="18" class="shrink-0" aria-hidden="true" />
        {{ isProcessingOrder ? paymentCompleted ? 'Saving your order...' : 'Processing payment...' : paymentCompleted ? 'Finish your order' : checkoutTotal != null ? `Pay $${checkoutTotal.toFixed(2)}` : 'Complete Secure Order' }}
      </button>
    </div>

    <div
      v-if="checkoutStatus"
      class="mt-4 rounded-md border p-4 text-sm font-semibold"
      role="status"
      :class="checkoutStatusType === 'success'
        ? 'border-green-200 bg-green-50 text-green-800'
        : 'border-red-200 bg-red-50 text-red-800'"
    >
      {{ checkoutStatus }}
    </div>
  </div>
</template>
