<template>
  <main class="min-h-screen bg-[var(--brand-5)] text-slate-900">
    <section class="mx-auto max-w-7xl px-6 py-10 md:py-14">
      <div class="section-panel p-8 md:p-10">
        <div class="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p class="text-sm font-semibold uppercase tracking-[0.2em] text-stone-400">
              Admin Notifications
            </p>
            <h1 class="mt-3 text-4xl font-bold tracking-tight">Notification Activity</h1>
            <p class="mt-3 max-w-2xl text-stone-300">
              Review email delivery history, provider state, mocked sends, failures, and resend records.
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
          </div>
        </section>

        <section class="mt-6 rounded-2xl border border-[var(--brand-3)] bg-white p-5 shadow-sm">
          <div class="grid gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end">
            <label class="block">
              <span class="text-xs font-bold uppercase tracking-[0.14em] text-stone-400">
                Event filter
              </span>
              <input
                v-model="filters.event"
                class="mt-2 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
                placeholder="ORDER_CONFIRMATION"
              />
            </label>

            <label class="block">
              <span class="text-xs font-bold uppercase tracking-[0.14em] text-stone-400">
                Status filter
              </span>
              <select
                v-model="filters.status"
                class="mt-2 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
              >
                <option value="">All statuses</option>
                <option value="SENT">Sent</option>
                <option value="FAILED">Failed</option>
                <option value="MOCKED">Mocked</option>
                <option value="PENDING">Pending</option>
                <option value="SKIPPED">Skipped</option>
              </select>
            </label>

            <button
              type="button"
              class="rounded-lg bg-emerald-400 px-4 py-2 text-sm font-black text-[var(--brand-4)] transition hover:bg-emerald-300"
              @click="loadNotifications"
            >
              Refresh
            </button>
          </div>
        </section>

        <section class="mt-6 rounded-2xl border border-[var(--brand-3)] bg-white p-5 shadow-sm">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <h2 class="text-xl font-extrabold text-[var(--brand-4)]">
              Delivery history
            </h2>
            <p class="text-sm font-semibold text-stone-400">
              Provider: {{ providerStatus }}
            </p>
          </div>

          <div v-if="isLoading" class="mt-6 text-sm text-stone-400">
            Loading notification activity...
          </div>

          <div v-else-if="deliveries.length" class="mt-5 overflow-hidden rounded-xl border border-[var(--brand-3)]">
            <table class="min-w-full divide-y divide-[var(--brand-3)] text-left text-sm">
              <thead class="bg-[var(--brand-5)] text-xs font-black uppercase tracking-[0.12em] text-stone-400">
                <tr>
                  <th class="px-4 py-3">Event</th>
                  <th class="px-4 py-3">Recipient</th>
                  <th class="px-4 py-3">Status</th>
                  <th class="px-4 py-3">Subject</th>
                  <th class="px-4 py-3">Created</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-[var(--brand-3)]">
                <tr v-for="delivery in deliveries" :key="delivery.id">
                  <td class="px-4 py-3 font-black text-[var(--brand-4)]">
                    {{ formatEvent(delivery.event) }}
                  </td>
                  <td class="px-4 py-3 text-stone-500">{{ delivery.recipient }}</td>
                  <td class="px-4 py-3">
                    <span class="rounded-full bg-[var(--brand-5)] px-2 py-1 text-xs font-black uppercase text-stone-500">
                      {{ delivery.status }}
                    </span>
                  </td>
                  <td class="px-4 py-3 text-stone-500">{{ delivery.subject }}</td>
                  <td class="px-4 py-3 text-stone-400">{{ formatDateTime(delivery.createdAt) }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p v-else class="mt-6 text-sm text-stone-400">
            No notification activity matches the current filters.
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
  fetchAdminNotifications,
} from '../api/adminNotifications.api.js'

const isLoading = ref(false)
const notifications = ref({
  total: 0,
  sent: 0,
  failed: 0,
  mocked: 0,
  pending: 0,
  skipped: 0,
  recent: [],
})
const filters = reactive({
  event: '',
  status: '',
})

const deliveries = computed(() => notifications.value.recent || [])
const providerStatus = computed(() =>
  notifications.value.sent > 0
    ? 'Resend live or delivered'
    : notifications.value.mocked > 0
      ? 'Mock mode activity'
      : 'No delivered provider activity yet',
)
const metrics = computed(() => [
  { label: 'Total', value: notifications.value.total || 0 },
  { label: 'Sent', value: notifications.value.sent || 0 },
  { label: 'Failed', value: notifications.value.failed || 0 },
  { label: 'Mocked', value: notifications.value.mocked || 0 },
  { label: 'Pending', value: notifications.value.pending || 0 },
  { label: 'Skipped', value: notifications.value.skipped || 0 },
])

function formatEvent(value) {
  return String(value || 'Notification')
    .replaceAll('_', ' ')
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}

function formatDateTime(value) {
  if (!value) return 'N/A'
  return new Date(value).toLocaleString()
}

async function loadNotifications() {
  isLoading.value = true

  try {
    notifications.value = await fetchAdminNotifications({
      event: filters.event.trim(),
      status: filters.status,
      limit: 75,
    })
  }
  finally {
    isLoading.value = false
  }
}

onMounted(loadNotifications)
</script>
