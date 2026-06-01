<script setup>
import CheckoutOrderItems from './CheckoutOrderItems.vue'
import CheckoutCampaignPreview from './CheckoutCampaignPreview.vue'
import CheckoutTotals from './CheckoutTotals.vue'
import CheckoutPromoBox from './CheckoutPromoBox.vue'

defineProps({
  mobileSummaryOpen: {
    type: Boolean,
    required: true,
  },
  cartItems: {
    type: Array,
    required: true,
  },
  itemCount: {
    type: Number,
    required: true,
  },
  isLoadingCampaignPreview: {
    type: Boolean,
    required: true,
  },
  campaignPreview: {
    type: Array,
    required: true,
  },
  totalCampaignDonation: {
    type: Number,
    required: true,
  },
  summarySubtotal: {
    type: Number,
    required: true,
  },
  summaryDiscount: {
    type: Number,
    required: true,
  },
  summaryShipping: {
    type: Number,
    required: true,
  },
  summaryTax: {
    type: Number,
    required: true,
  },
  summaryDonation: {
    type: Number,
    required: true,
  },
  summaryTotal: {
    type: Number,
    required: true,
  },
  appliedPromoCode: {
    type: String,
    default: '',
  },
  isRefreshingCheckoutPreview: {
    type: Boolean,
    required: true,
  },
  promoCode: {
    type: String,
    default: '',
  },
  promoStatus: {
    type: String,
    default: '',
  },
  promoMessage: {
    type: String,
    default: '',
  },
  formatPrice: {
    type: Function,
    required: true,
  },
})

const emit = defineEmits([
  'update:promo-code',
  'apply-promo-code',
])
</script>

<template>
  <section
    class="section-panel p-5 md:p-6"
    :class="mobileSummaryOpen ? 'block' : 'hidden xl:block'"
  >
    <div class="flex items-center justify-between gap-3">
      <div>
        <p class="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-400">
          Order Summary
        </p>
        <h2 class="text-2xl font-extrabold">Order summary</h2>
      </div>

      <span class="rounded-full border border-stone-800 bg-[color-mix(in_srgb,var(--brand-5)_72%,white)] px-3 py-2 text-sm font-bold text-[var(--brand-4)]">
        <i class="fa-solid fa-bag-shopping mr-2"></i>{{ itemCount }} items
      </span>
    </div>

    <CheckoutOrderItems
      :cart-items="cartItems"
      :format-price="formatPrice"
    />

    <CheckoutCampaignPreview
      :cart-items="cartItems"
      :is-loading-campaign-preview="isLoadingCampaignPreview"
      :campaign-preview="campaignPreview"
      :total-campaign-donation="totalCampaignDonation"
      :format-price="formatPrice"
    />

    <CheckoutTotals
      :summary-subtotal="summarySubtotal"
      :summary-discount="summaryDiscount"
      :summary-shipping="summaryShipping"
      :summary-tax="summaryTax"
      :summary-donation="summaryDonation"
      :summary-total="summaryTotal"
      :applied-promo-code="appliedPromoCode"
      :is-refreshing-checkout-preview="isRefreshingCheckoutPreview"
      :format-price="formatPrice"
    />

    <CheckoutPromoBox
      :cart-items="cartItems"
      :promo-code="promoCode"
      :promo-status="promoStatus"
      :promo-message="promoMessage"
      @update:promo-code="emit('update:promo-code', $event)"
      @apply-promo-code="emit('apply-promo-code')"
    />
  </section>
</template>