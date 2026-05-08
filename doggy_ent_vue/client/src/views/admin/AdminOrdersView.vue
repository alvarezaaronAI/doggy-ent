<template>
  <main class="min-h-screen bg-[var(--brand-5)] text-slate-900">
    <section class="mx-auto max-w-7xl px-6 py-10 md:py-14">
      <div class="section-panel p-8 md:p-10">
        <div class="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p class="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-400">Admin / Operations</p>
            <h1 class="mt-2 text-4xl font-extrabold">Orders</h1>
          </div>

          <RouterLink
            to="/admin"
            class="rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm font-bold text-[var(--brand-4)] transition hover:border-emerald-400 hover:bg-emerald-50"
          >
            ← Back to Dashboard
          </RouterLink>
        </div>

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

        <div class="mt-6 rounded-2xl border border-[var(--brand-3)] bg-white p-5 shadow-sm">
          <div class="grid gap-3 lg:grid-cols-[1.4fr_0.8fr_auto] lg:items-end">
            <label class="block">
              <span class="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-stone-400">Search orders</span>
              <input
                v-model="orderSearchQuery"
                class="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 outline-none focus:border-emerald-400"
                placeholder="Search order ID, customer, email, phone, city..."
              />
            </label>

            <label class="block">
              <span class="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-stone-400">Status</span>
              <select
                v-model="orderStatusFilter"
                class="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 outline-none focus:border-emerald-400"
              >
                <option value="all">All statuses</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="cancelled">Cancelled</option>
                <option value="not_paid">Not paid</option>
                <option value="paid">Paid</option>
                <option value="refunded">Refunded</option>
                <option value="unfulfilled">Unfulfilled</option>
                <option value="packed">Packed</option>
                <option value="shipped">Shipped</option>
                <option value="fulfilled">Fulfilled</option>
              </select>
            </label>

            <button
              type="button"
              class="rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm font-bold text-[var(--brand-4)] transition hover:border-emerald-400 hover:bg-emerald-50"
              @click="clearOrderFilters"
            >
              Clear
            </button>
          </div>

          <p class="mt-3 text-xs font-semibold text-stone-400">
            Showing {{ filteredOrders.length }} of {{ orders.length }} orders.
          </p>
        </div>

        <div class="sticky top-0 z-10 mt-6 rounded-2xl border border-[var(--brand-3)] bg-white/95 p-3 shadow-sm backdrop-blur">
          <div class="grid gap-3 md:grid-cols-4">
            <a href="#needs-attention" class="rounded-xl border border-red-100 bg-red-50 px-4 py-3 transition hover:border-red-200">
              <p class="text-xs font-semibold uppercase tracking-[0.14em] text-red-400">Needs attention</p>
              <p class="mt-1 text-2xl font-extrabold text-red-700">{{ needsAttentionOrders.length }}</p>
            </a>

            <a href="#ready-to-fulfill" class="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 transition hover:border-emerald-200">
              <p class="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-500">Ready</p>
              <p class="mt-1 text-2xl font-extrabold text-emerald-700">{{ readyToFulfillOrders.length }}</p>
            </a>

            <a href="#fulfilled" class="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 transition hover:border-blue-200">
              <p class="text-xs font-semibold uppercase tracking-[0.14em] text-blue-400">Fulfilled</p>
              <p class="mt-1 text-2xl font-extrabold text-blue-700">{{ fulfilledOrders.length }}</p>
            </a>

            <a href="#cancelled" class="rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 transition hover:border-stone-300">
              <p class="text-xs font-semibold uppercase tracking-[0.14em] text-stone-400">Cancelled</p>
              <p class="mt-1 text-2xl font-extrabold text-stone-700">{{ cancelledOrders.length }}</p>
            </a>
          </div>
        </div>

        <div class="mt-8 space-y-10">
          <section v-for="group in orderGroups" :id="group.key" :key="group.key">
            <div class="mb-4 flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 class="text-2xl font-extrabold text-[var(--brand-4)]">{{ group.title }}</h2>
                <p class="mt-1 text-sm text-stone-400">{{ group.description }}</p>
              </div>
              <span class="rounded-full bg-white px-3 py-1 text-xs font-bold text-stone-500 shadow-sm">
                {{ group.countLabel }}
              </span>
            </div>

            <div v-if="loading" class="rounded-2xl border border-stone-200 bg-white p-5 text-sm text-stone-400">
              Loading orders...
            </div>

            <div v-else-if="!group.orders.length" class="rounded-2xl border border-stone-200 bg-white/70 p-5 text-sm text-stone-400">
              No orders in this section.
            </div>

            <div v-else class="grid gap-4">
              <RouterLink
                v-for="order in group.orders"
                :key="order.id"
                :to="`/admin/orders/${order.id}`"
                class="block rounded-2xl border p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
                :class="getOrderCardClass(order)"
              >
                <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div class="min-w-0 flex-1">
                    <div class="flex flex-wrap items-center gap-2">
                      <p class="font-extrabold text-[var(--brand-4)]">{{ order.id }}</p>

                      <span
                        class="rounded-full px-2.5 py-1 text-xs font-bold"
                        :class="getOrderValueTier(order).className"
                      >
                        {{ getOrderValueTier(order).label }}
                      </span>

                      <span
                        v-for="label in getPriorityLabels(order)"
                        :key="label.text"
                        class="rounded-full px-2.5 py-1 text-xs font-bold"
                        :class="label.className"
                      >
                        {{ label.text }}
                      </span>

                      <span
                        class="rounded-full px-2.5 py-1 text-xs font-bold"
                        :class="isFirstTimeCustomer(order) ? 'bg-sky-100 text-sky-700' : 'bg-indigo-100 text-indigo-700'"
                      >
                        {{ isFirstTimeCustomer(order) ? 'First-time customer' : 'Repeat customer' }}
                      </span>
                    </div>

                    <p class="mt-2 text-sm text-stone-500">
                      {{ order.customer.firstName }} {{ order.customer.lastName }} · {{ order.customer.email }}
                    </p>
                    <div class="mt-3 flex flex-wrap items-end gap-4">
                      <div>
                        <p class="text-xs font-bold uppercase tracking-[0.14em] text-stone-400">Order total</p>
                        <p class="mt-1 text-2xl font-extrabold" :class="getOrderValueTier(order).amountClassName">
                          {{ formatPrice(order.pricing.total) }}
                        </p>
                      </div>

                      <div>
                        <p class="text-xs font-bold uppercase tracking-[0.14em] text-stone-400">Donation</p>
                        <p class="mt-1 text-sm font-bold text-[var(--success-1)]">
                          {{ formatPrice(order.pricing.donationAmount) }}
                        </p>
                      </div>
                    </div>
                    <div class="mt-4 rounded-2xl border border-white/70 bg-white/60 p-3">
                      <div class="mb-3 flex flex-wrap items-center justify-between gap-2">
                        <p class="text-xs font-bold uppercase tracking-[0.14em] text-stone-400">Fulfillment timeline</p>
                        <p class="text-xs font-semibold text-stone-500">{{ getOrderAgeLabel(order.createdAt) }}</p>
                      </div>

                      <div class="grid gap-2 sm:grid-cols-4">
                        <span class="rounded-xl border px-3 py-2 text-center text-xs font-bold" :class="getTimelineStepClass(order, 'paid')">
                          Paid
                        </span>
                        <span class="rounded-xl border px-3 py-2 text-center text-xs font-bold" :class="getTimelineStepClass(order, 'packed')">
                          Packed
                        </span>
                        <span class="rounded-xl border px-3 py-2 text-center text-xs font-bold" :class="getTimelineStepClass(order, 'shipped')">
                          Shipped
                        </span>
                        <span class="rounded-xl border px-3 py-2 text-center text-xs font-bold" :class="getTimelineStepClass(order, 'fulfilled')">
                          Fulfilled
                        </span>
                      </div>
                    </div>
                  </div>

                  <div class="shrink-0 rounded-2xl border border-white/70 bg-white/70 p-4 sm:min-w-56 sm:text-right">
                    <p class="text-xs font-bold uppercase tracking-[0.14em] text-stone-400">Placed</p>
                    <p class="mt-1 text-base font-extrabold text-[var(--brand-4)]">
                      {{ formatDate(order.createdAt) }}
                    </p>
                    <p class="mt-2 text-xs font-semibold text-stone-500">
                      {{ getOrderAgeLabel(order.createdAt) }}
                    </p>
                  </div>
                </div>
              </RouterLink>
            </div>
          </section>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'

