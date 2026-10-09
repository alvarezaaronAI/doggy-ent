import { computed, ref } from 'vue'
import {
  fetchAdminOrderById,
  refreshAdminOrderTracking,
  resendAdminOrderEmail,
  updateAdminOrderTracking,
  updateAdminOrderStatus,
} from '../api/adminOrders.api'
import { ORDER_STATUSES } from '../constants/adminOrders.constants'

export function useAdminOrderDetail(orderId) {
  const order = ref(null)
  const loading = ref(false)
  const trackingSaving = ref(false)
  const notificationSaving = ref(false)
  const statusSaving = ref(false)
  const error = ref('')
  const statusMessage = ref('')

  const orderReference = computed(
    () =>
      order.value?.customerReference || order.value?.orderNumber || 'Pending',
  )

  const shippingAddress = computed(() => {
    if (!order.value) return 'N/A'

    return (
      [
        order.value.address1,
        order.value.address2,
        [order.value.city, order.value.state, order.value.zip]
          .filter(Boolean)
          .join(', '),
        order.value.country,
      ]
        .filter(Boolean)
        .join(' · ') || 'N/A'
    )
  })

  const campaignAttributions = computed(() =>
    Array.isArray(order.value?.campaignAttributions)
      ? order.value.campaignAttributions
      : [],
  )

  const sameCustomerOrders = computed(() =>
    Array.isArray(order.value?.sameCustomerOrders)
      ? order.value.sameCustomerOrders
      : [],
  )

  function formatPrice(value) {
    return Number(value || 0).toLocaleString(undefined, {
      style: 'currency',
      currency: 'USD',
    })
  }

  function formatDate(value) {
    if (!value) return 'N/A'
    return new Date(value).toLocaleString()
  }

  function statusClass(status) {
    if (status === ORDER_STATUSES.PENDING) return 'bg-amber-100 text-amber-700'
    if (status === ORDER_STATUSES.PAID) return 'bg-green-100 text-green-700'
    if (status === ORDER_STATUSES.PROCESSING)
      return 'bg-purple-100 text-purple-700'
    if (status === ORDER_STATUSES.SHIPPED)
      return 'bg-indigo-100 text-indigo-700'
    if (status === ORDER_STATUSES.DELIVERED) return 'bg-blue-100 text-blue-700'
    if (status === ORDER_STATUSES.CANCELLED) return 'bg-red-100 text-red-700'
    if (status === ORDER_STATUSES.REFUNDED) return 'bg-stone-200 text-stone-700'
    return 'bg-stone-200 text-stone-700'
  }

  async function updateStatus({ status, note }) {
    if (!order.value?.id || statusSaving.value) return

    statusSaving.value = true
    statusMessage.value = 'Updating order...'

    try {
      order.value = await updateAdminOrderStatus(order.value.id, {
        status,
        note,
      })
      statusMessage.value = 'Order updated.'
    } catch (error) {
      statusMessage.value = error.message || 'Unable to update order.'
    } finally {
      statusSaving.value = false
    }
  }

  async function updateTracking(payload) {
    if (!order.value?.id) return

    trackingSaving.value = true
    statusMessage.value = 'Saving tracking...'

    try {
      const result = await updateAdminOrderTracking(order.value.id, payload)

      order.value = result.order || result
      statusMessage.value = 'Tracking saved.'
    } catch (error) {
      statusMessage.value = error.message || 'Unable to save tracking.'
    } finally {
      trackingSaving.value = false
    }
  }

  async function refreshTracking() {
    if (!order.value?.id) return

    trackingSaving.value = true
    statusMessage.value = 'Refreshing tracking...'

    try {
      const result = await refreshAdminOrderTracking(order.value.id)

      order.value = result.order || result
      statusMessage.value = 'Tracking refreshed.'
    } catch (error) {
      statusMessage.value = error.message || 'Unable to refresh tracking.'
    } finally {
      trackingSaving.value = false
    }
  }

  async function resendOrderEmail(event) {
    if (!order.value?.id) return

    notificationSaving.value = true
    statusMessage.value = 'Sending notification...'

    try {
      const result = await resendAdminOrderEmail(order.value.id, event)

      order.value = result.order || order.value
      statusMessage.value = 'Notification queued.'
    } catch (error) {
      statusMessage.value = error.message || 'Unable to resend notification.'
    } finally {
      notificationSaving.value = false
    }
  }

  async function loadOrder() {
    loading.value = true
    statusMessage.value = ''

    try {
      order.value = await fetchAdminOrderById(orderId)
    } catch (loadError) {
      error.value = loadError.message || 'Unable to load order.'
      order.value = null
    } finally {
      loading.value = false
    }
  }

  return {
    order,
    loading,
    trackingSaving,
    notificationSaving,
    statusSaving,
    statusMessage,
    error,
    orderReference,
    shippingAddress,
    campaignAttributions,
    sameCustomerOrders,
    formatPrice,
    formatDate,
    statusClass,
    updateStatus,
    updateTracking,
    refreshTracking,
    resendOrderEmail,
    loadOrder,
  }
}
