<script setup>
import { RouterLink } from 'vue-router'
import { LockKeyhole, ArrowRight } from '@lucide/vue'

const props = defineProps({
  subtotal: {
    type: Number,
    default: 0,
  },
  itemCount: {
    type: Number,
    default: 0,
  },
  formatPrice: {
    type: Function,
    required: true,
  },
})

const emit = defineEmits([
  'close',
  'continue-shopping',
])
</script>

<template>
  <div class="shrink-0 border-t border-stone-800 bg-[color-mix(in_srgb,var(--brand-5)_62%,white)] px-5 py-4 shadow-[0_-12px_32px_rgba(41,31,24,0.06)]">
    <div class="space-y-3 text-sm">
      <div class="flex items-center justify-between">
        <span class="text-stone-300">Items</span>
        <span class="font-semibold text-stone-900">{{ props.itemCount }}</span>
      </div>

      <div class="flex items-center justify-between">
        <span class="text-stone-300">Subtotal</span>
        <span class="font-semibold text-stone-900">{{ props.formatPrice(props.subtotal) }}</span>
      </div>

      <div class="flex items-center justify-between">
        <span class="text-stone-300">Shipping</span>
        <span class="font-semibold text-stone-900">Calculated at checkout</span>
      </div>

      <p class="text-xs leading-relaxed text-stone-500">
        Fresh orders, preorder items, and made-to-order treats may have different prep times before shipping.
      </p>
    </div>

    <div class="my-4 h-px bg-[color-mix(in_srgb,var(--brand-3)_30%,white)]"></div>

    <RouterLink
      to="/checkout"
      class="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md border border-[#d4bf43] bg-[var(--brand-2)] px-5 py-3 text-center font-semibold text-[var(--brand-4)] shadow-sm hover:bg-[#e8d350]"
      @click="emit('close')"
    >
      <LockKeyhole :size="18" aria-hidden="true" /> Secure Checkout
      <ArrowRight :size="18" aria-hidden="true" />
    </RouterLink>

    <p class="mt-2 text-center text-xs text-stone-400">
      Taxes and shipping are finalized at checkout.
    </p>

    <button
      type="button"
      class="mt-3 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md border border-[var(--brand-1)] bg-white px-5 py-3 font-semibold text-[var(--brand-1)] hover:bg-[#edf1fb]"
      @click="emit('continue-shopping')"
    >
      Continue Shopping
    </button>
  </div>
</template>
