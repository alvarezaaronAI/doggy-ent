import { computed, ref } from 'vue'
import {
  fetchAdminOrderStats,
  fetchAdminOrders,
} from '../api/adminOrders.api'
import {
  DEFAULT_ORDER_STATS,
  ORDER_FILTER_ALL,
  ORDER_GROUP_CONFIG,
  ORDER_STATUSES,
} from '../constants/adminOrders.constants'

export function useAdminOrders() {
  const orders = ref([])
  const loading = ref(false)
  const orderSearchQuery = ref('')
  const orderStatusFilter = ref(ORDER_FILTER_ALL)
  const stats = ref({ ...DEFAULT_ORDER_STATS })

  const filteredOrders = computed(() => {
    const query = orderSearchQuery.value.trim().toLowerCase()

    return orders.value.filter((order) => {
      const matchesQuery = !query || [
        order.id,
        order.orderNumber,
        order.customerName,
        order.customerEmail,
        order.status,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query))

      const matchesStatus = orderStatusFilter.value === ORDER_FILTER_ALL
        || order.status === orderStatusFilter.value
        || order.paymentStatus === orderStatusFilter.value
        || order.fulfillmentStatus === orderStatusFilter.value

      return matchesQuery && matchesStatus
    })
  })

  const cancelledOrders = computed(() =>
    filteredOrders.value.filter(
      (order) => order.status === ORDER_STATUSES.CANCELLED,
    ),
  )

  const fulfilledOrders = computed(() =>
    filteredOrders.value.filter(
      (order) => order.status === ORDER_STATUSES.DELIVERED,
    ),
  )

  const readyToFulfillOrders = computed(() =>
    filteredOrders.value.filter((order) => [
      ORDER_STATUSES.PAID,
      ORDER_STATUSES.PROCESSING,
      ORDER_STATUSES.SHIPPED,
    ].includes(order.status)),
  )

  const needsAttentionOrders = computed(() =>
    filteredOrders.value.filter((order) => [
      ORDER_STATUSES.PENDING,
    ].includes(order.status)),
  )

  const orderBuckets = computed(() => ({
    'needs-attention': needsAttentionOrders.value,
    'ready-to-fulfill': readyToFulfillOrders.value,
    fulfilled: fulfilledOrders.value,
    cancelled: cancelledOrders.value,
  }))

  const orderGroups = computed(() =>
    ORDER_GROUP_CONFIG.map((group) => {
      const groupOrders = orderBuckets.value[group.key] || []

      return {
        ...group,
        countLabel: `${groupOrders.length} ${group.countSuffix}`,
        orders: groupOrders,
      }
    }),
  )

  function clearOrderFilters() {
    orderSearchQuery.value = ''
    orderStatusFilter.value = ORDER_FILTER_ALL
  }

  async function loadOrders() {
    loading.value = true

    try {
      orders.value = await fetchAdminOrders()
    } catch {
      // Preserve the previous view behavior: failed loads stay quiet.
    } finally {
      loading.value = false
    }
  }

  async function loadStats() {
    try {
      stats.value = {
        ...stats.value,
        ...await fetchAdminOrderStats(),
      }
    } catch {
      // Preserve the previous view behavior: failed stats stay quiet.
    }
  }

  async function loadPageData() {
    await Promise.all([
      loadOrders(),
      loadStats(),
    ])
  }

  function isFirstTimeCustomer(order) {
    const email = String(order.customerEmail || '').trim().toLowerCase()

    if (!email) return true

    const matchingOrders = orders.value.filter((candidate) => {
      const candidateEmail = String(candidate.customerEmail || '').trim().toLowerCase()

      return email && candidateEmail === email
    })

    return matchingOrders.length <= 1
  }

  return {
    cancelledOrders,
    clearOrderFilters,
    filteredOrders,
    fulfilledOrders,
    isFirstTimeCustomer,
    loadOrders,
    loadPageData,
    loadStats,
    loading,
    needsAttentionOrders,
    orderGroups,
    orderSearchQuery,
    orderStatusFilter,
    orders,
    readyToFulfillOrders,
    stats,
  }
}
