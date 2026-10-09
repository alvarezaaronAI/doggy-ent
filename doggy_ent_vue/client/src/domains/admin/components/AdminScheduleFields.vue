<script setup>
const props = defineProps({ form: { type: Object, required: true } })
const periods = [
  { key: 'starts', label: 'Start' },
  { key: 'ends', label: 'End' },
]
function clearPeriod(key) {
  props.form[key + 'Date'] = ''
  props.form[key + 'Time'] = ''
}
</script>
<template>
  <section class="admin-form-section">
    <h2>Schedule</h2>
    <div
      v-for="period in periods"
      :key="period.key"
      class="admin-form-grid mt-4"
    >
      <label class="admin-field"
        >{{ period.label }} date<input
          v-model="form[period.key + 'Date']"
          type="date"
      /></label>
      <label class="admin-field"
        >{{ period.label }} time<input
          v-model="form[period.key + 'Time']"
          type="time"
      /></label>
      <button
        type="button"
        class="admin-link justify-self-start"
        @click="clearPeriod(period.key)"
      >
        Clear {{ period.label.toLowerCase() }}
      </button>
    </div>
  </section>
</template>
