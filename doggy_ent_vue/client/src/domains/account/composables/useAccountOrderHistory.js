import { computed, onActivated, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { fetchAccountOrder, fetchAccountOrders } from '../api/account.api.js'
import { ORDER_HISTORY_PAGE_SIZE } from '../constants/account.constants.js'
import { orderReference } from '../utils/accountFormatting.js'
import { filterAccountOrders, groupAccountOrders } from '../utils/orderHistory.js'

export function useAccountOrderHistory() {
  const route = useRoute()
  const orders = ref([])
  const loading = ref(false),
    error = ref('')
  const query = ref(''),
    status = ref(''),
    limit = ref(ORDER_HISTORY_PAGE_SIZE)
  const selectedKey = ref(''),
    detail = ref(null),
    detailLoading = ref(false),
    detailError = ref('')
  const showMobileDetail = ref(false),
    expanded = ref({})
  let detailRequest = 0
  const statuses = computed(() => [...new Set(orders.value.map((order) => order.status))])
  const filtered = computed(() => filterAccountOrders(orders.value, query.value, status.value))
  const visible = computed(() => filtered.value.slice(0, limit.value))
  const groups = computed(() => groupAccountOrders(visible.value))

  async function loadDetail() {
    const key = selectedKey.value,
      request = ++detailRequest
    detail.value = null
    detailError.value = ''
    detailLoading.value = Boolean(key)
    if (!key) return
    try {
      const result = await fetchAccountOrder(key)
      if (request === detailRequest) detail.value = result
    } catch (cause) {
      if (request === detailRequest)
        detailError.value = cause.message || 'Unable to load this order.'
    } finally {
      if (request === detailRequest) detailLoading.value = false
    }
  }
  function selectOrder(key, mobile = true) {
    selectedKey.value = key
    if (mobile) showMobileDetail.value = true
    const group = groups.value.find((entry) =>
      entry.orders.some((order) => orderReference(order) === key)
    )
    if (group) expanded.value[group.key] = true
  }
  function selectRequestedOrder() {
    const key = typeof route.query.order === 'string' ? route.query.order : ''
    const index = orders.value.findIndex((order) => orderReference(order) === key)
    if (index < 0) return
    query.value = ''
    status.value = ''
    limit.value = Math.max(ORDER_HISTORY_PAGE_SIZE, index + 1)
    selectOrder(key)
  }
  async function loadOrders() {
    loading.value = true
    error.value = ''
    try {
      const previousSelection = selectedKey.value
      orders.value = await fetchAccountOrders()
      selectRequestedOrder()
      if (previousSelection && selectedKey.value === previousSelection) await loadDetail()
    } catch (cause) {
      error.value = cause.message || 'Unable to load your orders.'
    } finally {
      loading.value = false
    }
  }
  watch(
    [query, status],
    () => {
      limit.value = ORDER_HISTORY_PAGE_SIZE
      showMobileDetail.value = false
    },
    { flush: 'sync' }
  )
  watch(visible, (list) => {
    if (!list.some((order) => orderReference(order) === selectedKey.value))
      selectOrder(orderReference(list[0]), false)
    const first = groups.value[0]
    if (first && expanded.value[first.key] === undefined) expanded.value[first.key] = true
  })
  watch(selectedKey, loadDetail)
  watch(
    () => route.query.order,
    () => {
      if (route.name === 'account-orders') selectRequestedOrder()
    }
  )
  onMounted(loadOrders)
  onActivated(() => {
    if (orders.value.length) selectRequestedOrder()
  })
  onBeforeUnmount(() => {
    detailRequest += 1
  })
  return {
    orders,
    loading,
    error,
    query,
    status,
    limit,
    statuses,
    filtered,
    visible,
    groups,
    expanded,
    selectedKey,
    detail,
    detailLoading,
    detailError,
    showMobileDetail,
    selectOrder,
    loadOrders,
    loadDetail,
  }
}
