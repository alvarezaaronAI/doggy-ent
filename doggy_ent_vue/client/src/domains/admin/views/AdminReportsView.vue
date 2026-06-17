<template>
  <main class="min-h-screen bg-[var(--brand-5)] text-slate-900">
    <section class="mx-auto max-w-7xl px-6 py-10 md:py-14">
      <div class="section-panel p-8 md:p-10">
        <div class="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p class="text-sm font-semibold uppercase tracking-[0.2em] text-stone-400">
              Admin Reports
            </p>
            <h1 class="mt-3 text-4xl font-bold tracking-tight">Operations Report</h1>
            <p class="mt-3 max-w-2xl text-stone-300">
              Compact rollups for orders, customers, notifications, shipments, revenue, and donation impact.
            </p>
          </div>

          <RouterLink
            to="/admin"
            class="inline-flex rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-[var(--brand-4)] transition hover:border-emerald-400"
          >
            Back to Dashboard
          </RouterLink>
        </div>

        <section class="mt-8 grid gap-4 md:grid-cols-3 lg:grid-cols-6">
          <div
            v-for="metric in metrics"
            :key="metric.label"
            class="rounded-2xl border border-[var(--brand-3)] bg-white p-5 shadow-sm"
          >
            <p class="text-xs font-bold uppercase tracking-[0.14em] text-stone-400">
              {{ metric.label }}
            </p>
            <p class="mt-2 text-2xl font-black text-[var(--brand-4)]">
              {{ metric.value }}
            </p>
            <p class="mt-1 text-xs font-semibold text-stone-400">
              {{ metric.hint }}
            </p>
          </div>
        </section>

        <section class="mt-6 grid gap-4 lg:grid-cols-3">
          <RouterLink
            v-for="link in reportLinks"
            :key="link.to"
            :to="link.to"
            class="rounded-2xl border border-[var(--brand-3)] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-400 hover:shadow-md"
          >
            <p class="text-lg font-black text-[var(--brand-4)]">{{ link.label }}</p>
            <p class="mt-2 text-sm text-stone-400">{{ link.description }}</p>
          </RouterLink>
        </section>
      </div>
    </section>
  </main>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import {
  fetchAdminCustomers,
} from '../api/adminCustomers.api.js'
import {
  fetchAdminNotifications,
} from '../api/adminNotifications.api.js'
import {
  fetchAdminOrderStats,
} from '../api/adminOrders.api.js'
import {
  fetchAdminShipments,
} from '../api/adminShipments.api.js'

const orderStats = ref({})
const customers = ref([])
const notifications = ref({})
const shipments = ref({})

const reportLinks = [
  {
    to: '/admin/orders',
    label: 'Order dashboard',
    description: 'Open the operational order list and detail workflow.',
  },
  {
    to: '/admin/notifications',
    label: 'Notification history',
    description: 'Audit delivery, failed, mocked, and skipped email activity.',
  },
  {
    to: '/admin/shipments',
    label: 'Shipment tracking',
    description: 'Review tracking records and delivery timeline state.',
  },
]

const metrics = computed(() => [
  {
    label: 'Orders',
    value: orderStats.value.totalOrders || 0,
    hint: `${orderStats.value.pendingOrders || 0} pending`,
  },
  {
    label: 'Revenue',
    value: formatCurrency(orderStats.value.totalRevenue),
    hint: 'All orders',
  },
  {
    label: 'Donations',
    value: formatCurrency(orderStats.value.totalDonationGenerated),
    hint: 'Campaign impact',
  },
  {
    label: 'Customers',
    value: customers.value.length,
    hint: 'Accounts',
  },
  {
    label: 'Notifications',
    value: notifications.value.total || 0,
    hint: `${notifications.value.failed || 0} failed`,
  },
  {
    label: 'Shipments',
    value: shipments.value.total || 0,
    hint: `${shipments.value.delivered || 0} delivered`,
  },
])

function formatCurrency(value) {
  return Number(value || 0).toLocaleString(undefined, {
    style: 'currency',
    currency: 'USD',
  })
}

async function loadReports() {
  const [
    statsResult,
    customersResult,
    notificationsResult,
    shipmentsResult,
  ] = await Promise.allSettled([
    fetchAdminOrderStats(),
    fetchAdminCustomers(),
    fetchAdminNotifications({ limit: 10 }),
    fetchAdminShipments({ limit: 10 }),
  ])

  if (statsResult.status === 'fulfilled') {
    orderStats.value = statsResult.value || {}
  }
  if (customersResult.status === 'fulfilled') {
    customers.value = Array.isArray(customersResult.value)
      ? customersResult.value
      : []
  }
  if (notificationsResult.status === 'fulfilled') {
    notifications.value = notificationsResult.value || {}
  }
  if (shipmentsResult.status === 'fulfilled') {
    shipments.value = shipmentsResult.value || {}
  }
}

onMounted(loadReports)
</script>
