<script setup>
import {
  ORDER_TIMELINE_STEPS,
} from '../constants/adminOrders.constants'
import {
  getOrderAgeLabel,
  getTimelineStepClass,
} from '../utils/adminOrders.utils'

defineProps({
  order: {
    type: Object,
    required: true,
  },
})
</script>

<template>
  <div class="mt-4 rounded-2xl border border-white/70 bg-white/60 p-3">
    <div class="mb-3 flex flex-wrap items-center justify-between gap-2">
      <p class="text-xs font-bold uppercase tracking-[0.14em] text-stone-400">Fulfillment timeline</p>
      <p class="text-xs font-semibold text-stone-500">{{ getOrderAgeLabel(order.createdAt) }}</p>
    </div>

    <div class="grid gap-2 sm:grid-cols-4">
      <span
        v-for="step in ORDER_TIMELINE_STEPS"
        :key="step.key"
        class="rounded-xl border px-3 py-2 text-center text-xs font-bold"
        :class="getTimelineStepClass(order, step.key)"
      >
        {{ step.label }}
      </span>
    </div>
  </div>
</template>
