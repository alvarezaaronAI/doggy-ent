<script setup>
const props = defineProps({
  product: {
    type: Object,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  stockLabel: {
    type: String,
    required: true,
  },
  isPurchasable: {
    type: Boolean,
    required: true,
  },
  formatPrice: {
    type: Function,
    required: true,
  },
})
</script>

<template>
  <div
    class="mt-4 flex flex-wrap items-end justify-between gap-3"
    aria-live="polite"
  >
    <p class="text-xl font-bold text-[var(--brand-4)]">
      {{ props.formatPrice(props.price) }}
    </p>

    <p
      class="text-xs font-semibold"
      :class="
        props.isPurchasable ? 'text-[color:var(--success-1)]' : 'text-amber-700'
      "
    >
      {{ props.stockLabel }}
    </p>
  </div>
</template>
