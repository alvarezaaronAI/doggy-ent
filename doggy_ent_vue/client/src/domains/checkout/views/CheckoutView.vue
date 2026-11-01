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
const {
  cartItems, customer, selectedShipping, shippingOptions, isLoadingShippingRates, shippingRateMessage,
  campaignPreview, campaignPreviewLoading, paymentFormComplete, accountProfile, isSignedInCheckout,
  profilePrefilled, checkoutAuthMode, stripePaymentForm, checkoutChecklist, isProcessingOrder,
  checkoutRequirementsComplete, checkoutStatus, checkoutStatusType, summarySubtotal, summaryDiscount,
  summaryShipping, summaryTax, summaryTaxDetails, summaryPromo, summaryDonation, summaryTotal, itemCount,
  appliedPromoCode, refreshCheckoutPreview, promoCode, promoStatus, promoMessage, formatPrice,
  buildSelectedShippingPayload, placeOrder, placeWalletOrder, walletReady, openCheckoutAuth,
  handleCheckoutAuthenticated, applyPromoCode, campaigns, paymentLocked, recoveryUi, preparePayment,
  summaryCartItems, summaryRefreshing, summaryPreviewError, summaryAppliedPromoCode,
} = useCheckoutPage()
const paymentCustomer = computed(() => ({ ...customer.value, country: customer.value.country === 'US' ? 'United States' : customer.value.country }))
</script>
<template>
  <CheckoutLayout :settings="settings" :checklist="checkoutChecklist">
    <CheckoutProcessingOverlay v-if="isProcessingOrder" :recovering="Boolean(recoveryUi.visible)" />
    <form class="space-y-5" @submit.prevent="placeOrder">
      <fieldset :disabled="paymentLocked" class="min-w-0 space-y-5">
        <CheckoutContactSection :customer="customer" :account-profile="accountProfile" :is-signed-in="isSignedInCheckout" :profile-prefilled="profilePrefilled" @open-auth="openCheckoutAuth" />
        <CheckoutShippingSection :customer="customer" />
        <CheckoutDeliverySection v-model:selected-shipping="selectedShipping" :shipping-options="shippingOptions" :is-loading-rates="isLoadingShippingRates" :rate-message="shippingRateMessage" :format-price="formatPrice" />
      </fieldset>
        <CheckoutPaymentSection ref="stripePaymentForm" :cart-items="cartItems" :checkout-total="summaryTotal" :customer="paymentCustomer" :promo-code="appliedPromoCode || ''" :shipping="buildSelectedShippingPayload()" :wallet-settings="settings" :wallet-ready="walletReady" :locked="paymentLocked" :recovery="recoveryUi" :prepare-payment="preparePayment" :place-wallet-order="placeWalletOrder" @card-complete="paymentFormComplete = $event" @pricing-changed="refreshCheckoutPreview" />
        <CheckoutSubmitSection :is-processing-order="isProcessingOrder" :checkout-requirements-complete="checkoutRequirementsComplete" :checkout-status="checkoutStatus" :checkout-status-type="checkoutStatusType" />
    </form>
    <template #summary>
      <CheckoutBagDisclosure :total="formatPrice(summaryTotal)" :item-count="itemCount">
        <CheckoutOrderSummary :locked="paymentLocked" :mobile-summary-open="true" :cart-items="summaryCartItems" :campaigns="campaigns" :item-count="itemCount" :summary-subtotal="summarySubtotal" :summary-discount="summaryDiscount" :summary-shipping="summaryShipping" :summary-tax="summaryTax" :summary-tax-details="summaryTaxDetails" :summary-promo="summaryPromo" :summary-total="summaryTotal" :checkout-preview-error="summaryPreviewError" :applied-promo-code="summaryAppliedPromoCode" :is-refreshing-checkout-preview="summaryRefreshing" :promo-code="promoCode" :promo-status="promoStatus" :promo-message="promoMessage" :format-price="formatPrice" @retry-preview="refreshCheckoutPreview" @update:promo-code="promoCode = $event" @apply-promo-code="applyPromoCode" />
      </CheckoutBagDisclosure>
      <CheckoutCampaignPreview :is-loading-campaign-preview="campaignPreviewLoading" :campaign-preview="campaignPreview" :public-campaigns="campaigns" :amount="summaryDonation" :format-price="formatPrice" />
      <p class="text-xs leading-relaxed text-stone-600">Review your size, quantity and delivery details before paying.</p>
    </template>
    <CheckoutAuthModal v-if="checkoutAuthMode" :mode="checkoutAuthMode" :customer="customer" @authenticated="handleCheckoutAuthenticated" @close="checkoutAuthMode = null" />
  </CheckoutLayout>
</template>
