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
  <div class="mt-3 flex items-end justify-between gap-3">
    <p class="text-lg font-extrabold text-[var(--brand-4)]">
      {{ props.formatPrice(props.price) }}
    </p>

    <p
      class="text-xs font-bold uppercase tracking-[0.12em]"
      :class="props.isPurchasable
        ? 'text-[color:var(--success-1)]'
        : 'text-amber-700'"
    >
      {{ props.stockLabel }}
    </p>
  </div>
</template>
