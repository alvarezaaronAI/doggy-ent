<script setup>
import { ref } from 'vue'
import { CircleAlert } from '@lucide/vue'
defineProps({ message: { type: String, default: '' }, errors: { type: Object, default: () => ({}) }, fields: { type: Object, default: () => ({}) } })
const summary = ref(null)
function reveal(element) {
  element?.focus({ preventScroll: true })
  element?.scrollIntoView({ block: 'center', behavior: 'instant' })
}
function focus() { reveal(summary.value?.closest('form')?.querySelector('[aria-invalid="true"]') || summary.value) }
function focusField(id) { reveal(document.getElementById(id)) }
defineExpose({ focus })
</script>
<template>
  <div v-if="message" ref="summary" tabindex="-1" class="auth-alert auth-error-summary" role="alert">
    <div class="flex items-start gap-2"><CircleAlert :size="19" class="mt-0.5 shrink-0" aria-hidden="true" /><div><h2 class="font-semibold">{{ Object.keys(errors).length ? 'A few details need another look' : 'Please try again' }}</h2><p v-if="!Object.keys(errors).length" class="mt-1">{{ message }}</p></div></div>
    <ul v-if="Object.keys(errors).length" class="mt-2 space-y-1 pl-7">
      <li v-for="(error, key) in errors" :key="key"><a :href="`#${fields[key]}`" class="underline underline-offset-2" @click.prevent="focusField(fields[key])">{{ error }}</a></li>
    </ul>
  </div>
</template>
