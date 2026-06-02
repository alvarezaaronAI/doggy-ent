<script setup>
import AdminOrderCard from './AdminOrderCard.vue'

defineProps({
  group: {
    type: Object,
    required: true,
  },
  isFirstTimeCustomer: {
    type: Function,
    required: true,
  },
  loading: {
    type: Boolean,
    default: false,
  },
})
</script>

<template>
  <section :id="group.key">
    <div class="mb-4 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 class="text-2xl font-extrabold text-[var(--brand-4)]">{{ group.title }}</h2>
        <p class="mt-1 text-sm text-stone-400">{{ group.description }}</p>
      </div>
      <span class="rounded-full bg-white px-3 py-1 text-xs font-bold text-stone-500 shadow-sm">
        {{ group.countLabel }}
      </span>
    </div>

    <div v-if="loading" class="rounded-2xl border border-stone-200 bg-white p-5 text-sm text-stone-400">
      Loading orders...
    </div>

    <div v-else-if="!group.orders.length" class="rounded-2xl border border-stone-200 bg-white/70 p-5 text-sm text-stone-400">
      No orders in this section.
    </div>

    <div v-else class="grid gap-4">
      <AdminOrderCard
        v-for="order in group.orders"
        :key="order.id"
        :is-first-time-customer="isFirstTimeCustomer(order)"
        :order="order"
      />
    </div>
  </section>
</template>
