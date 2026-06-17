<template>
  <main class="min-h-screen bg-[var(--brand-5)] text-slate-900">
    <section class="mx-auto max-w-7xl px-6 py-10 md:py-14">
      <div class="section-panel p-8 md:p-10">
        <div class="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p class="text-sm font-semibold uppercase tracking-[0.2em] text-stone-400">
              Admin Shipments
            </p>
            <h1 class="mt-3 text-4xl font-bold tracking-tight">Shipment Overview</h1>
            <p class="mt-3 max-w-2xl text-stone-300">
              Review tracking records, delivery states, and shipment timelines without crowding the dashboard.
            </p>
          </div>

          <RouterLink
            to="/admin"
            class="inline-flex rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-[var(--brand-4)] transition hover:border-emerald-400"
          >
            Back to Dashboard
          </RouterLink>
        </div>

        <section class="mt-8 grid gap-4 md:grid-cols-4">
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
          </div>
        </section>

        <section class="mt-6 rounded-2xl border border-[var(--brand-3)] bg-white p-5 shadow-sm">
          <div class="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
            <label class="block">
              <span class="text-xs font-bold uppercase tracking-[0.14em] text-stone-400">
                Shipment status
              </span>
              <select
                v-model="filters.status"
                class="mt-2 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
              >
                <option value="">All shipments</option>
                <option value="SHIPPED">Shipped</option>
                <option value="TRANSIT">In transit</option>
                <option value="OUT_FOR_DELIVERY">Out for delivery</option>
                <option value="DELIVERED">Delivered</option>
                <option value="UNKNOWN">Unknown</option>
              </select>
            </label>

            <button
              type="button"
              class="rounded-lg bg-emerald-400 px-4 py-2 text-sm font-black text-[var(--brand-4)] transition hover:bg-emerald-300"
              @click="loadShipments"
            >
              Refresh
            </button>
          </div>
        </section>

        <section class="mt-6 rounded-2xl border border-[var(--brand-3)] bg-white p-5 shadow-sm">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <h2 class="text-xl font-extrabold text-[var(--brand-4)]">
              Tracking records
            </h2>
            <p class="text-sm font-semibold text-stone-400">
              Shippo tracking: {{ shipments.providerConfigured ? 'Configured' : 'Not configured' }}
            </p>
          </div>

          <div v-if="isLoading" class="mt-6 text-sm text-stone-400">
            Loading shipments...
          </div>

          <div v-else-if="recentShipments.length" class="mt-5 grid gap-4">
            <article
              v-for="shipment in recentShipments"
              :key="shipment.id"
              class="rounded-2xl border border-[var(--brand-3)] bg-[var(--brand-5)] p-4"
            >
              <div class="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <p class="text-xs font-black uppercase tracking-[0.14em] text-stone-400">
                    {{ shipment.carrier }} · {{ shipment.trackingNumber }}
                  </p>
                  <h3 class="mt-1 text-lg font-black text-[var(--brand-4)]">
                    {{ shipment.order?.orderNumber || shipment.orderId }}
                  </h3>
                  <p class="mt-1 text-sm text-stone-500">
                    {{ shipment.order?.customerName || 'Customer' }} · {{ shipment.order?.customerEmail || 'No email' }}
                  </p>
                </div>

                <div class="flex flex-wrap gap-2">
                  <span class="rounded-full bg-white px-3 py-1 text-xs font-black uppercase text-stone-500">
                    {{ shipment.shipmentStatus }}
                  </span>
                  <RouterLink
                    v-if="shipment.order?.id"
                    :to="`/admin/orders/${shipment.order.id}`"
                    class="rounded-full bg-emerald-400 px-3 py-1 text-xs font-black text-[var(--brand-4)]"
                  >
                    Open order
                  </RouterLink>
                </div>
              </div>

              <div class="mt-4 grid gap-3 text-sm md:grid-cols-3">
                <p><span class="font-bold text-stone-400">Last sync:</span> {{ formatDateTime(shipment.lastSyncedAt) }}</p>
                <p><span class="font-bold text-stone-400">ETA:</span> {{ formatDate(shipment.estimatedDelivery) }}</p>
                <p><span class="font-bold text-stone-400">Delivered:</span> {{ formatDate(shipment.deliveredAt) }}</p>
              </div>

              <div v-if="shipment.events?.length" class="mt-4 border-t border-[var(--brand-3)] pt-4">
                <p class="text-xs font-black uppercase tracking-[0.14em] text-stone-400">
                  Timeline
                </p>
                <ol class="mt-3 space-y-2 text-sm text-stone-500">
                  <li
                    v-for="event in shipment.events.slice(0, 4)"
                    :key="event.id"
                  >
                    <span class="font-black text-[var(--brand-4)]">{{ event.status }}</span>
                    <span v-if="event.location"> · {{ event.location }}</span>
                    <span> · {{ formatDateTime(event.occurredAt) }}</span>
                  </li>
                </ol>
              </div>
            </article>
          </div>

          <p v-else class="mt-6 text-sm text-stone-400">
            No shipment tracking records match the current filters.
          </p>
        </section>
      </div>
    </section>
  </main>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { RouterLink } from 'vue-router'
import {
  fetchAdminShipments,
} from '../api/adminShipments.api.js'

const isLoading = ref(false)
const shipments = ref({
  providerConfigured: false,
  total: 0,
  shipped: 0,
  delivered: 0,
  failed: 0,
  recent: [],
})
const filters = reactive({
  status: '',
})

const recentShipments = computed(() => shipments.value.recent || [])
const metrics = computed(() => [
  { label: 'Tracking Records', value: shipments.value.total || 0 },
  { label: 'Shipped', value: shipments.value.shipped || 0 },
  { label: 'Delivered', value: shipments.value.delivered || 0 },
  { label: 'Needs Review', value: shipments.value.failed || 0 },
])

function formatDate(value) {
  if (!value) return 'N/A'
  return new Date(value).toLocaleDateString()
}

function formatDateTime(value) {
  if (!value) return 'N/A'
  return new Date(value).toLocaleString()
}

async function loadShipments() {
  isLoading.value = true

  try {
    shipments.value = await fetchAdminShipments({
      status: filters.status,
      limit: 100,
    })
  }
  finally {
    isLoading.value = false
  }
}

onMounted(loadShipments)
</script>
