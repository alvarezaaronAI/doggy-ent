

<script setup>
import { formatPromoType } from '../utils/promo.utils'

const props = defineProps({
  type: {
    type: String,
    required: true,
  },
})
</script>

<template>
  <span
    class="inline-flex items-center rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold text-stone-700"
  >
    {{ formatPromoType(props.type) }}
  </span>
</template>