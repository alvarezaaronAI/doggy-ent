<script setup>
import { computed } from 'vue'
import {
  getProductVariant,
} from '../mappers/adminProductForm.mapper'

const props = defineProps({
  formatPrice: {
    type: Function,
    required: true,
  },
  product: {
    type: Object,
    required: true,
  },
  size: {
    type: String,
    required: true,
  },
})

const variant = computed(() =>
  getProductVariant(props.product, props.size),
)
</script>

<template>
  <div>
    <p class="font-semibold">{{ formatPrice(variant?.price) }}</p>
    <p class="mt-1 text-xs text-stone-400">Qty: {{ variant?.quantity ?? 0 }}</p>
    <p class="mt-1 text-xs text-stone-400">{{ variant?.stockStatus || '—' }}</p>
  </div>
</template>
