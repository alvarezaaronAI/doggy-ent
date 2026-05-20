

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
  const checkoutResult = ref(null)
  const isRefreshingCheckoutPreview = ref(false)

  let checkoutPreviewTimer = null

  async function refreshCheckoutPreview() {
    if (!cartItems.value.length) {
      checkoutResult.value = null
      return
    }

    isRefreshingCheckoutPreview.value = true

    try {
      checkoutResult.value = await submitCheckoutPreview({
        cartItems: cartItems.value,
        promoCode: appliedPromoCode.value || null,
        customer: {
          ...customer.value,
          country:
            customer.value.country === 'US'
              ? 'United States'
              : customer.value.country === 'CA'
                ? 'Canada'
                : customer.value.country,
        },
        shipping: {
          method: selectedShipping.value,
          price: shippingPrice.value,
        },
      })
    }
    catch {
      // Live preview should fail quietly.
    }
    finally {
      isRefreshingCheckoutPreview.value = false
    }
  }

  function scheduleCheckoutPreview() {
    window.clearTimeout(checkoutPreviewTimer)

    checkoutPreviewTimer = window.setTimeout(
      refreshCheckoutPreview,
      350,
    )
  }

  return {
    checkoutResult,
    isRefreshingCheckoutPreview,
    refreshCheckoutPreview,
    scheduleCheckoutPreview,
  }
}