<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import AdminCustomerOrdersPanel from '../components/AdminCustomerOrdersPanel.vue'
import AdminCustomerStatusBadge from '../components/AdminCustomerStatusBadge.vue'
import AdminDataTargetBadge from '../components/AdminDataTargetBadge.vue'
import {
  useAdminCustomers,
} from '../composables/useAdminCustomers.js'
import {
  formatCurrency,
} from '@shared/utils/currency'

const route = useRoute()
const message = ref('')

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

function formatDate(value) {
  if (!value) {
    return 'Unavailable'
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value))
}

async function toggleStatus() {
  message.value = ''

  if (isActive.value) {
    await deactivateCustomer(route.params.customerId)
    message.value = 'Customer deactivation readiness recorded.'
    return
  }

  await reactivateCustomer(route.params.customerId)
  message.value = 'Customer reactivation readiness recorded.'
}

async function queueVerificationEmail() {
  await queueVerification(route.params.customerId)
  message.value = 'Verification email payload queued or logged by the email provider abstraction.'
}

async function queueResetEmail() {
  await queuePasswordReset(route.params.customerId)
  message.value = 'Password reset payload queued or logged by the email provider abstraction.'
}

onMounted(() => loadCustomer(route.params.customerId))
</script>

<template>
  <main class="min-h-screen bg-[var(--brand-5)] text-slate-900">
    <section class="mx-auto max-w-7xl px-6 py-10 md:py-14">
      <div class="mb-8 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <div class="mb-3 flex flex-wrap items-center gap-3">
            <p class="text-sm font-semibold uppercase tracking-[0.2em] text-stone-400">
              Admin CMS
            </p>

            <AdminDataTargetBadge />
          </div>

          <h1 class="text-4xl font-bold tracking-tight">
            {{ customer?.name || 'Customer detail' }}
          </h1>
          <p class="mt-3 max-w-2xl text-stone-500">
            {{ customer?.email || 'Loading customer...' }}
          </p>
        </div>

        <RouterLink
          to="/admin/customers"
          class="rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-[var(--brand-4)] transition hover:border-emerald-400"
        >
          Customers
        </RouterLink>
      </div>

      <p v-if="loading" class="rounded-xl border border-stone-200 bg-white p-6 text-sm text-stone-500">
        Loading customer...
      </p>

      <template v-else-if="customer">
        <section class="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          <div class="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
            <div class="flex flex-wrap items-center gap-3">
              <AdminCustomerStatusBadge :status="customer.status" />
              <span class="rounded-full bg-stone-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-stone-600">
                {{ customer.role }}
              </span>
              <span class="rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.14em]" :class="customer.emailVerified ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'">
                {{ customer.emailVerified ? 'Verified' : 'Unverified' }}
              </span>
            </div>

            <dl class="mt-6 grid gap-4 text-sm">
              <div>
                <dt class="font-bold text-stone-400">Created</dt>
                <dd class="mt-1 text-stone-700">{{ formatDate(customer.createdAt) }}</dd>
              </div>
              <div>
                <dt class="font-bold text-stone-400">Orders</dt>
                <dd class="mt-1 text-stone-700">{{ customer.orderCount }}</dd>
              </div>
              <div>
                <dt class="font-bold text-stone-400">Lifetime spend</dt>
                <dd class="mt-1 text-stone-700">{{ formatCurrency(customer.lifetimeSpend) }}</dd>
              </div>
              <div>
                <dt class="font-bold text-stone-400">Latest order</dt>
                <dd class="mt-1 text-stone-700">{{ formatDate(customer.latestOrderDate) }}</dd>
              </div>
            </dl>

            <div class="mt-6 flex flex-wrap gap-2">
              <button
                class="rounded-lg border border-stone-300 px-3 py-2 text-sm font-bold text-stone-700 transition hover:border-emerald-400 disabled:opacity-60"
                :disabled="saving"
                type="button"
                @click="toggleStatus"
              >
                {{ isActive ? 'Deactivate' : 'Reactivate' }}
              </button>

              <button
                class="rounded-lg border border-stone-300 px-3 py-2 text-sm font-bold text-stone-700 transition hover:border-emerald-400"
                type="button"
                @click="queueVerificationEmail"
              >
                Resend verification
              </button>

              <button
                class="rounded-lg border border-stone-300 px-3 py-2 text-sm font-bold text-stone-700 transition hover:border-emerald-400"
                type="button"
                @click="queueResetEmail"
              >
                Password reset
              </button>
            </div>

            <p v-if="message" class="mt-4 text-sm font-semibold text-emerald-700">
              {{ message }}
            </p>
          </div>

          <div class="grid gap-5">
            <AdminCustomerOrdersPanel
              title="Linked orders"
              :orders="customer.orders"
            />
            <AdminCustomerOrdersPanel
              title="Verified-email guest matches"
              :orders="customer.matchedGuestOrders"
            />
          </div>
        </section>

        <section class="mt-5 grid gap-5 md:grid-cols-3">
          <div
            v-for="(value, key) in customer.readiness"
            :key="key"
            class="rounded-xl border border-dashed border-stone-300 bg-white p-5"
          >
            <h2 class="text-sm font-bold uppercase tracking-[0.14em] text-stone-500">
              {{ key }}
            </h2>
            <p class="mt-2 text-sm text-stone-600">{{ value }}</p>
          </div>
        </section>
      </template>

      <p v-if="error" class="mt-5 text-sm font-semibold text-red-600">
        {{ error }}
      </p>
    </section>
  </main>
</template>
