<script setup>
import { computed, onMounted } from 'vue'
import CheckoutLayout from '../Checkout/CheckoutLayout.vue'
import CheckoutProcessingOverlay from '../Checkout/CheckoutProcessingOverlay.vue'
import CheckoutContactSection from '../Checkout/CheckoutContactSection.vue'
import CheckoutAuthModal from '../Checkout/CheckoutAuthModal.vue'
import CheckoutShippingSection from '../Checkout/CheckoutShippingSection.vue'
import CheckoutDeliverySection from '../Checkout/CheckoutDeliverySection.vue'
import CheckoutPaymentSection from '../Checkout/CheckoutPaymentSection.vue'
import CheckoutSubmitSection from '../Checkout/CheckoutSubmitSection.vue'
import CheckoutOrderSummary from '../OrderSummary/CheckoutOrderSummary.vue'
import CheckoutBagDisclosure from '../OrderSummary/CheckoutBagDisclosure.vue'
import CheckoutCampaignPreview from '../OrderSummary/CheckoutCampaignPreview.vue'
import { useCheckoutPage } from '../composables/useCheckoutPage.js'
import { useStorefrontContent } from '@storefront/composables/useStorefrontContent.js'
import { commercePresentation } from '@storefront-content/commercePresentation.js'
const { content, loadContent } = useStorefrontContent()
const settings = computed(() => commercePresentation(content.value).checkout)
onMounted(loadContent)
const { cartItems, customer, selectedShipping, shippingOptions, isLoadingShippingRates, shippingRateMessage, campaignPreview, isLoadingCampaignPreview, paymentFormComplete, accountProfile, isSignedInCheckout, profilePrefilled, checkoutAuthMode, stripePaymentForm, checkoutChecklist, isProcessingOrder, paymentCompleted, checkoutRequirementsComplete, checkoutStatus, checkoutStatusType, summarySubtotal, summaryDiscount, summaryShipping, summaryTax, summaryTaxDetails, summaryDonation, summaryTotal, summaryEstimate, totalIsEstimate, paymentReadiness, continueCheckout, itemCount, appliedPromoCode, isRefreshingCheckoutPreview, checkoutPreviewError, refreshCheckoutPreview, promoCode, promoStatus, promoMessage, formatPrice, buildSelectedShippingPayload, placeOrder, placeWalletOrder, walletReady, openCheckoutAuth, handleCheckoutAuthenticated, applyPromoCode, campaigns } = useCheckoutPage()
const paymentCustomer = computed(() => ({ ...customer.value, country: customer.value.country === 'US' ? 'United States' : customer.value.country }))
</script>
<template>
  <CheckoutLayout :settings="settings" :checklist="checkoutChecklist">
    <CheckoutProcessingOverlay v-if="isProcessingOrder" />
    <form class="space-y-5" @submit.prevent="placeOrder">
      <fieldset :disabled="isProcessingOrder || paymentCompleted" class="min-w-0 space-y-5">
        <CheckoutContactSection id="checkout-contact" tabindex="-1" class="scroll-mt-5" :customer="customer" :account-profile="accountProfile" :is-signed-in="isSignedInCheckout" :profile-prefilled="profilePrefilled" @open-auth="openCheckoutAuth" />
        <CheckoutShippingSection id="checkout-shipping" tabindex="-1" class="scroll-mt-5" :customer="customer" @address-reviewed="refreshCheckoutPreview" />
        <CheckoutDeliverySection id="checkout-delivery" tabindex="-1" class="scroll-mt-5" v-model:selected-shipping="selectedShipping" :shipping-options="shippingOptions" :is-loading-rates="isLoadingShippingRates" :rate-message="shippingRateMessage" :format-price="formatPrice" />
        <CheckoutPaymentSection id="checkout-payment" tabindex="-1" class="scroll-mt-5" ref="stripePaymentForm" :cart-items="cartItems" :checkout-total="summaryTotal" :customer="paymentCustomer" :promo-code="appliedPromoCode || ''" :shipping="buildSelectedShippingPayload()" :wallet-settings="settings" :wallet-ready="walletReady" :locked="isProcessingOrder || paymentCompleted" :place-wallet-order="placeWalletOrder" @card-complete="paymentFormComplete = $event" @pricing-changed="refreshCheckoutPreview" />
      </fieldset>
        <CheckoutSubmitSection :checkout-total="summaryTotal" :payment-completed="paymentCompleted" :is-processing-order="isProcessingOrder" :checkout-requirements-complete="checkoutRequirementsComplete" :checkout-status="checkoutStatus" :checkout-status-type="checkoutStatusType" :next-action="paymentReadiness.action" @continue="continueCheckout" />
    </form>
    <template #summary>
      <CheckoutBagDisclosure :total="formatPrice(summaryTotal ?? summaryEstimate)" :item-count="itemCount" :estimated="totalIsEstimate">
        <CheckoutOrderSummary :locked="isProcessingOrder || paymentCompleted" :mobile-summary-open="true" :cart-items="cartItems" :campaigns="campaigns" :item-count="itemCount" :summary-subtotal="summarySubtotal" :summary-discount="summaryDiscount" :summary-shipping="summaryShipping" :summary-tax="summaryTax" :summary-tax-details="summaryTaxDetails" :summary-total="summaryTotal" :estimated-total="summaryEstimate" :total-is-estimate="totalIsEstimate" :checkout-preview-error="checkoutPreviewError" :applied-promo-code="appliedPromoCode" :is-refreshing-checkout-preview="isRefreshingCheckoutPreview" :promo-code="promoCode" :promo-status="promoStatus" :promo-message="promoMessage" :format-price="formatPrice" @retry-preview="refreshCheckoutPreview" @update:promo-code="promoCode = $event" @apply-promo-code="applyPromoCode" />
      </CheckoutBagDisclosure>
      <CheckoutCampaignPreview :is-loading-campaign-preview="isLoadingCampaignPreview || isRefreshingCheckoutPreview" :campaign-preview="campaignPreview" :public-campaigns="campaigns" :amount="summaryDonation" :format-price="formatPrice" />
      <p class="text-xs leading-relaxed text-stone-600">Review your size, quantity and delivery details before paying.</p>
    </template>
    <CheckoutAuthModal v-if="checkoutAuthMode" :mode="checkoutAuthMode" :customer="customer" @authenticated="handleCheckoutAuthenticated" @close="checkoutAuthMode = null" />
  </CheckoutLayout>
</template>
