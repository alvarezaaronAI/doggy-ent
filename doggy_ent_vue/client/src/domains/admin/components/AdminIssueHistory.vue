<script setup>
import {
  formatAdminDate,
  formatAdminLabel,
} from '../utils/adminWorkspace.formatters'
defineProps({ events: { type: Array, default: () => [] } })
</script>
<template>
  <details class="admin-form-section">
    <summary class="font-semibold cursor-pointer">
      Activity history ({{ events.length }})
    </summary>
    <ol v-if="events.length" class="admin-timeline mt-4">
      <li v-for="event in events" :key="event.id">
        <p class="font-medium">{{ formatAdminLabel(event.eventType) }}</p>
        <p v-if="event.toStatus">
          {{ formatAdminLabel(event.fromStatus) }} to
          {{ formatAdminLabel(event.toStatus) }}
        </p>
        <p class="admin-muted text-xs">
          {{ formatAdminDate(event.createdAt) }} ·
          {{ formatAdminLabel(event.actorType) }}
        </p>
      </li>
    </ol>
    <p v-else class="admin-muted mt-4">No activity recorded.</p>
  </details>
</template>
