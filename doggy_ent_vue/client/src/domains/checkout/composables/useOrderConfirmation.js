import { onBeforeUnmount, ref, watch } from 'vue'
import { fetchCheckoutOrder } from '../api/checkout.api.js'
import { restoreCheckoutReceipt } from '../api/checkoutRecovery.api.js'
export function useOrderConfirmation(reference) {
  const order = ref(null), loading = ref(true), error = ref('')
  let generation = 0
  async function load() {
    const current = ++generation
    const requestedReference = reference.value
    order.value = null; error.value = ''; loading.value = true
    if (!reference.value || reference.value === 'pending') { error.value = 'Your order reference is not available. Do not pay again. Contact our team if payment was completed.'; loading.value = false; return }
    try { const data = await fetchCheckoutOrder(requestedReference); if (current === generation) order.value = data }
    catch (failure) {
      if (current === generation && await restoreCheckoutReceipt(requestedReference) && current === generation) {
        try { const data = await fetchCheckoutOrder(requestedReference); if (current === generation) order.value = data }
        catch { if (current === generation) error.value = 'Your order details are not available right now. Do not pay again.' }
      } else if (current === generation) error.value = failure.message
    }
    finally { if (current === generation) loading.value = false }
  }
  watch(reference, load, { immediate: true })
  onBeforeUnmount(() => { generation++; order.value = null })
  return { order, loading, error, load }
}
