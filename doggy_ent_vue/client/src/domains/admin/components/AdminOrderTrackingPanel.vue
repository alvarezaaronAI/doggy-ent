<script setup>
import { computed, reactive, watch } from 'vue'

const props = defineProps({
  order: {
    type: Object,
    required: true,
  },
  saving: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['save', 'refresh'])

const statusOptions = [
  'UNKNOWN',
  'PRE_TRANSIT',
  'TRANSIT',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
  'RETURNED',
  'FAILURE',
]

const form = reactive({
  carrier: '',
  trackingNumber: '',
  trackingUrl: '',
  shipmentStatus: 'UNKNOWN',
  markShipped: true,
})

const shipment = computed(() =>
  props.order?.shipment
  || props.order?.shipments?.[0]
  || null,
)

function syncForm() {
  form.carrier = shipment.value?.carrier || ''
  form.trackingNumber = shipment.value?.trackingNumber || ''
  form.trackingUrl = shipment.value?.trackingUrl || ''
  form.shipmentStatus = shipment.value?.shipmentStatus || 'UNKNOWN'
  form.markShipped = ['PRE_TRANSIT', 'TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED']
    .includes(form.shipmentStatus)
}

function formatDateTime(value) {
  if (!value) {
    return 'N/A'
  }

  return new Date(value).toLocaleString()
}

function saveTracking() {
  emit('save', {
    carrier: form.carrier,
    trackingNumber: form.trackingNumber,
    trackingUrl: form.trackingUrl,
    shipmentStatus: form.shipmentStatus,
    markShipped: form.markShipped,
  })
}

watch(
  shipment,
  syncForm,
  {
    immediate: true,
  },
)
</script>

<template>
  <section class="rounded-2xl border border-[var(--brand-3)] bg-white p-5 shadow-sm">
    <div class="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
      <div>
        <h2 class="text-lg font-extrabold text-[var(--brand-4)]">Tracking</h2>
        <p class="mt-1 text-sm text-stone-400">
          Add or sync carrier tracking for customer and admin visibility.
        </p>
      </div>

      <button
        type="button"
        class="w-fit rounded-lg border border-stone-300 px-4 py-2 text-sm font-semibold text-stone-700 transition hover:border-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
        :disabled="saving || !shipment"
        @click="$emit('refresh')"
      >
        Refresh
      </button>
    </div>

    <div v-if="shipment" class="mt-4 grid gap-3 rounded-xl bg-[var(--brand-5)] p-4 text-sm md:grid-cols-2">
      <p><span class="font-semibold text-stone-400">Carrier:</span> {{ shipment.carrier }}</p>
      <p><span class="font-semibold text-stone-400">Status:</span> {{ shipment.shipmentStatus || 'UNKNOWN' }}</p>
      <p><span class="font-semibold text-stone-400">Tracking #:</span> {{ shipment.trackingNumber }}</p>
      <p><span class="font-semibold text-stone-400">Estimated:</span> {{ formatDateTime(shipment.estimatedDelivery) }}</p>
      <p><span class="font-semibold text-stone-400">Shipped:</span> {{ formatDateTime(shipment.shippedAt) }}</p>
      <p><span class="font-semibold text-stone-400">Delivered:</span> {{ formatDateTime(shipment.deliveredAt) }}</p>
      <p class="md:col-span-2">
        <span class="font-semibold text-stone-400">Tracking URL:</span>
        <a
          v-if="shipment.trackingUrl"
          :href="shipment.trackingUrl"
          target="_blank"
          rel="noreferrer"
          class="break-all font-bold text-emerald-700"
        >
          {{ shipment.trackingUrl }}
        </a>
        <span v-else>N/A</span>
      </p>
    </div>

    <form class="mt-5 grid gap-4 md:grid-cols-2" @submit.prevent="saveTracking">
      <label class="text-sm font-semibold text-stone-600">
        Carrier
        <input
          v-model="form.carrier"
          class="mt-2 w-full rounded-lg border border-stone-200 px-3 py-2 text-sm"
          placeholder="usps, ups, fedex"
          required
        />
      </label>

      <label class="text-sm font-semibold text-stone-600">
        Tracking number
        <input
          v-model="form.trackingNumber"
          class="mt-2 w-full rounded-lg border border-stone-200 px-3 py-2 text-sm"
          required
        />
      </label>

      <label class="text-sm font-semibold text-stone-600">
        Tracking URL
        <input
          v-model="form.trackingUrl"
          class="mt-2 w-full rounded-lg border border-stone-200 px-3 py-2 text-sm"
          placeholder="Optional"
        />
      </label>

      <label class="text-sm font-semibold text-stone-600">
        Shipment status
        <select
          v-model="form.shipmentStatus"
          class="mt-2 w-full rounded-lg border border-stone-200 px-3 py-2 text-sm"
        >
          <option
            v-for="status in statusOptions"
            :key="status"
            :value="status"
          >
            {{ status.replaceAll('_', ' ') }}
          </option>
        </select>
      </label>

      <label class="flex items-center gap-3 text-sm font-semibold text-stone-600 md:col-span-2">
        <input
          v-model="form.markShipped"
          type="checkbox"
          class="h-4 w-4 rounded border-stone-300 text-emerald-600"
        />
        Mark order shipped when saving tracking
      </label>

      <div class="md:col-span-2">
        <button
          type="submit"
          class="rounded-lg bg-[var(--brand-4)] px-5 py-2 text-sm font-bold text-white transition hover:bg-stone-900 disabled:cursor-not-allowed disabled:opacity-60"
          :disabled="saving"
        >
          {{ saving ? 'Saving...' : 'Save tracking' }}
        </button>
      </div>
    </form>

    <div v-if="shipment?.events?.length" class="mt-5 border-t border-stone-100 pt-4">
      <h3 class="text-sm font-extrabold uppercase tracking-[0.14em] text-stone-400">Carrier events</h3>
      <div class="mt-3 space-y-2">
        <div
          v-for="event in shipment.events"
          :key="`${event.status}-${event.occurredAt}-${event.message}`"
          class="rounded-xl border border-stone-100 p-3 text-sm"
        >
          <p class="font-bold text-[var(--brand-4)]">{{ event.status || 'Update' }}</p>
          <p class="text-stone-500">{{ formatDateTime(event.occurredAt) }}</p>
          <p v-if="event.message" class="mt-1 text-stone-600">{{ event.message }}</p>
          <p v-if="event.location" class="mt-1 text-stone-400">{{ event.location }}</p>
        </div>
      </div>
    </div>
  </section>
</template>
