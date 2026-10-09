<script setup>
import AdminRecordFields from './AdminRecordFields.vue'
defineProps({ record: { type: Object, default: null } })
</script>
<template>
  <details class="mt-5">
    <summary class="font-medium">Saved database fields</summary>
    <div class="mt-4">
      <AdminRecordFields v-if="record" :value="record" />
      <p v-else class="admin-muted">
        Record details are unavailable. Refresh this page to try again.
      </p>
    </div>
  </details>
</template>
