<template>
  <section class="overflow-hidden rounded-xl border border-stone-200 bg-white shadow-sm">
    <table class="min-w-full divide-y divide-stone-200 text-sm">
      <thead class="bg-stone-50 text-left text-xs font-bold uppercase tracking-[0.14em] text-stone-500">
        <tr>
          <th class="px-4 py-3">Customer</th>
          <th class="px-4 py-3">Role</th>
          <th class="px-4 py-3">Status</th>
          <th class="px-4 py-3">Orders</th>
          <th class="px-4 py-3">Lifetime</th>
          <th class="px-4 py-3">Latest order</th>
        </tr>
      </thead>

      <tbody class="divide-y divide-stone-100">
        <tr
          v-for="customer in customers"
          :key="customer.id"
          class="transition hover:bg-emerald-50/50"
        >
          <td class="px-4 py-4">
            <RouterLink
              :to="`/admin/customers/${customer.id}`"
              class="font-bold text-stone-900 hover:text-emerald-700"
            >
              {{ customer.name || 'Customer' }}
            </RouterLink>
            <p class="mt-1 text-xs text-stone-500">
              {{ customer.email }}
            </p>
            <p class="mt-1 text-xs" :class="customer.emailVerified ? 'text-emerald-700' : 'text-stone-400'">
              {{ customer.emailVerified ? 'Verified email' : 'Unverified email' }}
            </p>
          </td>

          <td class="px-4 py-4 font-semibold text-stone-700">
            {{ customer.role }}
          </td>

          <td class="px-4 py-4">
            <AdminCustomerStatusBadge :status="customer.status" />
          </td>

          <td class="px-4 py-4 font-semibold text-stone-700">
            {{ customer.orderCount }}
          </td>

          <td class="px-4 py-4 font-semibold text-stone-700">
            {{ formatCurrency(customer.lifetimeSpend) }}
          </td>

          <td class="px-4 py-4 text-stone-500">
            {{ formatDate(customer.latestOrderDate) }}
          </td>
        </tr>
      </tbody>
    </table>
  </section>
</template>

<script setup>
import AdminCustomerStatusBadge from './AdminCustomerStatusBadge.vue'
import {
  formatCurrency,
} from '@shared/utils/currency'

defineProps({
  customers: {
    type: Array,
    required: true,
  },
})

function formatDate(value) {
  if (!value) {
    return 'None'
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value))
}
</script>
