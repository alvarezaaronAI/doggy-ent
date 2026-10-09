<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import AdminPageHeader from '../components/AdminPageHeader.vue'
import AdminIcon from '../components/AdminIcon.vue'
import AdminMetrics from '../components/AdminMetrics.vue'
import AdminCustomerOrdersPanel from '../components/AdminCustomerOrdersPanel.vue'
import AdminCustomerNotificationsPanel from '../components/AdminCustomerNotificationsPanel.vue'
import AdminCustomerStatusBadge from '../components/AdminCustomerStatusBadge.vue'
import AdminCustomerInternalPanel from '../components/AdminCustomerInternalPanel.vue'
import { useAdminCustomers } from '../composables/useAdminCustomers'
import { formatCurrency } from '@shared/utils/currency'
import { formatAdminOrderDate } from '../utils/adminOrders.utils'
const id = useRoute().params.customerId
const message = ref('')
const actionBusy = ref(false)
const actionError = ref('')
const {
  customer,
  deactivateCustomer,
  error,
  loadCustomer,
  loading,
  queuePasswordReset,
  queueVerification,
  reactivateCustomer,
  saving,
} = useAdminCustomers()
const isActive = computed(() => customer.value?.status === 'ACTIVE')
async function run(action) {
  if (actionBusy.value) return
  const labels = {
    status: isActive.value
      ? 'Deactivate this account?'
      : 'Reactivate this account?',
    verification: 'Request a verification email for this customer?',
    reset: 'Request a password reset email for this customer?',
  }
  if (!window.confirm(labels[action])) return
  actionBusy.value = true
  message.value = ''
  actionError.value = ''
  try {
    if (action === 'status') {
      const active = isActive.value
      await (active ? deactivateCustomer(id) : reactivateCustomer(id))
      message.value = active ? 'Account deactivated.' : 'Account reactivated.'
    } else {
      await (action === 'verification'
        ? queueVerification(id)
        : queuePasswordReset(id))
      await loadCustomer(id)
      message.value =
        'Email request processed. Check delivery history for provider status.'
    }
  } catch (cause) {
    actionError.value = cause.message || 'Unable to complete this action.'
  } finally {
    actionBusy.value = false
  }
}
onMounted(() => loadCustomer(id))
</script>
<template>
  <section class="admin-page">
    <RouterLink class="admin-link mb-5" to="/admin/customers"
      ><AdminIcon name="back" /> All customers</RouterLink
    >
    <AdminPageHeader
      :title="customer?.name || 'Customer detail'"
      eyebrow="Customer care"
    />
    <p v-if="loading" class="admin-state" role="status">Loading customer...</p>
    <div
      v-if="error || actionError"
      class="admin-alert admin-error"
      role="alert"
    >
      {{ actionError || error }}
    </div>
    <p v-if="message" class="admin-alert admin-success" role="status">
      {{ message }}
    </p>
    <template v-if="customer && !loading">
      <div class="flex flex-wrap items-center gap-3">
        <p class="break-words">{{ customer.email }}</p>
        <AdminCustomerStatusBadge :status="customer.status" /><span
          class="admin-badge"
          >{{ customer.role }}</span
        ><span
          class="admin-badge"
          :class="customer.emailVerified ? 'is-success' : 'is-warning'"
          >{{
            customer.emailVerified ? 'Verified email' : 'Unverified email'
          }}</span
        >
      </div>
      <AdminMetrics
        :items="[
          { label: 'Orders', value: customer.orderCount },
          {
            label: 'Lifetime spend',
            value: formatCurrency(customer.lifetimeSpend),
          },
          {
            label: 'Latest order',
            value: customer.latestOrderDate
              ? formatAdminOrderDate(customer.latestOrderDate)
              : 'No orders',
          },
        ]"
      />
      <div class="admin-editor">
        <div class="min-w-0 space-y-6">
          <AdminCustomerOrdersPanel
            title="Linked orders"
            :orders="customer.orders"
          />
          <AdminCustomerOrdersPanel
            title="Verified-email guest matches"
            :orders="customer.matchedGuestOrders"
          />
          <details class="admin-form-section">
            <summary class="font-semibold cursor-pointer">
              Email delivery history
            </summary>
            <AdminCustomerNotificationsPanel
              :deliveries="customer.emailDeliveries || []"
            />
          </details>
        </div>
        <aside class="admin-editor-aside">
          <h2>Account details</h2>
          <p class="admin-muted mt-4">
            Joined {{ formatAdminOrderDate(customer.createdAt) }}
          </p>
          <div class="flex flex-col items-start gap-3 mt-6">
            <button
              class="admin-button"
              :disabled="saving || actionBusy"
              @click="run('status')"
            >
              {{
                isActive ? 'Deactivate account' : 'Reactivate account'
              }}</button
            ><button
              class="admin-button"
              :disabled="saving || actionBusy || customer.emailVerified"
              @click="run('verification')"
            >
              Resend verification</button
            ><button
              class="admin-button"
              :disabled="saving || actionBusy"
              @click="run('reset')"
            >
              Request password reset
            </button>
          </div>
          <AdminCustomerInternalPanel :customer="customer" />
          <section class="admin-form-section mt-6">
            <h3>Internal notes</h3>
            <p class="admin-muted mt-2">Coming in a future phase.</p>
          </section>
        </aside>
      </div>
      <section class="admin-form-section">
        <h2>Customer workspace</h2>
        <div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 mt-5">
          <div
            v-for="area in [
              'Support activity',
              'Reviews',
              'Loyalty & referrals',
              'Account activity',
            ]"
            :key="area"
          >
            <h3 class="font-medium">{{ area }}</h3>
            <p class="admin-muted mt-2">Coming in a future phase.</p>
          </div>
        </div>
      </section>
    </template>
  </section>
</template>
