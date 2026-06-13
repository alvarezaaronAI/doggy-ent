import { ref } from 'vue'
import {
  fetchAccountOrder,
  fetchAccountOrders,
} from '../api/account.api.js'

export function useAccountOrders() {
  const orders = ref([])
  const order = ref(null)
  const loading = ref(false)
  const error = ref('')

  async function loadOrders() {
    loading.value = true
    error.value = ''

    try {
      orders.value = await fetchAccountOrders()
    }
    catch (loadError) {
      error.value = loadError.message || 'Unable to load orders.'
    }
    finally {
      loading.value = false
    }
  }

  async function loadOrder(reference) {
    loading.value = true
    error.value = ''

    try {
      order.value = await fetchAccountOrder(reference)
    }
    catch (loadError) {
      error.value = loadError.message || 'Unable to load order.'
    }
    finally {
      loading.value = false
    }
  }

  return {
    error,
    loadOrder,
    loadOrders,
    loading,
    order,
    orders,
  }
}
