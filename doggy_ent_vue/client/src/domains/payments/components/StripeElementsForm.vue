<script setup>
import { onMounted, onBeforeUnmount, ref, useId, watch } from 'vue'
import { CreditCard, LoaderCircle } from '@lucide/vue'

import { getStripe } from '@payments/services/stripe.js'
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

const emit = defineEmits(['card-complete', 'pricing-changed'])

const stripeInstance = ref(null)
const elementsInstance = ref(null)
const cardElement = ref(null)
const cardElementContainer = ref(null)

const cardholderName = ref('')
const cardFieldComplete = ref(false)
const cardError = ref('')
const nameId = useId()
watch(cardholderName, name => emit('card-complete', cardFieldComplete.value && Boolean(name.trim())))
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
    if (Math.round(Number(paymentIntentResponse.pricing?.total) * 100) !== Math.round(props.checkoutTotal * 100)) {
      emit('pricing-changed')
      throw new Error('Your total changed. Review the refreshed order before paying.')
    }

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
  stripeInstance.value = await getStripe()
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
    cardError.value = event.error?.message || ''
    cardFieldComplete.value = Boolean(event.complete) && !event.error
    emit('card-complete', cardFieldComplete.value && Boolean(cardholderName.value.trim()))
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
  <div>
    <div class="grid gap-4">
      <div>
        <label :for="nameId" class="mb-2 block text-sm font-medium text-stone-700">
          Name on card
        </label>

        <input
          v-model="cardholderName"
          :id="nameId"
          name="cardholderName"
          autocomplete="cc-name"
          required
          type="text"
          placeholder="Full name as shown on card"
          class="min-h-12 w-full rounded-md border border-stone-300 bg-white px-4 py-3 text-base text-stone-900 shadow-sm outline-none transition focus:border-[#315bc5] focus:ring-2 focus:ring-[#315bc5]/15"
        />
      </div>

      <div>
        <p :id="nameId + '-card-label'" class="mb-2 flex items-center gap-2 text-sm font-medium text-stone-700"><CreditCard :size="16" aria-hidden="true" />Card details</p>
        <div role="group" :aria-labelledby="nameId + '-card-label'" :aria-describedby="cardError ? nameId + '-card-error' : undefined" :aria-invalid="Boolean(cardError)" class="min-h-14 rounded-md border px-4 py-4 shadow-sm transition focus-within:border-[#315bc5] focus-within:ring-2 focus-within:ring-[#315bc5]/15" :class="cardError ? 'border-red-300 bg-red-50' : 'border-stone-300 bg-white'">
          <div ref="cardElementContainer" class="min-h-6"></div>
          <p v-if="preview" class="text-sm text-stone-500">Card number · Expiry · CVC</p>
        </div>
        <p v-if="cardError" :id="nameId + '-card-error'" role="alert" class="mt-2 text-sm text-red-700">{{ cardError }}</p>
      </div>
    </div>

    <div class="mt-4 flex items-center gap-3 text-2xl text-stone-500" role="group" aria-label="Accepted cards">
      <i class="fa-brands fa-cc-visa" role="img" aria-label="Visa"></i>
      <i class="fa-brands fa-cc-mastercard" role="img" aria-label="Mastercard"></i>
      <i class="fa-brands fa-cc-amex" role="img" aria-label="American Express"></i>
    </div>

    <div
      v-if="!stripeReady && !preview"
      role="status"
      class="mt-4 flex items-center gap-2 text-sm"
      :class="initializationError ? 'text-red-700' : 'text-stone-500'"
    >
      <LoaderCircle v-if="!initializationError" :size="16" class="shrink-0 animate-spin motion-reduce:animate-none" aria-hidden="true" />{{ initializationError || 'Loading secure card fields...' }}
    </div>
  </div>
</template>
