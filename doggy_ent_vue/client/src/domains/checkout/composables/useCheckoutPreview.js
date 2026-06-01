import { ref } from 'vue'

import {
  submitCheckoutPreview,
} from '../api/checkout.api'

export function useCheckoutPreview({
  cartItems,
  appliedPromoCode,
  customer,
  selectedShipping,
  shippingPrice,
}) {
  const checkoutPreviewResult = ref(null)
  const isRefreshingCheckoutPreview = ref(false)

  let checkoutPreviewTimer = null
  let activePreviewRequestId = 0

  function normalizeCountry(country) {
    if (country === 'US') return 'United States'
    if (country === 'CA') return 'Canada'
    return country
  }

  async function refreshCheckoutPreview() {
    if (!cartItems.value.length) {
      checkoutPreviewResult.value = null
      isRefreshingCheckoutPreview.value = false
      return
    }

    const requestId = ++activePreviewRequestId

    isRefreshingCheckoutPreview.value = true

    try {
      const previewResult =
        await submitCheckoutPreview({
          cartItems: cartItems.value,

          promoCode:
            appliedPromoCode.value || null,

          customer: {
            ...customer.value,
            country: normalizeCountry(customer.value.country),
          },

          shipping: {
            method: selectedShipping.value,
            price: shippingPrice.value,
          },
        })

      if (requestId !== activePreviewRequestId) {
        return
      }

      console.log(
        '[checkout-preview] Updated pricing preview:',
        previewResult,
      )

      checkoutPreviewResult.value = {
        ...previewResult,
      }
    }
    catch (error) {
      console.error(
        '[checkout-preview] Failed to refresh preview.',
        error,
      )
      if (requestId === activePreviewRequestId) {
        checkoutPreviewResult.value = null
      }
    }
    finally {
      if (requestId === activePreviewRequestId) {
        isRefreshingCheckoutPreview.value = false
      }
    }
  }

  function scheduleCheckoutPreview() {
    window.clearTimeout(checkoutPreviewTimer)
    checkoutPreviewTimer = window.setTimeout(() => {
      void refreshCheckoutPreview()
    }, 350)
  }

  return {
    checkoutPreviewResult,
    isRefreshingCheckoutPreview,
    refreshCheckoutPreview,
    scheduleCheckoutPreview,
    normalizeCountry,
  }
}