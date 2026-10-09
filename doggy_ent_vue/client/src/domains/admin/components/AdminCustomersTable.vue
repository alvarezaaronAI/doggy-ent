<script setup>
import { useRouter } from 'vue-router'
import AdminIcon from './AdminIcon.vue'
import AdminCustomerStatusBadge from './AdminCustomerStatusBadge.vue'
import { formatCurrency } from '@shared/utils/currency'
import { formatAdminOrderDate } from '../utils/adminOrders.utils'
defineProps({ customers: { type: Array, required: true } })
const router = useRouter()
function openCustomer(event, id) {
  if (
    event.target.closest('a, button, input, select') ||
    window.getSelection()?.toString()
  )
    return
  const url = router.resolve('/admin/customers/' + encodeURIComponent(id)).href
  if (event.ctrlKey || event.metaKey)
    window.open(url, '_blank', 'noopener,noreferrer')
  else router.push(url)
}
</script>
<template>
  <p v-if="!customers.length" class="admin-state">
    No customers match your search.
  </p>
  <div v-else class="admin-table-wrap">
    <table class="admin-table">
      <thead>
        <tr>
          <th>Customer</th>
          <th>Account</th>
          <th>Orders</th>
          <th>Lifetime spend</th>
          <th>Latest order</th>
          <th><span class="sr-only">Open customer</span></th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="customer in customers"
          :key="customer.id"
          class="admin-clickable-row"
          @click="openCustomer($event, customer.id)"
        >
          <td data-label="Customer">
            <RouterLink
              class="admin-link font-semibold"
              :to="'/admin/customers/' + encodeURIComponent(customer.id)"
              :aria-label="
                'Open ' + (customer.name || 'Customer') + ', ' + customer.email
              "
              >{{ customer.name || 'Customer' }}</RouterLink
            >
            <p class="text-sm break-all mt-2">{{ customer.email }}</p>
            <p class="admin-muted text-xs break-all mt-1">
              ID: {{ customer.id }}
            </p>
            <p class="admin-muted text-xs">
              Joined {{ formatAdminOrderDate(customer.createdAt) }}
            </p>
          </td>
          <td data-label="Account">
            <AdminCustomerStatusBadge :status="customer.status" />
            <p class="admin-muted text-xs mt-2">
              {{ customer.role }} ·
              {{
                customer.emailVerified ? 'Verified email' : 'Unverified email'
              }}
            </p>
          </td>
          <td data-label="Orders">{{ customer.orderCount }}</td>
          <td data-label="Lifetime spend">
            {{ formatCurrency(customer.lifetimeSpend) }}
          </td>
          <td data-label="Latest order">
            {{
              customer.latestOrderDate
                ? formatAdminOrderDate(customer.latestOrderDate)
                : 'No orders yet'
            }}
          </td>
          <td aria-hidden="true"><AdminIcon name="next" /></td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
