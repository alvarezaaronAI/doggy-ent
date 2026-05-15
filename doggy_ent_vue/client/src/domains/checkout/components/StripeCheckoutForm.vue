

<script setup>
import { onMounted } from 'vue'

import { createPaymentIntent } from '../../services/payment.service.js'

const testCheckout = async () => {
  try {
    const response = await createPaymentIntent({
      items: [
        {
          id: 1,
          name: 'Beef Jerky Treats',
          quantity: 1,
        },
      ],
      amount: 2499,
    })

    console.log('Stripe checkout response:', response)
  } catch (error) {
    console.error('Stripe checkout form error:', error)
  }
}

onMounted(() => {
  testCheckout()
})
</script>

<template>
  <div>
    <h2>Stripe Checkout Form</h2>
    <p>Testing payment intent connection...</p>
  </div>
</template>