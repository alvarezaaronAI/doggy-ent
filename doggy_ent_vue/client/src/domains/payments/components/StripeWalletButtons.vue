<script setup>
import { onMounted, onBeforeUnmount, ref, watch } from 'vue'
import { getStripe } from '../services/stripe.js'
import { createPaymentIntent } from '../services/payment.service.js'
const props = defineProps({ checkoutTotal: Number, cartItems: Array, customer: Object, shipping: Object, promoCode: String, applePay: Boolean, googlePay: Boolean, ready: Boolean, locked: Boolean, placeWalletOrder: { type: Function, required: true } })
const container = ref(null), available = ref(false), message = ref('Checking wallet availability...')
let stripe, elements, wallet, disposed = false
const methods = () => ({ applePay: props.applePay ? 'auto' : 'never', googlePay: props.googlePay ? 'auto' : 'never', link: 'never', paypal: 'never', amazonPay: 'never', klarna: 'never' })
onMounted(async () => {
  try {
    stripe = await getStripe()
    if (!stripe || disposed) { message.value = 'Wallets are unavailable. You can pay by card below.'; return }
    elements = stripe.elements({ mode: 'payment', amount: Math.max(1, Math.round(props.checkoutTotal * 100)), currency: 'usd', paymentMethodTypes: ['card'], appearance: { variables: { borderRadius: '6px' } } })
    wallet = elements.create('expressCheckout', { paymentMethods: methods(), buttonHeight: 48, layout: { maxColumns: 2, maxRows: 2 } })
    wallet.on('ready', event => { available.value = Boolean(event.availablePaymentMethods?.applePay || event.availablePaymentMethods?.googlePay); message.value = available.value ? '' : 'Apple Pay and Google Pay are not available on this device. Use card payment below.' })
    wallet.on('loaderror', () => { available.value = false; message.value = 'Wallets could not load. Use card payment below.' })
    wallet.on('click', event => { event.resolve() })
    wallet.on('confirm', async event => {
      let paid = false
      try {
        const success = await props.placeWalletOrder(async () => {
          const submission = await elements.submit()
          if (submission.error) throw new Error(submission.error.message)
          const intent = await createPaymentIntent({ cartItems: props.cartItems, customer: props.customer, shipping: props.shipping, promoCode: props.promoCode })
          if (Math.round(Number(intent.pricing.total) * 100) !== Math.round(props.checkoutTotal * 100)) throw new Error('Your order total changed. Review the refreshed total before paying.')
          const result = await stripe.confirmPayment({ elements, clientSecret: intent.clientSecret, confirmParams: { return_url: window.location.origin + '/checkout' }, redirect: 'if_required' })
          if (result.error) throw new Error(result.error.message)
          if (result.paymentIntent?.status !== 'succeeded') throw new Error('Wallet payment was not completed.')
          paid = true
          return { paymentIntentId: result.paymentIntent.id, status: result.paymentIntent.status, checkoutProof: intent.checkoutProof }
        })
        if (!success && !paid) event.paymentFailed({ reason: 'fail' })
      } catch (error) { message.value = error.message || 'Wallet payment failed.'; if (!paid) event.paymentFailed({ reason: 'fail' }) }
    })
    wallet.mount(container.value)
  } catch { message.value = 'Wallets are unavailable. Use card payment below.' }
})
watch(() => props.checkoutTotal, total => { if (!props.locked) elements?.update({ amount: Math.max(1, Math.round(total * 100)) }) })
watch(() => [props.applePay, props.googlePay], () => wallet?.update({ paymentMethods: methods() }))
onBeforeUnmount(() => { disposed = true; wallet?.destroy() })
</script>
<template>
  <section class="mb-5 border-b border-stone-200 pb-5">
    <h4 class="mb-3 text-sm font-semibold">Apple Pay &amp; Google Pay</h4>
    <div ref="container" :inert="!ready || locked" :class="{ 'pointer-events-none opacity-50': !ready || locked }"></div>
    <p v-if="!ready && available" class="mt-2 text-xs text-stone-600">Complete contact, shipping and delivery details to use your wallet.</p>
    <p v-if="message" class="mt-2 text-xs text-stone-600" role="status">{{ message }}</p>
  </section>
</template>
