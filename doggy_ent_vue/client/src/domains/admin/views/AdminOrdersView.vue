<script setup>
import { onMounted } from 'vue'
import AdminPageHeader from '../components/AdminPageHeader.vue'
import AdminMetrics from '../components/AdminMetrics.vue'
import AdminIcon from '../components/AdminIcon.vue'
import AdminOrderValueBadge from '../components/AdminOrderValueBadge.vue'
import { ORDER_STATUSES } from '../constants/adminOrders.constants'
import {
  formatAdminOrderDate,
  formatAdminOrderPrice,
  getOrderValueTier,
} from '../utils/adminOrders.utils'
import { useAdminOrders } from '../composables/useAdminOrders'
const {
  filteredOrders,
  loadPageData,
  loading,
  orderSearchQuery,
  orderStatusFilter,
  orders,
  stats,
  error,
  statsError,
  clearOrderFilters,
  isFirstTimeCustomer,
} = useAdminOrders()
onMounted(loadPageData)
</script>
<template>
  <section class="admin-page">
    <AdminPageHeader title="Orders" eyebrow="Store operations"
      ><button
        class="admin-icon-button"
        title="Refresh orders"
        aria-label="Refresh orders"
        :disabled="loading"
        @click="loadPageData"
      >
        <AdminIcon name="refresh" /></button
    ></AdminPageHeader>
    <div
      v-if="error || statsError"
      class="admin-alert admin-error"
      role="alert"
    >
      {{ error || statsError }}
    </div>
    <AdminMetrics
      :loading="loading"
      :items="[
        {
          label: 'All orders',
          value: statsError ? 'Unavailable' : stats.totalOrders,
        },
        {
          label: 'Pending',
          value: statsError ? 'Unavailable' : stats.pendingOrders,
        },
        { label: 'Paid', value: statsError ? 'Unavailable' : stats.paidOrders },
        {
          label: 'Delivered',
          value: statsError ? 'Unavailable' : stats.fulfilledOrders,
        },
      ]"
    />
    <div class="admin-filters">
      <label class="admin-field grow"
        >Search orders<input
          v-model="orderSearchQuery"
          type="search"
          placeholder="Reference, customer, email, phone or city"
      /></label>
      <label class="admin-field"
        >Status<select aria-label="Status" v-model="orderStatusFilter">
          <option value="all">All statuses</option>
          <option
            v-for="status in Object.values(ORDER_STATUSES)"
            :key="status"
            :value="status"
          >
            {{ status.charAt(0) + status.slice(1).toLowerCase() }}
          </option>
        </select></label
      >
      <button class="admin-link" @click="clearOrderFilters">Clear</button>
    </div>
    <p class="admin-muted my-4">
      {{ filteredOrders.length }} of {{ orders.length }} orders
    </p>
    <p v-if="loading" class="admin-state" role="status">Loading orders...</p>
    <p v-else-if="!filteredOrders.length" class="admin-state">
      {{
        error
          ? 'Orders could not be loaded. Use Refresh to retry.'
          : 'No orders match your filters.'
      }}
    </p>
    <div v-else class="admin-table-wrap">
      <table class="admin-table">
        <thead>
          <tr>
            <th>Order</th>
            <th>Customer</th>
            <th>Status</th>
            <th>Total</th>
            <th>Placed</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="order in filteredOrders"
            :key="order.id"
            class="admin-order-tier"
            :style="{ '--order-tier-color': getOrderValueTier(order).color }"
          >
            <td data-label="Order">
              <RouterLink
                class="admin-link font-semibold"
                :to="'/admin/orders/' + order.id"
                >{{
                  order.customerReference || order.orderNumber || order.id
                }}</RouterLink
              >
            </td>
            <td data-label="Customer">
              {{ order.customerName || 'Guest' }}
              <p class="admin-muted text-xs">{{ order.customerEmail }}</p>
              <p v-if="isFirstTimeCustomer(order)" class="admin-muted text-xs">
                First order on file
              </p>
            </td>
            <td data-label="Status">
              <span
                class="admin-badge"
                :class="{
                  'is-warning': order.status === 'PENDING',
                  'is-success': ['PAID', 'PROCESSING', 'DELIVERED'].includes(
                    order.status,
                  ),
                  'is-info': order.status === 'SHIPPED',
                }"
                >{{ order.status }}</span
              >
            </td>
            <td data-label="Total">
              <p
                class="font-semibold"
                :style="{ color: getOrderValueTier(order).color }"
              >
                {{ formatAdminOrderPrice(order.total) }}
              </p>
              <AdminOrderValueBadge :order="order" class="mt-2" />
            </td>
            <td data-label="Placed">
              {{ formatAdminOrderDate(order.createdAt) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>