const orders = ref([])
const loading = ref(false)

const orderSearchQuery = ref('')
const orderStatusFilter = ref('all')

const stats = ref({
  totalOrders: 0,
  pendingOrders: 0,
  paidOrders: 0,
  fulfilledOrders: 0,
  totalRevenue: 0,
  totalDonationGenerated: 0,
})

const filteredOrders = computed(() => {
  const query = orderSearchQuery.value.trim().toLowerCase()

  return orders.value.filter((order) => {
    const matchesQuery = !query || [
      order.id,
      order.customer?.firstName,
      order.customer?.lastName,
      order.customer?.email,
      order.customer?.phone,
      order.customer?.city,
      order.customer?.state,
      order.status,
      order.paymentStatus,
      order.fulfillmentStatus,
    ]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(query))

    const matchesStatus = orderStatusFilter.value === 'all'
      || order.status === orderStatusFilter.value
      || order.paymentStatus === orderStatusFilter.value
      || order.fulfillmentStatus === orderStatusFilter.value

    return matchesQuery && matchesStatus
  })
})

const cancelledOrders = computed(() => filteredOrders.value.filter((order) => order.status === 'cancelled'))

const fulfilledOrders = computed(() => filteredOrders.value.filter((order) => (
  order.status !== 'cancelled' && order.fulfillmentStatus === 'fulfilled'
)))

