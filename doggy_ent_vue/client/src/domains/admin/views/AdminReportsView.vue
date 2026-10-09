<script setup>
import { computed, onMounted } from 'vue'
import AdminPageHeader from '../components/AdminPageHeader.vue'
import AdminIcon from '../components/AdminIcon.vue'
import AdminMetrics from '../components/AdminMetrics.vue'
import { useAdminOverview } from '../composables/useAdminOverview'
import { formatCurrency } from '@shared/utils/currency'
const { activity, errors, loading, load } = useAdminOverview()
const metrics = computed(() => [
  {
    label: 'Order value',
    value: activity.value.stats
      ? formatCurrency(activity.value.stats.totalRevenue)
      : 'Unavailable',
    hint: 'All stored orders, including pending',
  },
  {
    label: 'Donations generated',
    value: activity.value.stats
      ? formatCurrency(activity.value.stats.totalDonationGenerated)
      : 'Unavailable',
    hint: 'Order attribution, not paid-out donations',
  },
  {
    label: 'Orders',
    value: activity.value.stats?.totalOrders ?? 'Unavailable',
  },
  {
    label: 'Customer accounts',
    value: activity.value.customers?.length ?? 'Unavailable',
  },
])
onMounted(load)
</script>
<template>
  <section class="admin-page">
    <AdminPageHeader title="Reports" eyebrow="Business overview"
      ><button
        class="admin-icon-button"
        title="Refresh reports"
        aria-label="Refresh reports"
        :disabled="loading"
        @click="load"
      >
        <AdminIcon name="refresh" /></button
    ></AdminPageHeader>
    <p
      v-for="error in errors"
      :key="error"
      class="admin-alert admin-error"
      role="alert"
    >
      {{ error }}
    </p>
    <p class="admin-muted">All-time operational totals</p>
    <AdminMetrics :loading="loading" :items="metrics" />
    <div class="grid gap-8 lg:grid-cols-2">
      <section class="admin-form-section">
        <h2>Order operations</h2>
        <dl class="mt-4 space-y-4">
          <div
            v-for="row in [
              { label: 'Pending orders', key: 'pendingOrders' },
              { label: 'Paid orders', key: 'paidOrders' },
              { label: 'Delivered orders', key: 'fulfilledOrders' },
            ]"
            :key="row.key"
            class="admin-row"
          >
            <dt class="admin-muted">{{ row.label }}</dt>
            <dd>{{ activity.stats?.[row.key] ?? 'Unavailable' }}</dd>
          </div>
        </dl>
        <RouterLink class="admin-link mt-6" to="/admin/orders"
          >Review orders <AdminIcon name="next"
        /></RouterLink>
      </section>
      <section class="admin-form-section">
        <h2>Delivery health</h2>
        <dl class="mt-4 space-y-4">
          <div class="admin-row">
            <dt class="admin-muted">Failed email records</dt>
            <dd>{{ activity.notifications?.failed ?? 'Unavailable' }}</dd>
          </div>
          <div class="admin-row">
            <dt class="admin-muted">Mocked email records</dt>
            <dd>{{ activity.notifications?.mocked ?? 'Unavailable' }}</dd>
          </div>
          <div class="admin-row">
            <dt class="admin-muted">Tracking records needing review</dt>
            <dd>{{ activity.shipments?.failed ?? 'Unavailable' }}</dd>
          </div>
        </dl>
        <div class="flex flex-wrap gap-5 mt-6">
          <RouterLink class="admin-link" to="/admin/notifications"
            >Email activity <AdminIcon name="next" /></RouterLink
          ><RouterLink class="admin-link" to="/admin/shipments"
            >Shipments <AdminIcon name="next"
          /></RouterLink>
        </div>
      </section>
    </div>
    <section class="admin-form-section mt-8">
      <h2>Reporting roadmap</h2>
      <p class="admin-muted mt-3">
        Date ranges, settled-payment revenue, charts, and exports are coming in
        a future phase.
      </p>
    </section>
  </section>
</template>
