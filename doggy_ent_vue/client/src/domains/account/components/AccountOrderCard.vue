<template>
  <RouterLink
    :to="`/account/orders/${order.customerReference || order.orderNumber}`"
    class="block rounded-2xl border border-stone-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-400 hover:shadow-md"
  >
    <div class="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
      <div class="flex gap-4">
        <div class="hidden h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-stone-100 sm:block">
          <img
            v-if="firstItem?.productImage"
            :src="firstItem.productImage"
            :alt="firstItem.productName"
            class="h-full w-full object-cover"
          />
          <div v-else class="flex h-full w-full items-center justify-center text-emerald-600">
            <i class="fa-solid fa-bag-shopping"></i>
          </div>
        </div>

        <div>
        <p class="text-sm font-semibold uppercase tracking-[0.16em] text-stone-400">
          {{ displayReference }}
        </p>

        <h2 class="mt-1 text-xl font-bold text-stone-900">
          {{ formatCurrency(order.total) }}
        </h2>

        <p class="mt-1 text-sm text-stone-500">
          {{ formatDate(order.createdAt) }}
        </p>
        </div>
      </div>

      <span class="w-fit rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.14em]" :class="statusClass">
        {{ statusLabel }}
      </span>
    </div>

    <div class="mt-4 grid gap-2 text-sm text-stone-500">
      <p>
        {{ itemCount }} item<span v-if="itemCount !== 1">s</span>
      </p>
      <p v-if="firstItem">
        {{ firstItem.productName }}<span v-if="remainingItemCount"> + {{ remainingItemCount }} more</span>
      </p>
      <p v-if="order.donationAmount">
        Donation generated: {{ formatCurrency(order.donationAmount) }}
      </p>
      <p v-if="shipment" class="font-semibold text-sky-700">
        Tracking: {{ shipment.shipmentStatus || 'Update available' }}
      </p>
      <p class="font-bold text-emerald-700">
        View order details
      </p>
    </div>
  </RouterLink>
</template>

<script setup>
import { computed } from 'vue'
import {
  formatCurrency,
} from '@shared/utils/currency'

const props = defineProps({
  order: {
    type: Object,
    required: true,
  },
})

const firstItem = computed(() => props.order.items?.[0] || null)
const remainingItemCount = computed(() =>
  Math.max(0, Number(props.order.items?.length || 0) - 1),
)
const itemCount = computed(() => props.order.items?.length || 0)
const shipment = computed(() =>
  props.order.shipment
  || props.order.shipments?.[0]
  || null,
)
const displayReference = computed(() =>
  props.order.customerReference || props.order.orderNumber || 'Order pending',
)
const statusLabel = computed(() =>
  String(props.order.status || 'PENDING')
    .replaceAll('_', ' ')
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase()),
)
const statusClass = computed(() => {
  const status = String(props.order.status || '').toUpperCase()

  if (['DELIVERED', 'PAID'].includes(status)) {
    return 'bg-emerald-50 text-emerald-700'
  }

  if (['SHIPPED', 'PROCESSING'].includes(status)) {
    return 'bg-sky-50 text-sky-700'
  }

  if (['CANCELLED', 'REFUNDED'].includes(status)) {
    return 'bg-red-50 text-red-700'
  }

  return 'bg-amber-50 text-amber-700'
})

function formatDate(value) {
  if (!value) {
    return 'Date unavailable'
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value))
}
</script>
