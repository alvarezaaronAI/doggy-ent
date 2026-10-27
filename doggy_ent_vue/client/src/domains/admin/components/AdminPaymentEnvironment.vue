<script setup>
import { computed } from 'vue'
import AdminIcon from './AdminIcon.vue'
import { useAdminPaymentEnvironment } from '../composables/useAdminPaymentEnvironment.js'

const { environment, loading, error, stale, current, accountVerified, modeLabel, verificationLabel, paymentsLabel, refresh } = useAdminPaymentEnvironment()
const checkedTime = computed(() => {
  if (!environment.value?.checkedAt) return 'Not checked'
  return new Date(environment.value.checkedAt).toLocaleString()
})
const verificationClass = computed(() => {
  if (!current.value) return 'text-[var(--admin-muted)]'
  return accountVerified.value ? 'text-[var(--admin-accent)]' : 'text-amber-800'
})
</script>

<template>
  <div class="grid w-full min-w-0 max-w-xl grid-cols-[minmax(0,1fr)_2.75rem] items-start gap-2 sm:w-auto sm:flex-1">
    <details class="min-w-0">
      <summary class="flex min-h-11 flex-wrap items-center gap-x-3 gap-y-1 text-xs">
        <span class="font-medium">Payments</span>
        <span :class="environment?.mode === 'live' ? 'font-semibold text-red-800' : 'font-medium'">{{ modeLabel }}</span>
        <span role="status" aria-live="polite" :class="verificationClass">{{ verificationLabel }}</span>
        <span class="admin-muted">{{ paymentsLabel === 'Paused' ? 'New payments paused' : paymentsLabel }}</span>
      </summary>
      <div class="min-w-0 py-3 text-xs" :aria-busy="loading">
        <p v-if="loading" class="admin-muted mb-3">Checking payment environment...</p>
        <p v-if="error" role="alert" class="mb-3 text-red-800">{{ error }}</p>
        <p v-else-if="!environment && !loading" class="admin-muted mb-3">Payment environment unknown.</p>
        <p v-if="stale && !loading && !error" class="mb-3 text-amber-800">Check is stale. Refresh for current payment status.</p>
        <p v-if="environment && !current" class="admin-muted mb-3">Last reported configuration; current payment status is unknown.</p>
        <dl class="grid min-w-0 gap-x-4 gap-y-3 sm:grid-cols-2">
          <div class="min-w-0">
            <dt class="admin-muted">Expected Stripe account</dt>
            <dd class="mt-1 break-all font-mono">{{ environment?.expectedAccountId || (environment ? 'Not set' : 'Unknown') }}</dd>
          </div>
          <div class="min-w-0">
            <dt class="admin-muted">{{ accountVerified ? 'Verified Stripe account (last check)' : 'Stripe account returned (not verified)' }}</dt>
            <dd class="mt-1 break-all font-mono">{{ environment?.accountId || 'Not verified' }}</dd>
          </div>
          <div>
            <dt class="admin-muted">Configured key mode</dt>
            <dd class="mt-1">{{ environment ? { sandbox: 'Sandbox', live: 'Live', unconfigured: 'Unset' }[environment.keyMode] : 'Unknown' }}</dd>
          </div>
          <div>
            <dt class="admin-muted">New payments</dt>
            <dd class="mt-1 font-medium" :class="paymentsLabel === 'Allowed (sandbox)' ? 'text-[var(--admin-accent)]' : 'text-[var(--admin-text)]'">{{ paymentsLabel }}</dd>
          </div>
          <div>
            <dt class="admin-muted">Account charges (last check)</dt>
            <dd class="mt-1">{{ environment?.chargesEnabled === true ? 'Enabled' : environment?.chargesEnabled === false ? 'Disabled' : 'Unknown' }}</dd>
          </div>
          <div class="min-w-0">
            <dt class="admin-muted">Last checked (local time)</dt>
            <dd class="mt-1 break-words"><time v-if="environment?.checkedAt" :datetime="environment.checkedAt">{{ checkedTime }}</time><span v-else>{{ checkedTime }}</span></dd>
          </div>
        </dl>
        <p class="mt-3 text-amber-800">Live charging is locked until launch checks pass.</p>
        <div class="mt-3 border-t border-[var(--admin-line)] pt-3">
          <p class="font-medium">Blockers{{ current ? '' : ' (last check)' }}</p>
          <ul v-if="environment?.blockers.length" class="mt-2 list-disc space-y-2 pl-4">
            <li v-for="(blocker, index) in environment.blockers" :key="`${blocker.code}-${index}`" class="break-words [overflow-wrap:anywhere]">{{ blocker.message }}</li>
          </ul>
          <p v-else class="admin-muted mt-2">{{ current ? 'None reported.' : 'Current blockers unknown.' }}</p>
        </div>
      </div>
    </details>
    <button
      type="button"
      class="admin-icon-button min-h-11 w-11"
      :disabled="loading"
      aria-label="Refresh payment environment"
      title="Refresh payment environment"
      @click="refresh"
    >
      <AdminIcon name="refresh" :class="loading ? 'motion-safe:animate-spin' : ''" />
    </button>
  </div>
</template>
