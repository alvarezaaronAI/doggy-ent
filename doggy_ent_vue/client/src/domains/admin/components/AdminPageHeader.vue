<script setup>
defineProps({
  title: { type: String, required: true },
  eyebrow: { type: String, default: '' },
})
</script>
<template>
  <div class="admin-page-header">
    <div>
      <p v-if="eyebrow" class="admin-muted mb-2">{{ eyebrow }}</p>
      <h1>{{ title }}</h1>
    </div>
    <div class="flex flex-wrap gap-2"><slot /></div>
  </div>
</template>
