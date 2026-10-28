<script setup>
import CheckoutOrderItems from './CheckoutOrderItems.vue'
import CheckoutTotals from './CheckoutTotals.vue'
import CheckoutPromoBox from './CheckoutPromoBox.vue'

defineProps({
  locked: Boolean,
  estimatedTotal: { type: Number, default: null },
  totalIsEstimate: Boolean,
  campaigns: { type: Array, default: () => [] },
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
    default: null,
  },
  summaryTaxDetails: { type: Object, default: null },
  checkoutPreviewError: { type: String, default: '' },
  summaryTotal: {
    type: Number,
    default: null,
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
  'retry-preview',
])
</script>

<template>
  <section
    class="section-panel p-5 md:p-6"
  >
    <div class="flex items-center justify-between gap-3">
      <div>
        <p class="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-400">
          Order Summary
        </p>
        <h2 class="text-2xl font-extrabold">Order summary</h2>
      </div>

      <span class="rounded-full border border-stone-800 bg-[color-mix(in_srgb,var(--brand-5)_72%,white)] px-3 py-2 text-sm font-bold text-[var(--brand-4)]">
        <i class="fa-solid fa-bag-shopping mr-2"></i>{{ itemCount }} {{ itemCount === 1 ? 'item' : 'items' }}
      </span>
    </div>

    <CheckoutOrderItems
      :cart-items="cartItems"
      :format-price="formatPrice"
      :campaigns="campaigns"
      :promo-code="appliedPromoCode"
    />

    <CheckoutTotals
      :item-count="itemCount"
      :summary-subtotal="summarySubtotal"
      :summary-discount="summaryDiscount"
      :summary-shipping="summaryShipping"
      :summary-tax="summaryTax"
      :summary-tax-details="summaryTaxDetails"
      :checkout-preview-error="checkoutPreviewError"
      :summary-total="summaryTotal"
      :estimated-total="estimatedTotal"
      :total-is-estimate="totalIsEstimate"
      :applied-promo-code="appliedPromoCode"
      :is-refreshing-checkout-preview="isRefreshingCheckoutPreview"
      :format-price="formatPrice"
      @retry-preview="emit('retry-preview')"
    />

    <fieldset :disabled="locked"><CheckoutPromoBox
      :cart-items="cartItems"
      :promo-code="promoCode"
      :promo-status="promoStatus"
      :promo-message="promoMessage"
      @update:promo-code="emit('update:promo-code', $event)"
      @apply-promo-code="emit('apply-promo-code')"
    /></fieldset>
  </section>
</template>
