<script setup>
import { onMounted } from 'vue'
import AdminOrdersFilters from '../components/AdminOrdersFilters.vue'
import AdminOrdersGroup from '../components/AdminOrdersGroup.vue'
import AdminOrdersHeader from '../components/AdminOrdersHeader.vue'
import AdminOrdersQuickNav from '../components/AdminOrdersQuickNav.vue'
import AdminOrdersStats from '../components/AdminOrdersStats.vue'
import { useAdminOrders } from '../composables/useAdminOrders'

const {
  cancelledOrders,
  clearOrderFilters,
  filteredOrders,
  fulfilledOrders,
  isFirstTimeCustomer,
  loadPageData,
  loading,
  needsAttentionOrders,
  orderGroups,
  orderSearchQuery,
  orderStatusFilter,
  orders,
  readyToFulfillOrders,
  stats,
} = useAdminOrders()

onMounted(loadPageData)
</script>

<template>
  <main class="min-h-screen bg-[var(--brand-5)] text-slate-900">
    <section class="mx-auto max-w-7xl px-6 py-10 md:py-14">
      <div class="section-panel p-8 md:p-10">
        <AdminOrdersHeader />

        <AdminOrdersStats :stats="stats" />

        <AdminOrdersFilters
          v-model:order-search-query="orderSearchQuery"
          v-model:order-status-filter="orderStatusFilter"
          :filtered-count="filteredOrders.length"
          :order-count="orders.length"
          @clear="clearOrderFilters"
        />

        <AdminOrdersQuickNav
          :cancelled-count="cancelledOrders.length"
          :fulfilled-count="fulfilledOrders.length"
          :needs-attention-count="needsAttentionOrders.length"
          :ready-count="readyToFulfillOrders.length"
        />

        <div class="mt-8 space-y-10">
          <AdminOrdersGroup
            v-for="group in orderGroups"
            :key="group.key"
            :group="group"
            :is-first-time-customer="isFirstTimeCustomer"
            :loading="loading"
          />
        </div>
      </div>
    </section>
  </main>
</template>
