import { ref, watch } from 'vue'

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
  const promoValidationMeta = ref(null)
  const activePromoRequestId = ref(0)
  const appliedPromoEmail = ref('')

  function normalizeCustomerEmail(value) {
    return String(value || '').trim().toLowerCase()
  }

  async function applyPromoCode() {
    const normalizedCode = (
      promoCode.value
        .trim()
        .toUpperCase()
    )

    if (!normalizedCode) {
      appliedPromoCode.value = ''
      appliedPromoDiscount.value = 0
      promoValidationMeta.value = null
      promoStatus.value = 'error'

      promoMessage.value = (
        'Enter a promo code to apply a discount.'
      )

      return
    }

    const normalizedEmail = normalizeCustomerEmail(
      customer.value.email,
    )

    if (!normalizedEmail || !normalizedEmail.includes('@')) {
      appliedPromoCode.value = ''
      appliedPromoDiscount.value = 0
      promoValidationMeta.value = null
      appliedPromoEmail.value = ''
      promoStatus.value = 'error'
      promoMessage.value = 'Enter your email first so we can check this promo.'
      return
    }

    const requestId = activePromoRequestId.value + 1
    activePromoRequestId.value = requestId

    promoStatus.value = 'checking'
    promoMessage.value = 'Checking promo code...'

    try {
      const data = await validatePromoCode({
        code: normalizedCode,

        customerEmail: normalizedEmail,

        cart: {
          items: cartItems.value,
          subtotal: subtotal.value,
        },
      })

      if (requestId !== activePromoRequestId.value) {
        return
      }

      appliedPromoCode.value = normalizedCode

      appliedPromoDiscount.value = Number(
        data.discountAmount || 0,
      )
      promoValidationMeta.value = {
        promoId: data.promoId || null,
        promoCode: normalizedCode,
        customerEmail: normalizedEmail,
        discountType: data.discountType || null,
        discountAmount: Number(
          data.discountAmount || 0,
        ),
      }

      promoCode.value = normalizedCode
      appliedPromoEmail.value = normalizedEmail
      promoStatus.value = 'success'

      promoMessage.value = (
        data.message
        || `Promo code ${normalizedCode} applied successfully.`
      )
    }
    catch (error) {
      if (requestId !== activePromoRequestId.value) {
        return
      }
      appliedPromoCode.value = ''
      appliedPromoDiscount.value = 0
      promoValidationMeta.value = null
      appliedPromoEmail.value = ''
      promoStatus.value = 'error'

      promoMessage.value = (
        error.message
        || 'Promo validation is not available yet. Please try again later.'
      )
    }
  }

  function clearPromo({
    message = 'Enter a promo code if you have one.',
    status = 'idle',
  } = {}) {
    activePromoRequestId.value += 1
    promoCode.value = ''
    appliedPromoCode.value = ''
    appliedPromoDiscount.value = 0
    promoValidationMeta.value = null
    appliedPromoEmail.value = ''
    promoStatus.value = status
    promoMessage.value = message
  }

  watch(
    () => customer.value.email,
    (email) => {
      const normalizedEmail = normalizeCustomerEmail(email)

      if (
        appliedPromoCode.value
        && appliedPromoEmail.value
        && normalizedEmail !== appliedPromoEmail.value
      ) {
        clearPromo({
          status: 'idle',
          message: 'Promo cleared because the email changed. Re-enter the code to check eligibility.',
        })
      }
    },
  )

  return {
    promoCode,
    appliedPromoCode,
    appliedPromoDiscount,
    promoMessage,
    promoStatus,
    promoValidationMeta,
    appliedPromoEmail,
    activePromoRequestId,
    applyPromoCode,
    clearPromo,
  }
}
