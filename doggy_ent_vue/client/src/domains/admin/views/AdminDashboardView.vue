<template>
  <main class="min-h-screen bg-[var(--brand-5)] text-slate-900">
    <section class="mx-auto max-w-7xl px-6 py-10 md:py-14">
      <div class="section-panel p-8 md:p-10">
        <div class="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <div class="mb-3 flex flex-wrap items-center gap-3">
              <p class="text-sm font-semibold uppercase tracking-[0.2em] text-stone-400">
                Admin CMS
              </p>

              <AdminDataTargetBadge />
            </div>

            <h1 class="text-4xl font-bold tracking-tight">Admin Dashboard</h1>

            <p class="mt-3 max-w-2xl text-stone-300">
              Manage products, orders, promos, and donation campaigns from one protected admin area.
            </p>

            <p v-if="admin" class="mt-3 text-sm text-stone-400">
              Signed in as <span class="font-semibold text-emerald-300">{{ admin.email }}</span>
            </p>
          </div>

          <button
            class="rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
            @click="logout"
          >
            Logout
          </button>
        </div>

        <div class="mt-10 grid gap-4 md:grid-cols-4 lg:grid-cols-8">
          <RouterLink
            to="/admin/products"
            class="rounded-2xl border border-[var(--brand-3)] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-400 hover:shadow-md"
          >
            <h2 class="text-lg font-extrabold text-[var(--brand-4)]">Products</h2>
            <p class="mt-2 text-sm text-stone-400">Manage listings, pricing, and product status.</p>
          </RouterLink>

          <RouterLink
            to="/admin/orders"
            class="rounded-2xl border border-[var(--brand-3)] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-400 hover:shadow-md"
          >
            <h2 class="text-lg font-extrabold text-[var(--brand-4)]">Orders</h2>
            <p class="mt-2 text-sm text-stone-400">Review incoming orders and fulfillment flow.</p>
          </RouterLink>

          <RouterLink
            to="/admin/promos"
            class="rounded-2xl border border-[var(--brand-3)] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-400 hover:shadow-md"
          >
            <h2 class="text-lg font-extrabold text-[var(--brand-4)]">Promos</h2>
            <p class="mt-2 text-sm text-stone-400">Handle coupon codes, offers, and campaigns.</p>
          </RouterLink>
          <RouterLink
            to="/admin/campaigns"
            class="rounded-2xl border border-[var(--brand-3)] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-400 hover:shadow-md"
          >
            <h2 class="text-lg font-extrabold text-[var(--brand-4)]">Campaigns</h2>
            <p class="mt-2 text-sm text-stone-400">Manage shelter donation campaigns and product impact tracking.</p>
          </RouterLink>

          <RouterLink
            to="/admin/customers"
            class="rounded-2xl border border-[var(--brand-3)] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-400 hover:shadow-md"
          >
            <h2 class="text-lg font-extrabold text-[var(--brand-4)]">Customers</h2>
            <p class="mt-2 text-sm text-stone-400">Review accounts, order links, and readiness workflows.</p>
          </RouterLink>

          <RouterLink
            to="/admin/notifications"
            class="rounded-2xl border border-[var(--brand-3)] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-400 hover:shadow-md"
          >
            <h2 class="text-lg font-extrabold text-[var(--brand-4)]">Notifications</h2>
            <p class="mt-2 text-sm text-stone-400">Review email delivery history and provider status.</p>
          </RouterLink>

          <RouterLink
            to="/admin/shipments"
            class="rounded-2xl border border-[var(--brand-3)] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-400 hover:shadow-md"
          >
            <h2 class="text-lg font-extrabold text-[var(--brand-4)]">Shipments</h2>
            <p class="mt-2 text-sm text-stone-400">Review tracking, delivery timelines, and refresh tools.</p>
          </RouterLink>

          <RouterLink
            to="/admin/reports"
            class="rounded-2xl border border-[var(--brand-3)] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-400 hover:shadow-md"
          >
            <h2 class="text-lg font-extrabold text-[var(--brand-4)]">Reports</h2>
            <p class="mt-2 text-sm text-stone-400">See compact revenue, orders, customer, and ops totals.</p>
          </RouterLink>
        </div>

        <section class="mt-10 grid gap-4 md:grid-cols-3 lg:grid-cols-6">
          <div
            v-for="metric in dashboardMetrics"
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

        <div class="mt-10">
          <RouterLink
            to="/"
            class="inline-flex rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-[var(--brand-4)] transition hover:border-emerald-400"
          >
            Back to Home
          </RouterLink>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import AdminDataTargetBadge from '../components/AdminDataTargetBadge.vue'
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
  fetchApi,
  parseJsonResponse,
} from '@shared/api/http.js'

const router = useRouter()
const admin = ref(null)
const customers = ref([])
const notifications = ref({
  total: 0,
  sent: 0,
  failed: 0,
  mocked: 0,
  pending: 0,
  recent: [],
})
const orderStats = ref({})

const dashboardMetrics = computed(() => [
  {
    label: 'Orders',
    value: orderStats.value.totalOrders || 0,
    hint: `${orderStats.value.pendingOrders || 0} pending`,
  },
  {
    label: 'Customers',
    value: customers.value.length,
    hint: 'Account records',
  },
  {
    label: 'Revenue',
    value: formatCurrency(orderStats.value.totalRevenue),
    hint: 'All orders',
  },
  {
    label: 'Notifications',
    value: notifications.value.total || 0,
    hint: `${notifications.value.failed || 0} failed`,
  },
  {
    label: 'Shipments',
    value: orderStats.value.shippedOrders || 0,
    hint: 'Marked shipped',
  },
  {
    label: 'Delivered',
    value: orderStats.value.deliveredOrders || 0,
    hint: 'Fulfilled',
  },
])

function formatCurrency(value) {
  return Number(value || 0).toLocaleString(undefined, {
    style: 'currency',
    currency: 'USD',
  })
}

async function loadAdminSession() {
  try {
    const response = await fetchApi('/api/auth/me')

    const data = await parseJsonResponse(
      response,
      'Unable to validate admin session.',
    )

    if (response.ok && data.authenticated) {
      admin.value = data.admin
    }
  } catch {
    admin.value = null
  }
}

async function loadDashboardActivity() {
  const [statsResult, customersResult, notificationsResult] =
    await Promise.allSettled([
      fetchAdminOrderStats(),
      fetchAdminCustomers(),
      fetchAdminNotifications(),
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
    notifications.value = notificationsResult.value || notifications.value
  }
}

async function logout() {
  try {
    await fetchApi('/api/auth/logout', {
      method: 'POST',
    })
  } finally {
    admin.value = null
    router.push('/admin/login')
  }
}

onMounted(() => {
  loadAdminSession()
  loadDashboardActivity()
})
</script>
