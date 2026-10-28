<script setup>
import { ref } from 'vue'
import { LockKeyhole } from '@lucide/vue'
import StripeElementsForm from '@payments/components/StripeElementsForm.vue'
import StripeWalletButtons from '@payments/components/StripeWalletButtons.vue'
defineProps({ cartItems: Array, checkoutTotal: Number, customer: Object, promoCode: String, shipping: Object, walletSettings: Object, walletReady: Boolean, locked: Boolean, placeWalletOrder: Function, preview: Boolean })
const emit = defineEmits(['card-complete', 'pricing-changed'])
const stripeElementsForm = ref(null)
defineExpose({ async submitPayment() { return stripeElementsForm.value?.submitPayment() } })
</script>
<template>
  <div class="checkout-form-card rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
    <div class="flex gap-4">
      <span class="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#f2de5c] font-semibold text-[#6a3c2b]">4</span>
      <div class="min-w-0 flex-1">
        <h3 class="text-xl font-semibold">Payment</h3>
        <p class="mt-2 flex items-center gap-2 text-xs text-stone-600"><LockKeyhole :size="14" aria-hidden="true" />Secure payment by Stripe</p>
        <div class="mt-5">
          <StripeWalletButtons v-if="!preview && walletReady && checkoutTotal != null && (walletSettings?.applePay || walletSettings?.googlePay)" :cart-items="cartItems" :checkout-total="checkoutTotal" :customer="customer" :promo-code="promoCode" :shipping="shipping" :apple-pay="walletSettings.applePay" :google-pay="walletSettings.googlePay" :ready="walletReady" :locked="locked" :place-wallet-order="placeWalletOrder" @pricing-changed="emit('pricing-changed')" />
          <div v-if="preview" class="mb-4 flex flex-wrap gap-2 text-xs text-stone-600"><span v-if="walletSettings?.applePay" class="rounded-md border border-stone-200 bg-stone-50 p-3">Apple Pay enabled</span><span v-if="walletSettings?.googlePay" class="rounded-md border border-stone-200 bg-stone-50 p-3">Google Pay enabled</span></div>
          <div>
            <StripeElementsForm ref="stripeElementsForm" :cart-items="cartItems" :checkout-total="checkoutTotal" :customer="customer" :promo-code="promoCode" :shipping="shipping" :preview="preview" @card-complete="emit('card-complete', $event)" @pricing-changed="emit('pricing-changed')" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
