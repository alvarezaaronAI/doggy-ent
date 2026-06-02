<script setup>
import {
  ORDER_STATUS_FILTER_OPTIONS,
} from '../constants/adminOrders.constants'

defineProps({
  filteredCount: {
    type: Number,
    required: true,
  },
  orderCount: {
    type: Number,
    required: true,
  },
})

const orderSearchQuery = defineModel('orderSearchQuery', {
  type: String,
  required: true,
})

const orderStatusFilter = defineModel('orderStatusFilter', {
  type: String,
  required: true,
})

const emit = defineEmits([
  'clear',
])
</script>

<template>
  <div class="mt-6 rounded-2xl border border-[var(--brand-3)] bg-white p-5 shadow-sm">
    <div class="grid gap-3 lg:grid-cols-[1.4fr_0.8fr_auto] lg:items-end">
      <label class="block">
        <span class="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-stone-400">Search orders</span>
        <input
          v-model="orderSearchQuery"
          class="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 outline-none focus:border-emerald-400"
          placeholder="Search order ID, customer, email, phone, city..."
        />
      </label>

      <label class="block">
        <span class="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-stone-400">Status</span>
        <select
          v-model="orderStatusFilter"
          class="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 outline-none focus:border-emerald-400"
        >
          <option
            v-for="option in ORDER_STATUS_FILTER_OPTIONS"
            :key="option.value"
            :value="option.value"
          >
            {{ option.label }}
          </option>
        </select>
      </label>

      <button
        type="button"
        class="rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm font-bold text-[var(--brand-4)] transition hover:border-emerald-400 hover:bg-emerald-50"
        @click="emit('clear')"
      >
        Clear
      </button>
    </div>

    <p class="mt-3 text-xs font-semibold text-stone-400">
      Showing {{ filteredCount }} of {{ orderCount }} orders.
    </p>
  </div>
</template>
