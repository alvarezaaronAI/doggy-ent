import { onBeforeUnmount, ref } from 'vue'
import { fetchAccountOrder } from '../api/account.api.js'

export function useAccountOrders() {
  const order = ref(null)
  const loading = ref(false),
    error = ref('')
  let request = 0
  async function loadOrder(reference) {
    const current = ++request
    order.value = null
    loading.value = true
    error.value = ''
    try {
      const result = await fetchAccountOrder(reference)
      if (current === request) order.value = result
    } catch (cause) {
      if (current === request) error.value = cause.message || 'Unable to load order.'
    } finally {
      if (current === request) loading.value = false
    }
  }
  onBeforeUnmount(() => {
    request += 1
  })
  return { error, loadOrder, loading, order }
}
