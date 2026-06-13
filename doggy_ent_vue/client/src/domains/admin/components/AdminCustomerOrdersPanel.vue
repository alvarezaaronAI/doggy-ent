<template>
  <section class="rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
    <h2 class="text-lg font-bold text-stone-900">
      {{ title }}
    </h2>

    <div v-if="orders.length" class="mt-4 divide-y divide-stone-100">
      <RouterLink
        v-for="order in orders"
        :key="order.id || order.orderNumber"
        :to="`/admin/orders/${order.id}`"
        class="flex items-center justify-between gap-4 py-3 text-sm transition hover:text-emerald-700"
      >
        <div>
          <p class="font-bold">{{ order.orderNumber || order.customerReference }}</p>
          <p class="text-xs text-stone-500">{{ order.customerEmail }} · {{ order.status }}</p>
        </div>

        <p class="font-bold">
          {{ formatCurrency(order.total) }}
        </p>
      </RouterLink>
    </div>

    <p v-else class="mt-4 text-sm text-stone-500">
      No orders found.
    </p>
  </section>
</template>

<script setup>
import {
  formatCurrency,
} from '@shared/utils/currency'

defineProps({
  orders: {
    type: Array,
    default: () => [],
  },
  title: {
    type: String,
    required: true,
  },
})
</script>
