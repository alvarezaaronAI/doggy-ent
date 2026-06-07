<script setup>
import { computed, ref, watch } from 'vue'
import {
  ORDER_STATUSES,
} from '../constants/adminOrders.constants'

const props = defineProps({
  order: {
    type: Object,
    required: true,
  },
  statusClass: {
    type: Function,
    required: true,
  },
})

const emit = defineEmits([
  'save',
])

const statusOptions = [
  ORDER_STATUSES.PENDING,
  ORDER_STATUSES.PAID,
  ORDER_STATUSES.PROCESSING,
  ORDER_STATUSES.SHIPPED,
  ORDER_STATUSES.DELIVERED,
  ORDER_STATUSES.CANCELLED,
  ORDER_STATUSES.REFUNDED,
]

const selectedStatus = ref(props.order.status)
const statusNote = ref('')

const hasChanges = computed(() =>
  selectedStatus.value !== props.order.status,
)

const statusHistory = computed(() =>
  Array.isArray(props.order.statusHistory)
    ? props.order.statusHistory
    : [],
)

const lastStatusChange = computed(() =>
  props.order.lastStatusChange || statusHistory.value[0] || null,
)

watch(
  () => props.order.status,
  (status) => {
    selectedStatus.value = status
    statusNote.value = ''
  },
)

function formatDate(value) {
  if (!value) return 'N/A'
  return new Date(value).toLocaleString()
}

function cancelStatusEdit() {
  selectedStatus.value = props.order.status
  statusNote.value = ''
}

function saveStatusEdit() {
  if (!hasChanges.value) return

  emit('save', {
    status: selectedStatus.value,
    note: statusNote.value.trim(),
  })
}
</script>

<template>
  <section class="rounded-2xl border border-[var(--brand-3)] bg-white p-5 shadow-sm">
    <div class="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
      <div>
        <p class="text-xs font-semibold uppercase tracking-[0.14em] text-stone-400">Current status</p>
        <span :class="statusClass(order.status)" class="mt-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold">
          {{ order.status }}
        </span>
        <p class="mt-2 text-sm text-stone-400">Last updated {{ formatDate(order.updatedAt) }}</p>
        <p v-if="lastStatusChange" class="mt-1 text-xs text-stone-400">
          Last change: {{ lastStatusChange.fromStatus }} to {{ lastStatusChange.toStatus }} on {{ formatDate(lastStatusChange.createdAt) }}
        </p>
      </div>

      <div class="grid gap-3 md:min-w-80">
        <label class="block">
          <span class="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-stone-400">Select next status</span>
          <select
            v-model="selectedStatus"
            class="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm font-semibold outline-none focus:border-emerald-400"
          >
            <option
              v-for="status in statusOptions"
              :key="status"
              :value="status"
            >
              {{ status }}
            </option>
          </select>
        </label>

        <label class="block">
          <span class="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-stone-400">Status note</span>
          <textarea
            v-model="statusNote"
            class="min-h-20 w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-400"
            placeholder="Optional fulfillment note"
          ></textarea>
        </label>

        <div class="flex flex-wrap gap-2">
          <button
            type="button"
            class="rounded-lg bg-emerald-400 px-4 py-2 text-sm font-bold text-[var(--brand-4)] disabled:cursor-not-allowed disabled:opacity-50"
            :disabled="!hasChanges"
            @click="saveStatusEdit"
          >
            Save status
          </button>

          <button
            type="button"
            class="rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm font-bold text-stone-600 disabled:cursor-not-allowed disabled:opacity-50"
            :disabled="!hasChanges"
            @click="cancelStatusEdit"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>

    <div class="mt-5 border-t border-stone-100 pt-5">
      <h3 class="text-sm font-extrabold text-[var(--brand-4)]">Status history</h3>

      <div v-if="statusHistory.length" class="mt-3 space-y-3">
        <article
          v-for="entry in statusHistory"
          :key="entry.id"
          class="rounded-xl border border-stone-200 bg-[var(--brand-5)] p-3 text-sm"
        >
          <p class="font-bold text-[var(--brand-4)]">{{ entry.fromStatus }} to {{ entry.toStatus }}</p>
          <p class="mt-1 text-xs text-stone-500">{{ formatDate(entry.createdAt) }} · {{ entry.changedByType }}{{ entry.changedBy ? ` · ${entry.changedBy}` : '' }}</p>
          <p v-if="entry.note" class="mt-2 text-stone-600">{{ entry.note }}</p>
        </article>
      </div>

      <p v-else class="mt-3 text-sm text-stone-400">
        No status changes have been recorded yet.
      </p>
    </div>
  </section>
</template>
