import { ref } from 'vue'

function createCheckoutAttemptId() {
  if (crypto?.randomUUID) {
    return crypto.randomUUID()
  }

  return `checkout_${Date.now()}_${Math.random().toString(36).slice(2)}`
}

export function useCheckout({
  validateCheckout,
  stripePaymentForm,
  submitOrder,
  onSuccess,
  onError,
}) {
  const checkoutStatus = ref('')
  const checkoutStatusType = ref('')
  const isProcessingOrder = ref(false)
  const hasSubmittedOrder = ref(false)
  const paymentCompleted = ref(false)
  const completedPaymentIntent = ref(null)
  const checkoutResult = ref(null)
  const checkoutAttemptId = ref(null)

  async function placeOrder() {
    if (isProcessingOrder.value || hasSubmittedOrder.value) {
      return
    }

    if (!validateCheckout()) {
      return
    }

    isProcessingOrder.value = true
    if (!checkoutAttemptId.value) {
      checkoutAttemptId.value = createCheckoutAttemptId()
    }

    try {
      if (!paymentCompleted.value) {
        const paymentResult = await stripePaymentForm.value.submitPayment()

        paymentCompleted.value = true
        completedPaymentIntent.value = paymentResult
      }
    }
    catch (error) {
      checkoutStatusType.value = 'error'

      checkoutStatus.value = (
        error.message
        || 'Payment failed. Please try again.'
      )

      hasSubmittedOrder.value = false
      paymentCompleted.value = false
      completedPaymentIntent.value = null
      checkoutAttemptId.value = null
      isProcessingOrder.value = false

      if (onError) {
        onError(error)
      }

      return
    }

    checkoutStatus.value = ''

    try {
      checkoutResult.value = await submitOrder({
        completedPaymentIntent:
          completedPaymentIntent.value,

        stripePaymentIntentId:
          completedPaymentIntent.value?.paymentIntentId
          || completedPaymentIntent.value?.id
          || null,

        checkoutAttemptId:
          checkoutAttemptId.value,
      })

      hasSubmittedOrder.value = true
      if (onSuccess) {
        await onSuccess({
          result: checkoutResult.value,
          completedPaymentIntent:
            completedPaymentIntent.value,
        })
      }

      checkoutStatusType.value = 'success'

      checkoutStatus.value = (
        'Order placed successfully! Redirecting...'
      )
    }
    catch (error) {
      checkoutStatusType.value = 'error'

      checkoutStatus.value = (
        error.message
        || 'Checkout failed. Please try again.'
      )

      hasSubmittedOrder.value = false
      checkoutResult.value = null

      if (onError) {
        onError(error)
      }
    }
    finally {
      isProcessingOrder.value = false
    }
  }

  return {
    checkoutStatus,
    checkoutStatusType,
    isProcessingOrder,
    hasSubmittedOrder,
    paymentCompleted,
    completedPaymentIntent,
    checkoutResult,
    checkoutAttemptId,
    placeOrder,
  }
}