const readyToFulfillOrders = computed(() => filteredOrders.value.filter((order) => (
  order.status !== 'cancelled'
  && order.paymentStatus === 'paid'
  && order.fulfillmentStatus !== 'fulfilled'
)))

const needsAttentionOrders = computed(() => filteredOrders.value.filter((order) => (
  order.status !== 'cancelled'
  && order.fulfillmentStatus !== 'fulfilled'
  && (order.paymentStatus !== 'paid' || order.status === 'pending')
)))

const orderGroups = computed(() => [
  {
    key: 'needs-attention',
    title: 'Needs attention',
    description: 'Orders that need review before fulfillment.',
    countLabel: `${needsAttentionOrders.value.length} need attention`,
    orders: needsAttentionOrders.value,
  },
  {
    key: 'ready-to-fulfill',
    title: 'Ready to fulfill',
    description: 'Paid orders waiting to be packed, shipped, or completed.',
    countLabel: `${readyToFulfillOrders.value.length} ready`,
    orders: readyToFulfillOrders.value,
  },
  {
    key: 'fulfilled',
    title: 'Fulfilled',
    description: 'Completed orders kept here for quick reference.',
    countLabel: `${fulfilledOrders.value.length} fulfilled`,
    orders: fulfilledOrders.value,
  },
  {
    key: 'cancelled',
    title: 'Cancelled',
    description: 'Cancelled orders separated from active operations.',
    countLabel: `${cancelledOrders.value.length} cancelled`,
    orders: cancelledOrders.value,
  },
])

function formatPrice(v) {
  const n = Number(v || 0)
  return n.toLocaleString(undefined, { style: 'currency', currency: 'USD' })
}

function formatDate(value) {
  if (!value) return 'N/A'
  return new Date(value).toLocaleString()
}
function getOrderAgeLabel(value) {
  if (!value) return 'Age unknown'

  const createdAt = new Date(value).getTime()
  const diffMs = Date.now() - createdAt
  const diffMinutes = Math.max(0, Math.floor(diffMs / 60000))
  const diffHours = Math.floor(diffMinutes / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMinutes < 1) return 'Placed just now'
  if (diffMinutes < 60) return `Placed ${diffMinutes}m ago`
  if (diffHours < 24) return `Placed ${diffHours}h ago`
  return `Placed ${diffDays}d ago`
}

