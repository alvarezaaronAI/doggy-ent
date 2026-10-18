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
  <div class="mt-5">
    <div class="quick-selected-price"><strong>{{ formatCurrency(unitPrice) }}</strong><span>{{ selectedSize }} · {{ selectedStockLabel }}</span></div>
    <p class="mt-4 text-xs font-semibold">Choose a bag size</p>
    <div class="mt-2 flex flex-wrap gap-2">
      <button
        v-for="variant in variants"
        :key="variant.size"
        type="button"
        class="store-size"
        :aria-pressed="selectedSize === variant.size"
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
<style scoped>.quick-selected-price { display:flex; flex-wrap:wrap; align-items:baseline; gap:10px; border-block:1px solid #d9e2dd; padding:14px 0; }.quick-selected-price strong { font-size:32px; color:var(--storefront-brand-4); font-variant-numeric:tabular-nums; }.quick-selected-price span { color:#62726b; font-size:12px; }</style>
