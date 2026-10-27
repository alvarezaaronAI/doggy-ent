import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { isUsableCheckoutPricing } from '../mappers/taxDetails.mapper.js'

import {
  submitCheckoutPreview,
} from '../api/checkout.api'

export function useCheckoutPreview({
  cartItems,
  appliedPromoCode,
  customer,
  selectedShipping,
  shippingPrice,
  getShippingPayload = null,
}) {
  const checkoutPreviewResult = ref(null)
  const isRefreshingCheckoutPreview = ref(false)
  const checkoutPreviewError = ref('')
  const acceptedPreviewKey = ref(null)

  let checkoutPreviewTimer = null
  let activePreviewRequestId = 0

  function normalizeCountry(country) {
    if (country === 'US') return 'United States'
    return country
  }

  const previewPayload = computed(() => ({
    cartItems: cartItems.value,
    promoCode: appliedPromoCode.value || null,
    customer: { ...customer.value, country: normalizeCountry(customer.value.country) },
    shipping: typeof getShippingPayload === 'function' ? getShippingPayload() : {
      method: selectedShipping.value,
      price: shippingPrice.value,
    },
  }))
  const previewKey = computed(() => JSON.stringify(previewPayload.value))
  const trustedPricing = computed(() => acceptedPreviewKey.value === previewKey.value
    && !isRefreshingCheckoutPreview.value && !checkoutPreviewError.value
    ? checkoutPreviewResult.value?.pricing || null : null)

  async function refreshCheckoutPreview() {
    const requestId = ++activePreviewRequestId
    window.clearTimeout(checkoutPreviewTimer)
    checkoutPreviewResult.value = null
    acceptedPreviewKey.value = null
    checkoutPreviewError.value = ''
    if (!cartItems.value.length) {
      checkoutPreviewResult.value = null
      isRefreshingCheckoutPreview.value = false
      return
    }

    const requestKey = previewKey.value
    isRefreshingCheckoutPreview.value = true

    try {
      const previewResult =
        await submitCheckoutPreview(previewPayload.value)

      if (requestId !== activePreviewRequestId || requestKey !== previewKey.value) {
        return
      }

      if (!isUsableCheckoutPricing(previewResult?.pricing)) throw new Error('Invalid pricing')
      checkoutPreviewResult.value = {
        ...previewResult,
      }
      acceptedPreviewKey.value = requestKey
    }
    catch {
      if (requestId === activePreviewRequestId) {
        checkoutPreviewResult.value = null
        checkoutPreviewError.value = 'Tax and order total could not be updated. Retry before paying.'
      }
    }
    finally {
      if (requestId === activePreviewRequestId) {
        isRefreshingCheckoutPreview.value = false
      }
    }
  }

  function scheduleCheckoutPreview() {
    activePreviewRequestId++
    checkoutPreviewResult.value = null
    acceptedPreviewKey.value = null
    checkoutPreviewError.value = ''
    isRefreshingCheckoutPreview.value = true
    window.clearTimeout(checkoutPreviewTimer)
    checkoutPreviewTimer = window.setTimeout(() => {
      void refreshCheckoutPreview()
    }, 350)
  }
  watch(previewKey, scheduleCheckoutPreview, { flush: 'sync' })
  onBeforeUnmount(() => { activePreviewRequestId++; window.clearTimeout(checkoutPreviewTimer) })

  return {
    checkoutPreviewResult,
    checkoutPreviewError,
    trustedPricing,
    isRefreshingCheckoutPreview,
    refreshCheckoutPreview,
    scheduleCheckoutPreview,
    normalizeCountry,
  }
}
