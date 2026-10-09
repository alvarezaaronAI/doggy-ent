<script setup>
import { computed } from 'vue'
import { getOrderValueTier } from '../utils/adminOrders.utils'
const props = defineProps({ order: { type: Object, required: true } })
const tier = computed(() => getOrderValueTier(props.order))
</script>
<template>
  <span
    class="admin-badge admin-value-badge"
    :style="{ '--order-tier-color': tier.color }"
    title="Order value tier, not a customer loyalty level"
    >{{ tier.label }}</span
  >
</template>
