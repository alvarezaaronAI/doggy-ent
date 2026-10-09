<script setup>
defineProps({
  deliveries: {
    type: Array,
    default: () => [],
  },
})

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
</script>

<template>
  <section class="admin-form-section mt-5">
    <h2 class="text-lg font-extrabold text-[var(--brand-4)]">
      Notification history
    </h2>
    <div v-if="deliveries.length" class="mt-4 space-y-3">
      <div
        v-for="delivery in deliveries"
        :key="delivery.id"
        class="rounded-xl bg-[var(--brand-5)] p-3 text-sm"
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
      </div>
    </div>
    <p v-else class="mt-4 text-sm text-stone-400">
      No customer notification deliveries have been recorded yet.
    </p>
  </section>
</template>
