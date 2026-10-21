<script setup>
import { onBeforeUnmount, onMounted } from 'vue'
import { Database, RefreshCw } from '@lucide/vue'
import { useDevelopmentRouting } from '../composables/useDevelopmentRouting.js'

const { frontend, backend, mode, context, verified, label, loading, error, checkedAt, refresh } = useDevelopmentRouting()
let timer
onMounted(() => {
  refresh()
  timer = setInterval(() => { if (!document.hidden) refresh() }, 30000)
})
onBeforeUnmount(() => clearInterval(timer))
</script>

<template>
  <aside data-development-routing class="border-b border-stone-300 bg-stone-100 px-4 py-2 text-xs text-stone-800">
    <details class="mx-auto max-w-screen-2xl">
      <summary class="flex min-h-8 cursor-pointer flex-wrap items-center gap-x-4 gap-y-1 rounded focus-visible:outline-2 focus-visible:outline-blue-700">
        <span class="flex items-center gap-2 font-bold"><Database :size="15" />Development</span>
        <strong :class="verified ? 'text-emerald-800' : 'text-amber-800'" role="status">{{ loading ? 'CHECKING DATA TARGET' : label }}</strong>
        <span class="break-all">API: {{ backend }}</span>
        <span class="ml-auto underline underline-offset-2">Routing details</span>
      </summary>
      <div class="grid gap-3 border-t border-stone-300 py-3 sm:grid-cols-2 lg:grid-cols-4">
        <dl><dt class="font-bold">Frontend</dt><dd class="mt-1 break-all">{{ frontend }}</dd><dd>Vite mode: {{ mode }}</dd></dl>
        <dl><dt class="font-bold">Backend</dt><dd class="mt-1 break-all">{{ backend }}</dd><dd v-if="context?.instanceId">Instance: {{ context.instanceId }}</dd></dl>
        <dl><dt class="font-bold">Database target</dt><dd class="mt-1">{{ verified ? context.target.description : 'Not confirmed by backend' }}</dd><dd v-if="checkedAt">Last checked: {{ checkedAt }}</dd></dl>
        <div><p v-if="error" class="mb-2 text-amber-900" role="alert">{{ error }}</p><button type="button" class="inline-flex min-h-9 items-center gap-2 rounded border border-stone-400 bg-white px-3 font-semibold disabled:opacity-50" :disabled="loading" @click="refresh"><RefreshCw :size="14" />Recheck routing</button></div>
      </div>
    </details>
  </aside>
</template>
