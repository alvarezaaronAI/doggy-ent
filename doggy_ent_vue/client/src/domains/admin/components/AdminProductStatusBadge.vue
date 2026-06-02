<script setup>
import {
  PRODUCT_STATUS_CLASSES,
} from '../constants/adminProducts.constants'

defineProps({
  status: {
    type: String,
    default: '',
  },
})

function getProductStatusClass(status) {
  return PRODUCT_STATUS_CLASSES[status]
    || PRODUCT_STATUS_CLASSES.draft
}
</script>

<template>
  <span class="rounded-full px-3 py-1 text-xs font-semibold" :class="getProductStatusClass(status)">
    {{ status }}
  </span>
</template>
