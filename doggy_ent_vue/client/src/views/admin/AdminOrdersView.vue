<template>
  <main class="min-h-screen bg-[var(--brand-5)] text-slate-900">
    <section class="mx-auto max-w-7xl px-6 py-10 md:py-14">
      <div class="section-panel p-8 md:p-10">
        <p class="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-400">Admin / Operations</p>
        <h1 class="mt-2 text-4xl font-extrabold">Orders</h1>

        <div class="mt-6 grid gap-4 md:grid-cols-4">
          <article class="rounded-2xl border border-[var(--brand-3)] bg-white p-5 shadow-sm">
            <p class="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">Total orders</p>
            <p class="mt-2 text-3xl font-extrabold text-[var(--brand-4)]">{{ stats.totalOrders }}</p>
          </article>

          <article class="rounded-2xl border border-[var(--brand-3)] bg-white p-5 shadow-sm">
            <p class="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">Pending</p>
            <p class="mt-2 text-3xl font-extrabold text-[var(--brand-4)]">{{ stats.pendingOrders }}</p>
          </article>

          <article class="rounded-2xl border border-[var(--brand-3)] bg-white p-5 shadow-sm">
            <p class="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">Revenue</p>
            <p class="mt-2 text-3xl font-extrabold text-[var(--brand-4)]">{{ formatPrice(stats.totalRevenue) }}</p>
          </article>

          <article class="rounded-2xl border border-[var(--brand-3)] bg-white p-5 shadow-sm">
            <p class="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">Donations</p>
            <p class="mt-2 text-3xl font-extrabold text-[var(--success-1)]">{{ formatPrice(stats.totalDonationGenerated) }}</p>
          </article>
        </div>

        <div class="mt-6 grid gap-4">
          <RouterLink
            v-for="order in orders"
            :key="order.id"
            :to="`/admin/orders/${order.id}`"
            class="tile block rounded-2xl p-5 transition hover:-translate-y-0.5 hover:shadow-lg"
          >
            <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p class="font-semibold text-[var(--brand-4)]">{{ order.id }}</p>
                <p class="mt-1 text-sm text-stone-300">
                  {{ order.customer.firstName }} {{ order.customer.lastName }} · {{ order.customer.email }}
                </p>
                <p class="mt-1 text-xs text-stone-400">
                  Total: {{ formatPrice(order.pricing.total) }} · Donation: {{ formatPrice(order.pricing.donationAmount) }}
                </p>
              </div>

              <div class="flex flex-col items-end gap-1">
                <p class="text-xs text-stone-400">
                  {{ formatDate(order.createdAt) }}
                </p>

                <span
                  class="rounded-full px-3 py-1 text-xs font-semibold"
                  :class="statusClass(order.status)"
                >
                  {{ order.status }}
                </span>

                <span
                  class="rounded-full px-3 py-1 text-xs font-semibold"
                  :class="paymentClass(order.paymentStatus)"
                >
                  {{ order.paymentStatus }}
                </span>

                <span
                  class="rounded-full px-3 py-1 text-xs font-semibold"
                  :class="fulfillmentClass(order.fulfillmentStatus)"
                >
                  {{ order.fulfillmentStatus }}
                </span>
              </div>
            </div>
          </RouterLink>

          <p v-if="!orders.length && !loading" class="text-sm text-stone-400">No orders yet.</p>
          <p v-if="loading" class="text-sm text-stone-400">Loading orders...</p>
        </div>

        <div class="mt-8 flex flex-wrap gap-3">
          <RouterLink to="/admin" class="rounded-lg border border-stone-700 px-4 py-2 text-sm font-semibold text-stone-700 transition hover:bg-white">
            Back to Dashboard
          </RouterLink>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup>
import { onMounted, ref } from 'vue'

const orders = ref([])
const loading = ref(false)

const stats = ref({
  totalOrders: 0,
  pendingOrders: 0,
  paidOrders: 0,
  fulfilledOrders: 0,
  totalRevenue: 0,
  totalDonationGenerated: 0,
})

function formatPrice(v) {
  const n = Number(v || 0)
  return n.toLocaleString(undefined, { style: 'currency', currency: 'USD' })
}

function formatDate(value) {
  if (!value) return 'N/A'
  return new Date(value).toLocaleString()
}

function statusClass(status) {
  if (status === 'pending') return 'bg-amber-100 text-amber-700'
  if (status === 'paid') return 'bg-[color:var(--success-1)]/15 text-[color:var(--success-1)]'
  if (status === 'fulfilled') return 'bg-blue-100 text-blue-700'
  return 'bg-stone-200 text-stone-700'
}

function paymentClass(status) {
  if (status === 'paid') return 'bg-green-100 text-green-700'
  if (status === 'not_paid') return 'bg-red-100 text-red-700'
  return 'bg-stone-200 text-stone-700'
}

function fulfillmentClass(status) {
  if (status === 'fulfilled') return 'bg-blue-100 text-blue-700'
  if (status === 'unfulfilled') return 'bg-amber-100 text-amber-700'
  return 'bg-stone-200 text-stone-700'
}

async function loadOrders() {
  loading.value = true
  try {
    const res = await fetch('/api/admin/orders')
    const data = await res.json()
    if (res.ok && data.success) {
      orders.value = data.orders || []
    }
  } catch (e) {
    // noop for now
  } finally {
    loading.value = false
  }
}


async function loadStats() {
  const res = await fetch('/api/admin/orders/stats')
  const data = await res.json()

  if (res.ok && data.success) {
    stats.value = data.stats || stats.value
  }
}

onMounted(async () => {
  await Promise.all([loadOrders(), loadStats()])
})
</script>
