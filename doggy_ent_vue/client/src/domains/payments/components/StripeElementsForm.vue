<script setup>
import { onMounted, onBeforeUnmount, ref } from 'vue'

import { stripePromise } from '@payments/services/stripe.js'
import { createPaymentIntent } from '@payments/services/payment.service.js'

const props = defineProps({
  preview: Boolean,
  cartItems: {
    type: Array,
    default: () => [],
  },
  checkoutTotal: {
    type: Number,
    default: 0,
  },
  customer: {
    type: Object,
    default: () => ({}),
  },
  promoCode: {
    type: String,
    default: '',
  },
  shipping: {
    type: Object,
    default: () => ({}),
  },
})

const emit = defineEmits(['card-complete'])

const stripeInstance = ref(null)
const elementsInstance = ref(null)
const cardElement = ref(null)
const cardElementContainer = ref(null)

const cardholderName = ref('')
const stripeReady = ref(false)
const initializationError = ref('')

defineExpose({
  async submitPayment() {
    if (!stripeInstance.value || !cardElement.value) {
      throw new Error('Stripe has not initialized yet.')
    }

    if (!cardholderName.value.trim()) {
      throw new Error('Please enter the cardholder name.')
    }

    const paymentIntentResponse = await createPaymentIntent({
      cartItems: props.cartItems,
      promoCode: props.promoCode || null,
      customer: props.customer,
      shipping: props.shipping,
    })

    const { clientSecret } = paymentIntentResponse
    if (Math.round(Number(paymentIntentResponse.pricing?.total) * 100) !== Math.round(props.checkoutTotal * 100)) throw new Error('Your total changed. Review the refreshed order before paying.')

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
      checkoutProof: paymentIntentResponse.checkoutProof,
    }
  },
})

onMounted(async () => {
  if (props.preview) return
  try {
  stripeInstance.value = await stripePromise
  if (!cardElementContainer.value) return
  if (!stripeInstance.value) throw new Error('Payment provider unavailable.')

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
  } catch {
    initializationError.value = 'Secure payment fields could not load. Reload this page before paying.'
    emit('card-complete', false)
  }
})
onBeforeUnmount(() => cardElement.value?.destroy())
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
      <div class="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3">
        <div class="flex items-center justify-between gap-3 text-sm">
          <span class="font-semibold text-stone-700">
            {{ props.cartItems.length }} items
          </span>

          <span class="text-lg font-extrabold text-stone-900">
            ${{ Number(props.checkoutTotal || 0).toFixed(2) }}
          </span>
        </div>
      </div>

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
          <p v-if="preview" class="text-sm text-stone-500">Card number · Expiry · CVC</p>
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
      v-if="!stripeReady && !preview"
      role="status"
      class="mt-4 text-sm font-semibold text-stone-500"
    >
      {{ initializationError || 'Initializing secure payment fields...' }}
    </div>
  </div>
</template>
