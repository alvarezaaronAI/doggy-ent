

<script setup>
import {
  formatPromoStatus,
  getPromoStatusClass,
} from '../utils/promo.utils'

const props = defineProps({
  status: {
    type: String,
    required: true,
  },
})
</script>

<template>
  <span
    class="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold"
    :class="getPromoStatusClass(props.status)"
  >
    {{ formatPromoStatus(props.status) }}
  </span>
</template>