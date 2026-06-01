

<script setup>
defineProps({
  cartItems: {
    type: Array,
    required: true,
  },
  promoCode: {
    type: String,
    default: '',
  },
  promoStatus: {
    type: String,
    default: '',
  },
  promoMessage: {
    type: String,
    default: '',
  },
})

const emit = defineEmits([
  'update:promo-code',
  'apply-promo-code',
])
</script>

<template>
  <template v-if="cartItems.length">
    <div class="my-5 h-px bg-[color-mix(in_srgb,var(--brand-3)_30%,white)]"></div>

    <div>
      <h3 class="text-base font-extrabold">Promo code</h3>
      <p class="mt-1 text-xs leading-relaxed text-stone-300">
        Have a discount code? Apply it before placing your order.
      </p>

      <div class="mt-4 flex flex-col gap-3 sm:flex-row">
        <input
          :value="promoCode"
          class="flex-1 rounded-2xl border bg-white px-4 py-3 outline-none focus:border-emerald-400"
          :class="promoStatus === 'error' ? 'border-red-300 bg-red-50' : promoStatus === 'success' ? 'border-green-300 bg-green-50' : promoStatus === 'checking' ? 'border-amber-300 bg-amber-50' : 'border-stone-700'"
          placeholder="Enter promo code"
          @input="emit('update:promo-code', $event.target.value)"
          @keydown.enter.prevent="emit('apply-promo-code')"
        />

        <button
          type="button"
          class="focus-ring rounded-lg border border-emerald-400 px-5 py-3 font-semibold text-emerald-400 hover:bg-stone-900 disabled:cursor-not-allowed disabled:opacity-60"
          :disabled="promoStatus === 'checking'"
          @click="emit('apply-promo-code')"
        >
          <i class="fa-solid fa-tag mr-2"></i>
          {{ promoStatus === 'checking' ? 'Checking...' : 'Apply' }}
        </button>
      </div>

      <p class="mt-3 text-sm text-stone-300">
        {{ promoMessage }}
      </p>
    </div>
  </template>
</template>