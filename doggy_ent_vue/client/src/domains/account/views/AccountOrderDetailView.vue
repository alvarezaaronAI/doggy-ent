<template>
  <AccountShell
    title="Order detail"
    :subtitle="order?.customerReference || order?.orderNumber || 'Loading order...'"
  >
    <section v-if="order" class="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
      <div class="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <p class="text-sm font-semibold uppercase tracking-[0.16em] text-stone-400">
            {{ order.customerReference || order.orderNumber }}
          </p>
          <h2 class="mt-1 text-3xl font-bold text-stone-900">
            {{ order.status }}
          </h2>
          <p class="mt-1 text-sm text-stone-500">
            Placed {{ formatDate(order.createdAt) }} · Payment {{ order.paymentStatus || 'PENDING' }}
          </p>
        </div>

        <RouterLink
          class="rounded-lg border border-stone-300 px-4 py-2 text-sm font-bold text-stone-700 transition hover:border-emerald-400 hover:text-emerald-700"
          to="/account/orders"
        >
          All orders
        </RouterLink>
      </div>

      <div class="mt-6 grid gap-4 md:grid-cols-2">
        <div class="rounded-xl bg-stone-50 p-4 text-sm">
          <h3 class="font-black text-stone-900">Contact</h3>
          <p class="mt-2 text-stone-600">{{ order.customerName || 'Customer' }}</p>
          <p class="text-stone-600">{{ order.customerEmail }}</p>
          <p v-if="order.customerPhone" class="text-stone-600">{{ order.customerPhone }}</p>
        </div>

        <div class="rounded-xl bg-stone-50 p-4 text-sm">
          <h3 class="font-black text-stone-900">Shipping</h3>
          <p v-if="shippingLines.length" class="mt-2 text-stone-600">
            <span v-for="line in shippingLines" :key="line" class="block">{{ line }}</span>
          </p>
          <p v-else class="mt-2 text-stone-500">Shipping details are unavailable.</p>
          <p v-if="order.deliveryNotes" class="mt-2 text-stone-500">Notes: {{ order.deliveryNotes }}</p>
        </div>
      </div>

      <div class="mt-6 divide-y divide-stone-200 rounded-xl border border-stone-200">
        <div
          v-for="item in order.items"
          :key="item.id || `${item.productName}-${item.size}`"
          class="grid gap-3 p-4 sm:grid-cols-[minmax(0,1fr)_auto_auto_auto] sm:items-center"
        >
          <div>
            <p class="font-bold text-stone-900">{{ item.productName }}</p>
            <p class="text-sm text-stone-500">{{ item.size }}</p>
          </div>

          <p class="text-sm text-stone-500">Qty {{ item.quantity }}</p>
          <p class="text-sm font-semibold text-stone-700">{{ formatCurrency(item.unitPrice) }}</p>
          <p class="font-bold text-stone-900">
            {{ formatCurrency(item.lineTotal) }}
          </p>
        </div>
      </div>

      <div class="mt-6 rounded-xl bg-[color-mix(in_srgb,var(--brand-5)_64%,white)] p-5">
        <div class="space-y-2 text-sm">
          <div class="flex justify-between gap-4">
            <span>Subtotal</span>
            <strong>{{ formatCurrency(order.subtotal) }}</strong>
          </div>
          <div class="flex justify-between gap-4">
            <span>Discount<span v-if="order.promoUsage?.promoCode"> · {{ order.promoUsage.promoCode }}</span></span>
            <strong>-{{ formatCurrency(order.discountAmount) }}</strong>
          </div>
          <div class="flex justify-between gap-4">
            <span>Shipping</span>
            <strong>{{ formatCurrency(order.shippingAmount) }}</strong>
          </div>
          <div class="flex justify-between gap-4">
            <span>Tax</span>
            <strong>{{ formatCurrency(order.taxAmount) }}</strong>
          </div>
          <div class="flex justify-between gap-4">
            <span>Donation impact</span>
            <strong>{{ formatCurrency(order.donationAmount) }}</strong>
          </div>
          <div class="flex justify-between gap-4 border-t border-stone-300 pt-3 text-base">
            <span class="font-black">Total</span>
            <strong>{{ formatCurrency(order.total) }}</strong>
          </div>
        </div>
      </div>

      <section class="mt-6 rounded-xl border border-stone-200 bg-white p-5">
        <div class="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <h3 class="font-black text-stone-900">Tracking</h3>
          <p class="text-sm font-semibold text-stone-500">
            {{ shipment ? shipment.shipmentStatus || 'Tracking added' : 'Coming in future phase: carrier tracking.' }}
          </p>
        </div>

        <div v-if="shipment" class="mt-4 grid gap-3 rounded-xl bg-stone-50 p-4 text-sm sm:grid-cols-2">
          <p><span class="font-semibold text-stone-500">Carrier:</span> {{ shipment.carrier || 'N/A' }}</p>
          <p><span class="font-semibold text-stone-500">Tracking #:</span> {{ shipment.trackingNumber || 'N/A' }}</p>
          <p><span class="font-semibold text-stone-500">Estimated delivery:</span> {{ formatDateTime(shipment.estimatedDelivery) }}</p>
          <p><span class="font-semibold text-stone-500">Last sync:</span> {{ formatDateTime(shipment.lastSyncedAt) }}</p>
          <p v-if="shipment.trackingUrl" class="sm:col-span-2">
            <a
              :href="shipment.trackingUrl"
              target="_blank"
              rel="noreferrer"
              class="font-bold text-emerald-700"
            >
              Track package
            </a>
          </p>
        </div>

        <div v-if="shipmentEvents.length" class="mt-4 space-y-3">
          <div
            v-for="event in shipmentEvents"
            :key="`${event.status}-${event.occurredAt}-${event.message}`"
            class="flex gap-3 rounded-xl bg-stone-50 p-4 text-sm"
          >
            <span class="mt-1 h-3 w-3 flex-shrink-0 rounded-full bg-sky-400"></span>
            <div>
              <p class="font-black text-stone-900">{{ formatStatus(event.status || 'Tracking update') }}</p>
              <p class="mt-1 text-stone-500">{{ formatDateTime(event.occurredAt) }}</p>
              <p v-if="event.message" class="mt-1 text-stone-600">{{ event.message }}</p>
              <p v-if="event.location" class="mt-1 text-stone-500">{{ event.location }}</p>
            </div>
          </div>
        </div>
      </section>

      <section class="mt-6 rounded-xl border border-stone-200 bg-white p-5">
        <div class="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <h3 class="font-black text-stone-900">Order timeline</h3>
          <p class="text-sm font-semibold text-stone-500">
            {{ timelineItems.length ? 'Latest updates first' : 'Coming in future phase: richer tracking updates.' }}
          </p>
        </div>

        <div v-if="timelineItems.length" class="mt-4 space-y-3">
          <div
            v-for="item in timelineItems"
            :key="item.id || `${item.toStatus}-${item.createdAt}`"
            class="flex gap-3 rounded-xl bg-stone-50 p-4 text-sm"
          >
            <span class="mt-1 h-3 w-3 flex-shrink-0 rounded-full bg-emerald-400"></span>
            <div>
              <p class="font-black text-stone-900">
                {{ formatStatus(item.fromStatus) }} → {{ formatStatus(item.toStatus) }}
              </p>
              <p class="mt-1 text-stone-500">{{ formatDateTime(item.createdAt) }}</p>
              <p v-if="item.note" class="mt-1 text-stone-600">{{ item.note }}</p>
            </div>
          </div>
        </div>

        <p v-else class="mt-4 rounded-xl bg-stone-50 p-4 text-sm text-stone-500">
          Detailed carrier tracking is coming in future phase. For now, your current status is shown above.
        </p>
      </section>
    </section>

    <div v-if="order" class="mt-5 grid gap-5 md:grid-cols-3">
      <AccountPlaceholderPanel
        title="Tracking"
        :message="shipment ? 'Carrier tracking is connected for this order.' : 'Tracking will appear here once fulfillment tracking is connected.'"
      />
      <AccountPlaceholderPanel
        title="Reviews"
        :message="order.reviews?.message || 'Review prompts will appear after delivery.'"
      />
      <AccountPlaceholderPanel
        title="Need help with this order?"
        :message="order.support?.message || 'Support request linking is prepared for a future support workflow.'"
      />
    </div>

    <p v-if="loading" class="rounded-xl border border-stone-200 bg-white p-6 text-sm text-stone-500">
      Loading order...
    </p>

    <p v-if="error" class="mt-5 text-sm font-semibold text-red-600">
      {{ error }}
    </p>
  </AccountShell>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import AccountShell from '../components/AccountShell.vue'
