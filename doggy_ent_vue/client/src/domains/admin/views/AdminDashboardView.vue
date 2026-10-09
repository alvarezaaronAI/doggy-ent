<script setup>
import { computed, onMounted } from 'vue'
import AdminPageHeader from '../components/AdminPageHeader.vue'
import AdminIcon from '../components/AdminIcon.vue'
import AdminMetrics from '../components/AdminMetrics.vue'
import { useAdminOverview } from '../composables/useAdminOverview.js'
import { formatCurrency } from '@shared/utils/currency.js'
const { activity, errors, loading, load } = useAdminOverview()
const metrics = computed(() => [
  {
    label: 'Paid orders',
    value: activity.value.stats?.paidOrders ?? 'Unavailable',
    hint: 'Ready for fulfillment review',
  },
  {
    label: 'Open order issues',
    value: activity.value.support?.counts?.open ?? 'Unavailable',
    hint: 'Customer follow-up',
  },
  {
    label: 'Customers',
    value: activity.value.customers?.length ?? 'Unavailable',
    hint: 'Registered accounts',
  },
])
const priorities = computed(() => [
  {
    label: 'Orders awaiting review',
    count: activity.value.stats?.pendingOrders,
    to: '/admin/orders',
    icon: 'orders',
  },
  {
    label: 'Order issues requiring action',
    count: activity.value.support?.counts?.actionRequired,
    to: '/admin/order-issues',
    icon: 'support',
  },
  {
    label: 'Failed email deliveries',
    count: activity.value.notifications?.failed,
    to: '/admin/notifications',
    icon: 'notifications',
  },
  {
    label: 'Severe internal issues',
    count: activity.value.internal?.counts?.severe,
    to: '/admin/internal-issues',
    icon: 'issues',
  },
])
const recentOrders = computed(() =>
  [...(activity.value.orders || [])]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 3),
)
onMounted(load)
</script>
<template>
  <section class="admin-page">
    <AdminPageHeader title="Overview" eyebrow="Your workspace"
      ><button
        type="button"
        class="admin-button"
        :disabled="loading"
        @click="load"
      >
        <AdminIcon name="refresh" />Refresh
      </button></AdminPageHeader
    >
    <p
      v-for="error in errors"
      :key="error"
      role="alert"
      class="admin-alert admin-alert-error"
    >
      {{ error }}
    </p>
    <AdminMetrics :items="metrics" :loading="loading" />
    <h2>Needs attention</h2>
    <RouterLink
      v-for="item in priorities"
      :key="item.to"
      :to="item.to"
      class="admin-row"
      ><AdminIcon :name="item.icon" /><span class="flex-1">{{
        item.label
      }}</span
      ><span class="admin-badge">{{
        loading ? 'Loading' : (item.count ?? 'Unavailable')
      }}</span
      ><AdminIcon name="next"
    /></RouterLink>
    <div class="mt-8 flex items-center justify-between gap-3">
      <h2>Recent orders</h2>
      <RouterLink to="/admin/orders" class="admin-link"
        >All orders<AdminIcon name="next"
      /></RouterLink>
    </div>
    <p v-if="loading" class="admin-state" role="status">Loading orders...</p>
    <template v-else
      ><RouterLink
        v-for="order in recentOrders"
        :key="order.id"
        :to="`/admin/orders/${order.id}`"
        class="admin-row"
        ><span class="flex-1"
          ><strong>{{
            order.customerReference || order.orderNumber || order.id
          }}</strong
          ><span class="admin-muted mt-1 block"
            >{{ order.customerName }} &middot;
            {{ new Date(order.createdAt).toLocaleDateString() }}</span
          ></span
        ><span class="admin-badge">{{ order.status }}</span
        ><strong>{{ formatCurrency(order.total) }}</strong></RouterLink
      ></template
    >
    <p v-if="!loading && !recentOrders.length" class="admin-state">
      {{
        activity.orders
          ? 'No orders yet.'
          : 'Order activity is unavailable. Try Refresh.'
      }}
    </p>
  </section>
</template>
