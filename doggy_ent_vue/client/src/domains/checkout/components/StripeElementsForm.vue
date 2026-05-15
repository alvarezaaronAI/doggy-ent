<script setup>
import { onMounted, ref } from 'vue'

import { stripePromise } from '../services/stripe.js'
import { createPaymentIntent } from '../services/payment.service.js'

const emit = defineEmits(['card-complete'])

const stripeInstance = ref(null)
const elementsInstance = ref(null)
const cardElement = ref(null)
const cardElementContainer = ref(null)

const cardholderName = ref('')
const stripeReady = ref(false)

defineExpose({
  async submitPayment() {
    if (!stripeInstance.value || !cardElement.value) {
      throw new Error('Stripe has not initialized yet.')
    }

    if (!cardholderName.value.trim()) {
      throw new Error('Please enter the cardholder name.')
    }

    const paymentIntentResponse = await createPaymentIntent({
      items: [
        {
          id: 1,
          name: 'Doggy Ent Treats',
          quantity: 1,
        },
      ],
      amount: 2499,
    })

    const { clientSecret } = paymentIntentResponse

    const paymentResult = await stripeInstance.value.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardElement.value,
        billing_details: {
          name: cardholderName.value,
        },
      },
    })

    if (paymentResult.error) {
      throw new Error(paymentResult.error.message)
    }

    if (paymentResult.paymentIntent?.status !== 'succeeded') {
      throw new Error('Payment could not be completed.')
    }

    return {
      paymentIntentId: paymentResult.paymentIntent.id,
      status: paymentResult.paymentIntent.status,
    }
  },
})

onMounted(async () => {
  stripeInstance.value = await stripePromise

  elementsInstance.value = stripeInstance.value.elements()

  cardElement.value = elementsInstance.value.create('card', {
    style: {
      base: {
        color: '#1c1917',
        fontFamily: 'Inter, system-ui, sans-serif',
        fontSize: '16px',
        lineHeight: '24px',
        '::placeholder': {
          color: '#78716c',
        },
      },
      invalid: {
        color: '#dc2626',
      },
    },
    hidePostalCode: true,
  })

  cardElement.value.mount(cardElementContainer.value)

  cardElement.value.on('change', (event) => {
    emit('card-complete', !!event.complete)
  })

  stripeReady.value = true
})
</script>

<template>
  <div class="bg-white p-5 md:p-6">
    <div class="flex items-start justify-between gap-4">
      <div>
        <p class="text-sm text-stone-500">
          Your payment information is securely encrypted and processed through Stripe.
        </p>
      </div>

      <div class="hidden items-center gap-2 text-xs font-semibold text-stone-400 sm:inline-flex">
        <i class="fa-solid fa-lock text-emerald-500"></i>
        Secure Checkout
      </div>
    </div>

    <div class="mt-6 grid gap-4">
      <div>
        <label class="mb-2 block text-xs font-extrabold uppercase tracking-[0.08em] text-stone-700">
          Name on card
        </label>

        <input
          v-model="cardholderName"
          type="text"
          placeholder="John Doe"
          class="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-stone-900 outline-none transition focus:border-emerald-400 focus:bg-white"
        />
      </div>

      <div>
        <label class="mb-2 block text-xs font-extrabold uppercase tracking-[0.08em] text-stone-700">
          Card information
        </label>

        <div class="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-4 transition focus-within:border-emerald-400 focus-within:bg-white">
          <div ref="cardElementContainer"></div>
        </div>
      </div>
    </div>

    <div class="mt-5 flex flex-wrap items-center gap-2 text-xs font-medium text-stone-500">
      <span class="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white px-3 py-2">
        <i class="fa-brands fa-cc-visa"></i>
        Visa
      </span>

      <span class="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white px-3 py-2">
        <i class="fa-brands fa-cc-mastercard"></i>
        Mastercard
      </span>

      <span class="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white px-3 py-2">
        <i class="fa-brands fa-cc-amex"></i>
        Amex
      </span>

      <span class="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white px-3 py-2">
        <i class="fa-solid fa-shield-check text-emerald-500"></i>
        Stripe Secured
      </span>
    </div>

    <div
      v-if="!stripeReady"
      class="mt-4 text-sm font-semibold text-stone-500"
    >
      Initializing secure payment fields...
    </div>
  </div>
</template>