<script setup>
defineProps({ form: { type: Object, required: true } })
const fields = [
  { key: 'ingredients', label: 'Ingredients', multiline: true },
  { key: 'texture', label: 'Texture' },
  { key: 'freshness', label: 'Freshness / shelf life' },
  { key: 'bestFor', label: 'Best for', multiline: true },
  { key: 'notIncluded', label: "What's not inside (comma-separated)" },
  { key: 'storageFeeding', label: 'Storage & feeding', multiline: true },
  { key: 'tags', label: 'Product tags (comma-separated)' },
]
</script>
<template>
  <div class="admin-form-grid">
    <label
      v-for="field in fields"
      :key="field.key"
      class="admin-field"
      :class="{
        'sm:col-span-2':
          field.multiline ||
          field.key === 'tags' ||
          field.key === 'notIncluded',
      }"
      >{{ field.label
      }}<textarea
        v-if="field.multiline"
        v-model="form[field.key]"
        rows="3"
      ></textarea
      ><input v-else v-model="form[field.key]"
    /></label>
  </div>
</template>
