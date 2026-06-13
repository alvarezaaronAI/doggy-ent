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
    </section>

    <div v-if="order" class="mt-5 grid gap-5 md:grid-cols-3">
      <AccountPlaceholderPanel
        title="Tracking"
        :message="order.tracking?.message || 'Tracking will appear here once fulfillment tracking is connected.'"
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

onMounted(() => loadOrder(route.params.reference))
</script>