function getTimelineStepClass(order, step) {
  const isPaid = order.paymentStatus === 'paid'
  const isPacked = ['packed', 'shipped', 'fulfilled'].includes(order.fulfillmentStatus)
  const isShipped = ['shipped', 'fulfilled'].includes(order.fulfillmentStatus)
  const isFulfilled = order.fulfillmentStatus === 'fulfilled'

  const activeSteps = {
    paid: isPaid,
    packed: isPacked,
    shipped: isShipped,
    fulfilled: isFulfilled,
  }

  return activeSteps[step]
    ? 'border-emerald-300 bg-emerald-100 text-emerald-700'
    : 'border-stone-200 bg-white/70 text-stone-400'
}
function getOrderCardClass(order) {
  if (order.status === 'cancelled') {
    return 'border-stone-300 bg-stone-100/80 opacity-80'
  }

  if (order.paymentStatus !== 'paid') {
    return 'border-red-200 bg-red-50'
  }

  if (order.paymentStatus === 'paid' && order.fulfillmentStatus !== 'fulfilled') {
    return 'border-emerald-200 bg-emerald-50'
  }

  if (order.fulfillmentStatus === 'fulfilled') {
    return 'border-blue-100 bg-white'
  }

  return 'border-stone-200 bg-white'
}

function getPriorityLabels(order) {
  const labels = []

  if (order.status === 'cancelled') {
    labels.push({ text: 'Cancelled', className: 'bg-stone-200 text-stone-700' })
    return labels
  }

  if (order.paymentStatus !== 'paid') {
    labels.push({ text: 'Payment needed', className: 'bg-red-100 text-red-700' })
  }

  if (order.status === 'pending') {
    labels.push({ text: 'Review', className: 'bg-amber-100 text-amber-700' })
  }

  if (order.paymentStatus === 'paid' && order.fulfillmentStatus !== 'fulfilled') {
    labels.push({ text: 'Pack order', className: 'bg-emerald-100 text-emerald-700' })
  }

  if (Number(order.pricing?.donationAmount || 0) > 0) {
    labels.push({ text: 'Donation order', className: 'bg-green-100 text-green-700' })
  }

  // Removed high value label, now handled by getOrderValueTier

  if (order.fulfillmentStatus === 'fulfilled') {
    labels.push({ text: 'Completed', className: 'bg-blue-100 text-blue-700' })
  }

  return labels
}

function clearOrderFilters() {
  orderSearchQuery.value = ''
  orderStatusFilter.value = 'all'
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

function getOrderValueTier(order) {
  const total = Number(order.pricing?.total || 0)

  if (total >= 500) {
    return {
      label: '💎 Gem order',
      className: 'bg-fuchsia-100 text-fuchsia-700',
      amountClassName: 'text-fuchsia-700',
    }
  }

  if (total >= 350) {
    return {
      label: '♦ Diamond order',
      className: 'bg-cyan-100 text-cyan-700',
      amountClassName: 'text-cyan-700',
    }
  }

  if (total >= 200) {
    return {
      label: '✦ Platinum order',
      className: 'bg-slate-200 text-slate-700',
      amountClassName: 'text-slate-700',
    }
  }

  if (total >= 100) {
    return {
      label: '★ Gold order',
      className: 'bg-yellow-100 text-yellow-700',
      amountClassName: 'text-yellow-700',
    }
  }

  return {
    label: 'Standard order',
    className: 'bg-stone-100 text-stone-600',
    amountClassName: 'text-[var(--brand-4)]',
  }
}

function isFirstTimeCustomer(order) {
  const email = String(order.customer?.email || '').trim().toLowerCase()
  const phone = String(order.customer?.phone || '').trim()

  if (!email && !phone) return true

  const matchingOrders = orders.value.filter((candidate) => {
    const candidateEmail = String(candidate.customer?.email || '').trim().toLowerCase()
    const candidatePhone = String(candidate.customer?.phone || '').trim()

    return (email && candidateEmail === email) || (phone && candidatePhone === phone)
  })

  return matchingOrders.length <= 1
}
</script>
