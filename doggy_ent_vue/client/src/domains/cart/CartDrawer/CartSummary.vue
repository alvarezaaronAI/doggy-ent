<script setup>
import { RouterLink } from 'vue-router'

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
  <div class="border-t border-stone-800 bg-[color-mix(in_srgb,var(--brand-5)_62%,white)] px-5 py-5 shadow-[0_-12px_32px_rgba(41,31,24,0.06)]">
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

      <div class="rounded-2xl border border-stone-800 bg-white/70 p-3 text-xs leading-relaxed text-stone-500">
        Fresh orders, preorder items, and made-to-order treats may have different prep times before shipping.
      </div>
    </div>

    <div class="my-4 h-px bg-[color-mix(in_srgb,var(--brand-3)_30%,white)]"></div>

    <RouterLink
      to="/checkout"
      class="focus-ring inline-flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-400 px-5 py-3 text-center font-semibold text-[var(--brand-4)] hover:bg-emerald-300"
      @click="emit('close')"
    >
      🔒 Secure Checkout
    </RouterLink>

    <p class="mt-2 text-center text-xs text-stone-400">
      Taxes and shipping are finalized at checkout.
    </p>

    <button
      class="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-emerald-400 px-5 py-3 text-emerald-400 hover:bg-stone-900"
      @click="emit('continue-shopping')"
    >
      Continue Shopping
    </button>
  </div>
</template>
