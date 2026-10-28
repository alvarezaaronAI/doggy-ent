<script setup>
import { ref } from 'vue'
import { Monitor, Smartphone, Pencil } from '@lucide/vue'
import CheckoutLayout from '@domains/checkout/Checkout/CheckoutLayout.vue'
import CheckoutContactSection from '@domains/checkout/Checkout/CheckoutContactSection.vue'
import CheckoutShippingSection from '@domains/checkout/Checkout/CheckoutShippingSection.vue'
import CheckoutDeliverySection from '@domains/checkout/Checkout/CheckoutDeliverySection.vue'
import CheckoutPaymentSection from '@domains/checkout/Checkout/CheckoutPaymentSection.vue'
import CheckoutSubmitSection from '@domains/checkout/Checkout/CheckoutSubmitSection.vue'
import CheckoutOrderSummary from '@domains/checkout/OrderSummary/CheckoutOrderSummary.vue'
import CheckoutBagDisclosure from '@domains/checkout/OrderSummary/CheckoutBagDisclosure.vue'
import { formatCurrency } from '@shared/utils/currency.js'
import OrderConfirmationContent from '@domains/checkout/OrderSuccess/OrderConfirmationContent.vue'
import { COMMERCE_SAMPLE } from '../constants/commercePreview.constants.js'
defineProps({ draft: Object, selected: String, page: String })
defineEmits(['select'])
const phone = ref(false)
const canvas = ref(null)
const customer = ref({ firstName: 'Alex', lastName: 'Morgan', email: 'alex@example.com', phone: '', address1: '', address2: '', city: '', state: '', zip: '', country: 'US', saveInfo: false, marketingOptIn: false })
const sampleShipping = [{ code: 'standard', label: 'Standard shipping', description: 'Estimated arrival shown for the selected address.', price: COMMERCE_SAMPLE.shippingAmount }]
defineExpose({ scrollToSection(id) { canvas.value?.querySelector(`[data-commerce-section="${id}"]`)?.scrollIntoView({ block: 'nearest', behavior: 'auto' }) } })
</script>
<template>
  <section ref="canvas" class="commerce-canvas">
    <div class="flex flex-wrap items-center justify-between gap-2 bg-white p-3 border-b border-[var(--admin-line)]">
      <span class="admin-muted text-xs">Sample data only · no payment or email</span>
      <div class="flex gap-2" role="group" aria-label="Preview width"><button class="admin-button" :aria-pressed="!phone" title="Wide preview" aria-label="Wide preview" @click="phone = false"><Monitor :size="16" /></button><button class="admin-button" :aria-pressed="phone" title="Phone preview" aria-label="Phone preview" @click="phone = true"><Smartphone :size="16" /></button></div>
    </div>
    <div class="commerce-scroll"><div :class="{ 'commerce-phone': phone }">
      <template v-if="page === 'checkout'">
        <button data-commerce-section="checkout" class="admin-button m-3" @click="$emit('select', 'checkout')"><Pencil :size="14" />Edit heading &amp; wallets</button>
        <div inert><CheckoutLayout preview :settings="draft.checkout" :checklist="[{ id: 'contact', label: 'Contact' }, { id: 'shipping', label: 'Shipping' }, { id: 'delivery', label: 'Delivery' }, { id: 'payment', label: 'Payment' }]">
          <form class="space-y-5"><fieldset class="space-y-5"><CheckoutContactSection :customer="customer" /><CheckoutShippingSection :customer="customer" /><CheckoutDeliverySection selected-shipping="standard" :shipping-options="sampleShipping" :format-price="formatCurrency" /><CheckoutPaymentSection preview :wallet-settings="draft.checkout" :cart-items="COMMERCE_SAMPLE.items" :checkout-total="COMMERCE_SAMPLE.total" :customer="customer" /></fieldset><CheckoutSubmitSection :is-processing-order="false" :checkout-requirements-complete="true" /></form>
          <template #summary><CheckoutBagDisclosure :total="formatCurrency(COMMERCE_SAMPLE.total)" :item-count="1"><CheckoutOrderSummary :mobile-summary-open="true" :cart-items="COMMERCE_SAMPLE.items" :item-count="1" :summary-subtotal="COMMERCE_SAMPLE.subtotal" :summary-discount="0" :summary-shipping="COMMERCE_SAMPLE.shippingAmount" :summary-tax="COMMERCE_SAMPLE.taxAmount" :summary-total="COMMERCE_SAMPLE.total" :is-refreshing-checkout-preview="false" :format-price="formatCurrency" /></CheckoutBagDisclosure></template>
        </CheckoutLayout></div>
      </template>
      <OrderConfirmationContent v-else :order="COMMERCE_SAMPLE" :settings="draft.confirmation" editable :selected="selected" @select="$emit('select', $event)" />
    </div></div>
  </section>
</template>
<style scoped>
.commerce-canvas { min-width: 0; border: 1px solid var(--admin-line); border-radius: 6px; background: #e9eeea; overflow: clip; }
.commerce-scroll { max-height: 78svh; overflow: auto; overscroll-behavior: contain; }
.commerce-phone { max-width: 390px; margin: auto; }
</style>
