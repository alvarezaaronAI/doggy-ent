<script setup>
import { onMounted, ref } from 'vue'
import AdminIcon from './AdminIcon.vue'
import { fetchPaymentRecoveryCases } from '../api/adminPaymentRecovery.api.js'
const state = ref(null), loading = ref(false), error = ref('')
async function load() {
  if (loading.value) return
  loading.value = true
  error.value = ''
  try { state.value = await fetchPaymentRecoveryCases() }
  catch { error.value = 'Payment review cases could not be loaded. Refresh to check again.' }
  finally { loading.value = false }
}
const amount = row => new Intl.NumberFormat('en-US', { style: 'currency', currency: row.currency || 'usd' }).format(row.amountCents / 100)
onMounted(load)
</script>

<template>
  <section v-if="state?.enabled || error" class="my-5 rounded-lg border border-amber-200 bg-amber-50 p-4" aria-labelledby="payment-review-heading" :aria-busy="loading">
    <div class="flex items-center justify-between gap-3">
      <h2 id="payment-review-heading" class="text-base font-semibold">Payment review <span v-if="state">({{ state.cases.length }})</span></h2>
      <button class="admin-icon-button" type="button" title="Refresh payment review" aria-label="Refresh payment review" :disabled="loading" @click="load"><AdminIcon name="refresh" /></button>
    </div>
    <p v-if="error" class="mt-2 text-sm text-red-800" role="alert">{{ error }}</p>
    <p v-else-if="!state?.cases.length" class="mt-2 text-sm">No payment recovery cases need attention.</p>
    <template v-else>
      <p class="mt-2 text-sm">Check Stripe before taking action. Do not ask the customer to pay again. No refund, email or shipment is sent here.</p>
      <div class="admin-table-wrap mt-3">
        <table class="admin-table">
          <thead><tr><th>Checkout</th><th>Payment</th><th>Status</th><th>Review reason</th></tr></thead>
          <tbody><tr v-for="row in state.cases" :key="row.id">
            <td data-label="Checkout"><code class="break-all text-xs">{{ row.id }}</code></td>
            <td data-label="Payment"><strong>{{ amount(row) }}</strong><span class="admin-badge ml-2">{{ row.paymentMode }}</span><p class="mt-1 break-all font-mono text-xs">{{ row.paymentIntentId || 'Payment identity unresolved' }}</p></td>
            <td data-label="Status">{{ row.status === 'PAID_REVIEW' ? 'Needs review' : 'Recovery pending' }}</td>
            <td data-label="Review reason"><code class="break-all text-xs">{{ row.lastErrorCode || 'ORDER_FINALIZATION_PENDING' }}</code></td>
          </tr></tbody>
        </table>
      </div>
    </template>
  </section>
</template>
