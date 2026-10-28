<script setup>
import { computed } from 'vue'
import { Database, RefreshCw } from '@lucide/vue'
import { useAdminRouting } from '../composables/useAdminRouting.js'

const { frontend, routing, loading, error, stale, current, connected, label, refresh } = useAdminRouting()
const checkedTime = computed(() => routing.value?.checkedAt ? new Date(routing.value.checkedAt).toLocaleString() : 'Not checked')
const gatewayDestination = computed(() => routing.value?.apiOrigin?.endsWith('.up.railway.app') ? 'Railway API' : 'backend API')
</script>

<template>
  <div class="grid w-full min-w-0 max-w-xl grid-cols-[minmax(0,1fr)_2.75rem] items-start gap-2 sm:w-auto sm:flex-1">
    <details class="min-w-0">
      <summary class="flex min-h-11 cursor-pointer flex-wrap items-center gap-x-3 gap-y-1 text-xs">
        <span class="inline-flex items-center gap-1.5 font-medium"><Database :size="15" aria-hidden="true" />Data routing</span>
        <span role="status" aria-live="polite" class="rounded border px-2 py-1 font-semibold" :class="connected ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : current ? 'border-amber-200 bg-amber-50 text-amber-800' : 'border-stone-200 bg-stone-100 text-stone-600'">{{ label }}</span>
      </summary>
      <div class="min-w-0 space-y-3 py-3 text-xs" :aria-busy="loading">
        <p v-if="error" role="alert" class="text-red-800">{{ error }}</p>
        <p v-if="stale && !loading" class="text-amber-800">Check expired. Refresh for the current connection.</p>
        <dl class="grid min-w-0 gap-x-4 gap-y-3 sm:grid-cols-2">
          <div class="min-w-0"><dt class="admin-muted">Staff website</dt><dd class="mt-1 break-all">{{ frontend }}</dd></div>
          <div><dt class="admin-muted">API connection</dt><dd class="mt-1">{{ routing ? routing.transport === 'protected-gateway' ? `Protected gateway → ${gatewayDestination}` : 'Direct to configured API' : 'Not verified' }}</dd></div>
          <div class="min-w-0"><dt class="admin-muted">Backend origin</dt><dd class="mt-1 break-all">{{ routing?.apiOrigin || 'Not verified' }}</dd></div>
          <div><dt class="admin-muted">Database</dt><dd class="mt-1">{{ routing?.target?.description || 'Not verified' }}</dd></div>
          <div><dt class="admin-muted">Server environment</dt><dd class="mt-1">{{ routing?.environment || 'Unknown' }}</dd></div>
          <div><dt class="admin-muted">Connection check</dt><dd class="mt-1">{{ current ? connected ? 'Connected (read-only check)' : 'Unavailable' : 'Not currently verified' }}</dd></div>
          <div><dt class="admin-muted">Last checked (local time)</dt><dd class="mt-1"><time v-if="routing?.checkedAt" :datetime="routing.checkedAt">{{ checkedTime }}</time><span v-else>{{ checkedTime }}</span></dd></div>
        </dl>
        <p class="admin-muted">The backend selects the database at startup. This panel checks the route; it does not switch databases.</p>
      </div>
    </details>
    <button type="button" class="admin-icon-button min-h-11 w-11" :disabled="loading" aria-label="Refresh data routing" title="Refresh data routing" @click="refresh"><RefreshCw :size="16" aria-hidden="true" :class="loading ? 'motion-safe:animate-spin' : ''" /></button>
  </div>
</template>
