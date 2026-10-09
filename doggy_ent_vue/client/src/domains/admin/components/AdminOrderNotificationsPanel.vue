<script setup>
defineProps({
  deliveries: {
    type: Array,
    default: () => [],
  },
  disabled: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['resend'])

const resendActions = [
  {
    event: 'ORDER_CONFIRMATION',
    label: 'Resend confirmation',
  },
  {
    event: 'TRACKING_UPDATE',
    label: 'Resend tracking',
  },
  {
    event: 'ORDER_DELIVERED',
    label: 'Resend delivered',
  },
  {
    event: 'REVIEW_REQUEST',
    label: 'Send review request',
  },
]

function formatEvent(value) {
  return String(value || 'Notification')
    .replaceAll('_', ' ')
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}

function formatDateTime(value) {
  if (!value) {
    return 'N/A'
  }

  return new Date(value).toLocaleString()
}
</script>

<template>
  <section class="admin-form-section mt-5">
    <div
      class="flex flex-col gap-3 md:flex-row md:items-start md:justify-between"
    >
      <div>
        <h2 class="text-lg font-extrabold text-[var(--brand-4)]">
          Notifications
        </h2>
        <p class="mt-1 text-sm text-stone-400">
          Review order email history and resend customer messages.
        </p>
      </div>

      <div class="flex flex-wrap gap-2 md:justify-end">
        <button
          v-for="action in resendActions"
          :key="action.event"
          type="button"
          class="rounded-lg border border-stone-300 px-3 py-2 text-xs font-bold text-stone-700 transition hover:border-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
          :disabled="disabled"
          @click="emit('resend', action.event)"
        >
          {{ action.label }}
        </button>
      </div>
    </div>

    <div v-if="deliveries.length" class="mt-4 space-y-3">
      <div
        v-for="delivery in deliveries"
        :key="delivery.id"
        class="rounded-xl border border-stone-100 bg-[var(--brand-5)] p-3 text-sm"
      >
        <div class="flex items-start justify-between gap-3">
          <div>
            <p class="font-black text-[var(--brand-4)]">
              {{ formatEvent(delivery.event) }}
            </p>
            <p class="mt-1 text-stone-500">{{ delivery.subject }}</p>
          </div>
          <span
            class="rounded-full bg-white px-2 py-1 text-xs font-black uppercase text-stone-500"
          >
            {{ delivery.status }}
          </span>
        </div>
        <p class="mt-2 text-xs text-stone-400">
          {{ formatDateTime(delivery.sentAt || delivery.createdAt) }}
        </p>
        <p
          v-if="delivery.errorMessage"
          class="mt-2 text-xs font-semibold text-red-600"
        >
          {{ delivery.errorMessage }}
        </p>
      </div>
    </div>

    <p v-else class="mt-4 text-sm text-stone-400">
      No email delivery history is recorded for this order yet.
    </p>
  </section>
</template>
