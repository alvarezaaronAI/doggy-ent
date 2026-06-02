<script setup>
import { RouterLink } from 'vue-router'
import {
  formatAdminOrderDate,
  formatAdminOrderPrice,
  getOrderAgeLabel,
  getOrderCardClass,
  getOrderValueTier,
  getPriorityLabels,
} from '../utils/adminOrders.utils'
import AdminOrderTimeline from './AdminOrderTimeline.vue'

defineProps({
  isFirstTimeCustomer: {
    type: Boolean,
    required: true,
  },
  order: {
    type: Object,
    required: true,
  },
})
</script>

<template>
  <RouterLink
    :to="`/admin/orders/${order.id}`"
    class="block rounded-2xl border p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
    :class="getOrderCardClass(order)"
  >
    <div class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div class="min-w-0 flex-1">
        <div class="flex flex-wrap items-center gap-2">
          <p class="font-extrabold text-[var(--brand-4)]">{{ order.id }}</p>

          <span
            class="rounded-full px-2.5 py-1 text-xs font-bold"
            :class="getOrderValueTier(order).className"
          >
            {{ getOrderValueTier(order).label }}
          </span>

          <span
            v-for="label in getPriorityLabels(order)"
            :key="label.text"
            class="rounded-full px-2.5 py-1 text-xs font-bold"
            :class="label.className"
          >
            {{ label.text }}
          </span>

          <span
            class="rounded-full px-2.5 py-1 text-xs font-bold"
            :class="isFirstTimeCustomer ? 'bg-sky-100 text-sky-700' : 'bg-indigo-100 text-indigo-700'"
          >
            {{ isFirstTimeCustomer ? 'First-time customer' : 'Repeat customer' }}
          </span>
        </div>

        <p class="mt-2 text-sm text-stone-500">
          {{ order.customerName }} · {{ order.customerEmail }}
        </p>
        <div class="mt-3 flex flex-wrap items-end gap-4">
          <div>
            <p class="text-xs font-bold uppercase tracking-[0.14em] text-stone-400">Order total</p>
            <p class="mt-1 text-2xl font-extrabold" :class="getOrderValueTier(order).amountClassName">
              {{ formatAdminOrderPrice(order.total) }}
            </p>
          </div>

          <div>
            <p class="text-xs font-bold uppercase tracking-[0.14em] text-stone-400">Donation</p>
            <p class="mt-1 text-sm font-bold text-[var(--success-1)]">
              {{ formatAdminOrderPrice(0) }}
            </p>
          </div>
        </div>

        <AdminOrderTimeline :order="order" />
      </div>

      <div class="shrink-0 rounded-2xl border border-white/70 bg-white/70 p-4 sm:min-w-56 sm:text-right">
        <p class="text-xs font-bold uppercase tracking-[0.14em] text-stone-400">Placed</p>
        <p class="mt-1 text-base font-extrabold text-[var(--brand-4)]">
          {{ formatAdminOrderDate(order.createdAt) }}
        </p>
        <p class="mt-2 text-xs font-semibold text-stone-500">
          {{ getOrderAgeLabel(order.createdAt) }}
        </p>
      </div>
    </div>
  </RouterLink>
</template>
