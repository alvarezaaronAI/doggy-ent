<template>
  <AccountShell
    title="Orders"
    subtitle="Linked account orders and verified-email guest order matches."
  >
    <div v-if="loading" class="rounded-xl border border-stone-200 bg-white p-6 text-sm text-stone-500">
      Loading orders...
    </div>

    <div v-else-if="orders.length" class="grid gap-4">
      <AccountOrderCard
        v-for="item in orders"
        :key="item.customerReference || item.orderNumber"
        :order="item"
      />
    </div>

    <div v-else class="rounded-xl border border-stone-200 bg-white p-6 text-sm text-stone-500">
      No orders are linked to this account yet.
    </div>

    <p v-if="error" class="mt-5 text-sm font-semibold text-red-600">
      {{ error }}
    </p>
  </AccountShell>
</template>

<script setup>
import { onMounted } from 'vue'
import AccountShell from '../components/AccountShell.vue'
import AccountOrderCard from '../components/AccountOrderCard.vue'
import {
  useAccountOrders,
} from '../composables/useAccountOrders.js'

const {
  error,
  loadOrders,
  loading,
  orders,
} = useAccountOrders()

onMounted(loadOrders)
</script>
