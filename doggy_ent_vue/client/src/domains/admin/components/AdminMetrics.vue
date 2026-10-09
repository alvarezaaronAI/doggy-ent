<script setup>
defineProps({ items: { type: Array, required: true }, loading: Boolean })
</script>
<template>
  <dl
    class="admin-metrics"
    :class="{ 'admin-metrics-four': items.length === 4 }"
    :aria-busy="loading"
  >
    <div v-for="item in items" :key="item.label">
      <dt>{{ item.label }}</dt>
      <dd>{{ loading ? '\u2014' : item.value }}</dd>
      <p v-if="item.hint" class="admin-muted mt-1">{{ item.hint }}</p>
    </div>
  </dl>
</template>
