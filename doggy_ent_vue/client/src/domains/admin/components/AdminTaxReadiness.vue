<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import AdminIcon from './AdminIcon.vue'
import { fetchTaxReadiness } from '../api/adminTax.api.js'

const value = ref(null), loading = ref(false), error = ref(''), stale = ref(false)
let timer, disposed = false
const label = computed(() => error.value ? 'Check unavailable' : loading.value ? 'Checking setup...' : stale.value ? 'Refresh required' : ({ ready: 'Stripe calculation ready', disabled: 'Not collecting', not_configured: 'Setup pending', unavailable: 'Unavailable' }[value.value?.status] || 'Unknown'))
async function refresh() {
  if (loading.value) return
  loading.value = true
  error.value = ''
  clearTimeout(timer)
  try {
    const result = await fetchTaxReadiness()
    if (disposed) return
    value.value = result
    stale.value = false
    timer = setTimeout(() => { stale.value = true }, 60_000)
  } catch { if (!disposed) error.value = 'Tax setup could not be checked.' }
  finally { if (!disposed) loading.value = false }
}
onMounted(refresh)
onUnmounted(() => { disposed = true; clearTimeout(timer) })
</script>

<template>
  <div class="grid min-w-0 grid-cols-[minmax(0,1fr)_2.75rem] items-start gap-2">
    <details class="min-w-0 max-w-md">
      <summary class="flex min-h-11 flex-wrap items-center gap-2 text-xs"><span class="font-medium">Tax</span><span role="status">{{ label }}</span></summary>
      <div class="space-y-3 py-3 text-xs" :aria-busy="loading">
        <p v-if="error" role="alert" class="text-red-800">{{ error }}</p>
        <p v-if="value?.mode === 'sandbox'" class="font-medium text-[var(--admin-accent)]">Sandbox only. Test registrations are not government permits.</p>
        <p>US checkout only. No locally maintained tax rates.</p>
        <dl v-if="value" class="grid gap-3 sm:grid-cols-2">
          <div><dt class="admin-muted">Calculation source</dt><dd>{{ value.provider === 'stripe' ? 'Stripe Tax' : 'Not configured' }}</dd></div>
          <div><dt class="admin-muted">Business origin</dt><dd>{{ value.headOfficeConfigured ? 'Configured in Stripe' : 'Setup pending' }}</dd></div>
          <div><dt class="admin-muted">Product category</dt><dd>{{ value.productCodeConfigured ? 'Configured' : 'Setup pending' }}</dd></div>
          <div><dt class="admin-muted">{{ value.mode === 'sandbox' ? 'Test registration states' : 'Recorded registration states' }}</dt><dd>{{ value.activeRegistrationStates.join(', ') || 'None confirmed' }}</dd></div>
        </dl>
        <ul v-if="value?.blockers.length" class="list-disc space-y-1 pl-4"><li v-for="item in value.blockers" :key="item.code">{{ item.message }}</li></ul>
        <p class="admin-muted">Calculation setup does not confirm registration obligations, filing or remittance. Live charging stays locked.</p>
      </div>
    </details>
    <button type="button" class="admin-icon-button min-h-11 w-11" :disabled="loading" aria-label="Refresh tax setup" title="Refresh tax setup" @click="refresh"><AdminIcon name="refresh" /></button>
  </div>
</template>
