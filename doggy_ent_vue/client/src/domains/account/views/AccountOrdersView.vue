<template>
  <AccountShell
    title="Orders"
    subtitle="Linked account orders and verified-email guest order matches."
  >
    <section class="mb-5 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
      <div class="grid gap-3 md:grid-cols-[minmax(0,1fr)_220px]">
        <label class="block text-sm font-bold text-stone-700">
          Search orders
          <input
            v-model="searchQuery"
            class="mt-2 w-full rounded-xl border border-stone-300 px-4 py-3 text-sm outline-none focus:border-emerald-500"
            type="search"
            placeholder="Reference, product, or status"
          />
        </label>

        <label class="block text-sm font-bold text-stone-700">
          Status
          <select
            v-model="selectedStatus"
            class="mt-2 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-sm outline-none focus:border-emerald-500"
          >
            <option value="all">All statuses</option>
            <option
              v-for="status in availableStatuses"
              :key="status"
              :value="status"
            >
              {{ status }}
            </option>
          </select>
        </label>
      </div>

      <p class="mt-3 text-sm font-semibold text-stone-500">
        Showing {{ visibleOrders.length }} of {{ filteredOrders.length }} matching orders.
      </p>
    </section>

    <div v-if="loading" class="rounded-xl border border-stone-200 bg-white p-6 text-sm text-stone-500">
      Loading orders...
    </div>

    <div v-else-if="visibleOrders.length" class="grid gap-4">
      <AccountOrderCard
        v-for="item in visibleOrders"
        :key="item.customerReference || item.orderNumber"
        :order="item"
      />

      <button
        v-if="visibleOrders.length < filteredOrders.length"
        class="mx-auto mt-2 rounded-xl border border-stone-300 bg-white px-5 py-3 text-sm font-black text-stone-700 transition hover:border-emerald-400 hover:text-emerald-700"
        type="button"
        @click="visibleLimit += PAGE_SIZE"
      >
        Load more orders
      </button>
    </div>

    <div v-else class="rounded-xl border border-stone-200 bg-white p-6 text-sm text-stone-500">
      {{ orders.length ? 'No orders match the current search or filter.' : 'No orders are linked to this account yet.' }}
    </div>

    <p v-if="error" class="mt-5 text-sm font-semibold text-red-600">
      {{ error }}
    </p>
  </AccountShell>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import AccountShell from '../components/AccountShell.vue'
import AccountOrderCard from '../components/AccountOrderCard.vue'
import {
  useAccountOrders,
} from '../composables/useAccountOrders.js'

const {
  error,
  loadOrders,
  loading,
  orders,
} = useAccountOrders()

const PAGE_SIZE = 8
const searchQuery = ref('')
const selectedStatus = ref('all')
const visibleLimit = ref(PAGE_SIZE)

const availableStatuses = computed(() => [
  ...new Set(
    orders.value
      .map((order) => order.status)
      .filter(Boolean),
  ),
])

const filteredOrders = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()

  return orders.value.filter((order) => {
    const matchesStatus =
      selectedStatus.value === 'all'
      || order.status === selectedStatus.value

    const searchable = [
      order.customerReference,
      order.orderNumber,
      order.status,
      ...(order.items || []).map((item) => item.productName),
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()

    return matchesStatus && (!query || searchable.includes(query))
  })
})

const visibleOrders = computed(() =>
  filteredOrders.value.slice(0, visibleLimit.value),
)

watch(
  [searchQuery, selectedStatus],
  () => {
    visibleLimit.value = PAGE_SIZE
  },
)

onMounted(loadOrders)
</script>
