<script setup>
const props = defineProps({
  variants: {
    type: Array,
    default: () => [],
  },
  selectedSize: {
    type: String,
    required: true,
  },
  selectedStockLabel: {
    type: String,
    required: true,
  },
  unitPrice: {
    type: Number,
    required: true,
  },
  product: {
    type: Object,
    required: true,
  },
  formatCurrency: {
    type: Function,
    required: true,
  },
  getVariantDescription: {
    type: Function,
    required: true,
  },
  isInventoryLimited: {
    type: Function,
    required: true,
  },
})

const emit = defineEmits(['update-size'])
</script>

<template>
  <div class="mt-6 rounded-2xl border border-stone-800 bg-[color-mix(in_srgb,var(--brand-5)_48%,white)] p-4">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h3 class="font-extrabold text-[var(--brand-4)]">Choose Size</h3>
        <p class="mt-1 text-sm text-stone-300">
          Select a size before adding to cart.
        </p>
      </div>

      <p class="text-right text-sm font-semibold text-stone-400">
        {{ selectedStockLabel }}
        <span class="block text-lg font-extrabold text-[var(--brand-4)]">
          {{ formatCurrency(unitPrice) }}
        </span>
      </p>
    </div>

    <div class="mt-4 flex flex-wrap gap-2">
      <button
        v-for="variant in variants"
        :key="variant.size"
        class="rounded-full border px-4 py-2 text-sm font-extrabold transition"
        :class="[
          selectedSize === variant.size
            ? 'border-emerald-400 bg-emerald-400 text-[var(--brand-4)] shadow-sm'
            : 'border-stone-700 bg-white text-stone-700 hover:border-emerald-400',
          isInventoryLimited(product) && (variant.stockStatus === 'out-of-stock' || Number(variant.quantity || 0) <= 0)
            ? 'opacity-60'
            : ''
        ]"
        @click="emit('update-size', variant.size)"
      >
        {{ variant.size }}
      </button>
    </div>

    <p class="mt-3 text-xs text-stone-400">
      {{ getVariantDescription(selectedSize) }}
    </p>
  </div>
</template>
