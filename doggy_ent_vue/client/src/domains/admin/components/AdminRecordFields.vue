<script setup>
defineProps({ value: { type: [Object, Array], required: true } })
function isGroup(value) {
  return value !== null && typeof value === 'object'
}
function label(key, array) {
  return array ? `Record ${Number(key) + 1}` : key
}
function display(value) {
  if (value === null || value === undefined || value === '')
    return 'Not recorded'
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  return String(value)
}
</script>
<template>
  <div class="admin-record-fields">
    <div v-for="(field, key) in value" :key="key">
      <template v-if="isGroup(field)">
        <details>
          <summary class="text-xs font-medium">
            {{ label(key, Array.isArray(value)) }}
            <span class="admin-muted ml-2"
              >{{ Object.keys(field).length }}
              {{ Array.isArray(field) ? 'records' : 'fields' }}</span
            >
          </summary>
          <div class="mt-3 pl-3 border-l border-[var(--admin-line)]">
            <AdminRecordFields
              v-if="Object.keys(field).length"
              :value="field"
            />
            <p v-else class="admin-muted">No records.</p>
          </div>
        </details>
      </template>
      <dl v-else>
        <dt>{{ label(key, Array.isArray(value)) }}</dt>
        <dd
          :class="
            /id$|number$|reference$/i.test(String(key))
              ? 'font-mono text-xs select-all'
              : ''
          "
        >
          {{ display(field) }}
        </dd>
      </dl>
    </div>
  </div>
</template>
