

import { ref } from 'vue'

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

  async function placeOrder() {
    if (isProcessingOrder.value || hasSubmittedOrder.value) {
      return
    }

    if (!validateCheckout()) {
      return
    }

    isProcessingOrder.value = true
    hasSubmittedOrder.value = true

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
      isProcessingOrder.value = false

      if (onError) {
        onError(error)
      }

      return
    }

    checkoutStatus.value = ''

    try {
      const result = await submitOrder({
        completedPaymentIntent:
          completedPaymentIntent.value,
      })

      if (onSuccess) {
        await onSuccess({
          result,
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
    placeOrder,
  }
}