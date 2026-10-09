<script setup>
import AdminMetrics from './AdminMetrics.vue'
import AdminIcon from './AdminIcon.vue'
import { formatCurrency } from '@shared/utils/currency'
defineProps({ analytics: Object, isLoading: Boolean })
const emit = defineEmits(['close'])
</script>
<template>
  <section>
    <button class="admin-link mb-6" @click="emit('close')">
      <AdminIcon name="back" /> Back to promos
    </button>
    <h2 class="text-xl font-semibold">
      {{ analytics?.promo?.code || 'Promo performance' }}
    </h2>
    <p v-if="isLoading" class="admin-state">Loading promo analytics...</p>
    <p v-else-if="!analytics" class="admin-state">
      Analytics are unavailable. Return to the list and try again.
    </p>
    <template v-else>
      <AdminMetrics
        :items="[
          { label: 'Redemptions', value: analytics.summary.totalUses },
          {
            label: 'Attributed order value',
            value: formatCurrency(analytics.summary.totalRevenue),
          },
          {
            label: 'Discount given',
            value: formatCurrency(analytics.summary.totalDiscountGiven),
          },
          {
            label: 'Average order value',
            value: formatCurrency(analytics.summary.averageOrderValue),
          },
        ]"
      />
      <h3 class="text-lg font-semibold mb-4">Redemption history</h3>
      <p v-if="!analytics.usages.length" class="admin-state">
        No redemptions recorded.
      </p>
      <div v-else class="admin-table-wrap">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Order</th>
              <th>Subtotal</th>
              <th>Discount</th>
              <th>Redeemed</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="usage in analytics.usages" :key="usage.id">
              <td data-label="Customer">
                {{ usage.customerEmail || 'Guest' }}
              </td>
              <td data-label="Order">
                <RouterLink
                  v-if="usage.orderId"
                  class="admin-link"
                  :to="'/admin/orders/' + usage.orderId"
                  >{{ usage.orderId }}</RouterLink
                ><span v-else>Unavailable</span>
              </td>
              <td data-label="Subtotal">
                {{ formatCurrency(usage.subtotalAmount) }}
              </td>
              <td data-label="Discount">
                {{ formatCurrency(usage.discountAmount) }}
              </td>
              <td data-label="Redeemed">
                {{ new Date(usage.createdAt).toLocaleString() }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
  </section>
</template>
