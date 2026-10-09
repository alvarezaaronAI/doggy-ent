<script setup>
import AdminCustomerStatusBadge from './AdminCustomerStatusBadge.vue'
import { formatCurrency } from '@shared/utils/currency'
import { formatAdminOrderDate } from '../utils/adminOrders.utils'
defineProps({ customers: { type: Array, required: true } })
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
        </tr>
      </thead>
      <tbody>
        <tr v-for="customer in customers" :key="customer.id">
          <td data-label="Customer">
            <RouterLink
              class="admin-link font-semibold"
              :to="'/admin/customers/' + customer.id"
              >{{ customer.name || 'Customer' }}</RouterLink
            >
            <p class="admin-muted text-xs">{{ customer.email }}</p>
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
        </tr>
      </tbody>
    </table>
  </div>
</template>
