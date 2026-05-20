

import { ref } from 'vue'

import {
  validatePromoCode,
} from '../../promos/api/promos.api'

export function useCheckoutPromos({
  customer,
  cartItems,
  subtotal,
}) {
  const promoCode = ref('')
  const appliedPromoCode = ref('')
  const appliedPromoDiscount = ref(0)
  const promoMessage = ref(
    'Enter a promo code if you have one.',
  )
  const promoStatus = ref('idle')

  async function applyPromoCode() {
    const normalizedCode = (
      promoCode.value
        .trim()
        .toUpperCase()
    )

    if (!normalizedCode) {
      appliedPromoCode.value = ''
      appliedPromoDiscount.value = 0
      promoStatus.value = 'error'

      promoMessage.value = (
        'Enter a promo code to apply a discount.'
      )

      return
    }

    promoStatus.value = 'checking'
    promoMessage.value = 'Checking promo code...'

    try {
      const data = await validatePromoCode({
        code: normalizedCode,

        customerEmail:
          customer.value.email,

        cart: {
          items: cartItems.value,
          subtotal: subtotal.value,
        },
      })

      appliedPromoCode.value = normalizedCode

      appliedPromoDiscount.value = Number(
        data.discountAmount || 0,
      )

      promoCode.value = normalizedCode
      promoStatus.value = 'success'

      promoMessage.value = (
        data.message
        || `Promo code ${normalizedCode} applied successfully.`
      )
    }
    catch (error) {
      appliedPromoCode.value = ''
      appliedPromoDiscount.value = 0
      promoStatus.value = 'error'

      promoMessage.value = (
        error.message
        || 'Promo validation is not available yet. Please try again later.'
      )
    }
  }

  function clearPromo() {
    promoCode.value = ''
    appliedPromoCode.value = ''
    appliedPromoDiscount.value = 0
    promoStatus.value = 'idle'

    promoMessage.value = (
      'Enter a promo code if you have one.'
    )
  }

  return {
    promoCode,
    appliedPromoCode,
    appliedPromoDiscount,
    promoMessage,
    promoStatus,
    applyPromoCode,
    clearPromo,
  }
}
