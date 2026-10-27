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
          Email activity
        </h2>
        <p class="mt-1 text-sm text-stone-400">
          Sent means accepted by the provider, not confirmed delivery. Mocked means no email was sent.
        </p>
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
            <span v-if="delivery.automatic === true && delivery.event === 'ORDER_CONFIRMATION'" class="admin-badge mt-2">Automatic receipt</span>
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
        <p v-if="['QUEUED', 'PENDING'].includes(delivery.status)" class="mt-2 text-xs text-stone-500">
          {{ delivery.status === 'QUEUED' ? 'Waiting for the receipt worker. Not sent yet.' : 'Provider acceptance is not confirmed. Review activity before retrying.' }}
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
