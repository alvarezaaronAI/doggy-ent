<script setup>
const props = defineProps({
  quantity: {
    type: Number,
    required: true,
  },
  totalPrice: {
    type: Number,
    required: true,
  },
  formatCurrency: {
    type: Function,
    required: true,
  },
})

const emit = defineEmits(['increase', 'decrease'])
</script>

<template>
  <div class="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-stone-800 bg-[color-mix(in_srgb,var(--brand-5)_55%,white)] p-4">
    <div>
      <p class="text-sm text-stone-400">Quantity</p>
      <div class="mt-2 inline-flex items-center overflow-hidden rounded-full border border-stone-700 bg-white">
        <button
          class="inline-flex h-10 w-10 items-center justify-center text-stone-400 hover:text-emerald-400"
          @click="emit('decrease')"
        >
          -
        </button>
        <span class="min-w-[3rem] text-center font-bold">{{ quantity }}</span>
        <button
          class="inline-flex h-10 w-10 items-center justify-center text-stone-400 hover:text-emerald-400"
          @click="emit('increase')"
        >
          +
        </button>
      </div>
    </div>

    <div class="text-right">
      <p class="text-sm text-stone-400">Total</p>
      <p class="text-2xl font-extrabold text-[var(--brand-4)]">
        {{ formatCurrency(totalPrice) }}
      </p>
    </div>
  </div>
</template>