import AccountPlaceholderPanel from '../components/AccountPlaceholderPanel.vue'
import {
  useAccountOrders,
} from '../composables/useAccountOrders.js'
import {
  formatCurrency,
} from '@shared/utils/currency'

const route = useRoute()
const {
  error,
  loadOrder,
  loading,
  order,
} = useAccountOrders()

const shippingLines = computed(() => {
  if (!order.value) {
    return []
  }

  return [
    order.value.address1,
    order.value.address2,
    [
      order.value.city,
      order.value.state,
      order.value.zip,
    ]
      .filter(Boolean)
      .join(', '),
    order.value.country,
  ].filter(Boolean)
})

const timelineItems = computed(() =>
  Array.isArray(order.value?.statusHistory)
    ? order.value.statusHistory
    : [],
)
const shipment = computed(() =>
  order.value?.shipment
  || order.value?.shipments?.[0]
  || null,
)
const shipmentEvents = computed(() =>
  Array.isArray(shipment.value?.events)
    ? shipment.value.events
    : [],
)

function formatStatus(value) {
  return String(value || 'Pending')
    .replaceAll('_', ' ')
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}

function formatDate(value) {
  if (!value) {
    return 'date unavailable'
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value))
}

function formatDateTime(value) {
  if (!value) {
    return 'date unavailable'
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value))
}

onMounted(() => loadOrder(route.params.reference))
</script>
