<template>
  <RouterLink
    :to="{ name: 'account-orders', query: { order: orderReference(order) } }"
    class="account-order-card"
  >
    <div class="account-row">
      <strong>{{ orderReference(order) }}</strong
      ><AccountStatusBadge :status="order.status" />
    </div>
    <div class="mt-2 flex items-center justify-between gap-4 text-sm">
      <span class="account-muted"
        >{{ formatAccountDate(order.createdAt) }} &middot;
        {{ orderItemCount(order) }}
        {{ orderItemCount(order) === 1 ? 'item' : 'items' }}</span
      ><span>{{
        formatCurrency(order.total, { currency: order.currency || 'USD' })
      }}</span>
    </div>
    <p class="account-muted mt-2 truncate text-sm">
      {{ (order.items || []).map((item) => item.productName).join(', ') }}
    </p>
  </RouterLink>
</template>
<script setup>
import AccountStatusBadge from './AccountStatusBadge.vue'
import { formatCurrency } from '@shared/utils/currency'
import {
  formatAccountDate,
  orderItemCount,
  orderReference,
} from '../utils/accountFormatting.js'
defineProps({ order: { type: Object, required: true } })
</script>
