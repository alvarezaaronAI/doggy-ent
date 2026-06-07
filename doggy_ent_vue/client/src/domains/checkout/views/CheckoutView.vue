<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import CheckoutProcessingOverlay from '@checkout/Checkout/CheckoutProcessingOverlay.vue'
import CheckoutProgress from '@checkout/Checkout/CheckoutProgress.vue'
import CheckoutHeader from '@checkout/Checkout/CheckoutHeader.vue'
import CheckoutContactSection from '@checkout/Checkout/CheckoutContactSection.vue'
import CheckoutShippingSection from '@checkout/Checkout/CheckoutShippingSection.vue'
import CheckoutDeliverySection from '@checkout/Checkout/CheckoutDeliverySection.vue'
import CheckoutPaymentSection from '@checkout/Checkout/CheckoutPaymentSection.vue'
import CheckoutSubmitSection from '@checkout/Checkout/CheckoutSubmitSection.vue'
import CheckoutMobileSummaryBar from '@checkout/Checkout/CheckoutMobileSummaryBar.vue'
import CheckoutOrderSummary from '@checkout/OrderSummary/CheckoutOrderSummary.vue'

import {
  submitCheckout,
} from '../api/checkout.api'

import {
  previewCampaigns,
} from '../../campaigns/api/campaigns.api'

import {
  useCheckoutPromos,
} from '../composables/useCheckoutPromos'
import {
  useCheckoutPreview,
} from '../composables/useCheckoutPreview'
import {
  useCheckout,
} from '../composables/useCheckout'

import {
  calculateDiscount,
  calculateItemCount,
  calculateOrderTotal,
  calculateSubtotal,
  calculateTax,
  calculateTaxableTotal,
} from '../utils/checkout.utils'

const CART_STORAGE_KEY = 'doggy-ent-cart'
const CUSTOMER_STORAGE_KEY = 'doggy-ent-checkout-customer'
const TAX_RATE = 0.075

const router = useRouter()

const cartItems = ref(loadSavedCart())
const selectedShipping = ref('standard')
const campaignPreview = ref([])
const isLoadingCampaignPreview = ref(false)
const paymentFormComplete = ref(false)

const mobileSummaryOpen = ref(false)



const stripePaymentForm = ref(null)

const {
  checkoutStatus,
  checkoutStatusType,
  isProcessingOrder,
  hasSubmittedOrder,
  paymentCompleted,
  completedPaymentIntent,
  checkoutResult,
  placeOrder,
} = useCheckout({
  validateCheckout,
  stripePaymentForm,

  async submitOrder({
    completedPaymentIntent,
    stripePaymentIntentId,
  }) {
    checkoutResult.value = null

    return await submitCheckout({
      cartItems: cartItems.value,
      promoCode: appliedPromoCode.value || null,
      customer: {
        ...customer.value,
        country:
          customer.value.country === 'US'
            ? 'United States'
            : customer.value.country === 'CA'
              ? 'Canada'
              : customer.value.country,
      },
      shipping: {
        method: selectedShipping.value,
        price: shippingPrice.value,
      },
      stripePaymentIntentId:
        stripePaymentIntentId
        || completedPaymentIntent?.paymentIntentId
        || completedPaymentIntent?.id
        || null,
    })
  },

  async onSuccess({ result }) {
    checkoutResult.value = result

    saveCustomerForNextCheckout()

    cartItems.value = []

    localStorage.setItem(
      CART_STORAGE_KEY,
      JSON.stringify([]),
    )

    campaignPreview.value = []

    clearPromo()

    await router.push(
      `/order-success/${result.order?.orderNumber || result.order?.customerReference || 'pending'}`,
    )
  },
})

const selectedShippingOption = computed(() =>
  shippingOptions.find((option) => option.code === selectedShipping.value) || null,
)

const paymentRequirementsComplete = computed(() =>
  paymentFormComplete.value
  || paymentCompleted.value
  || !!completedPaymentIntent.value,
)

const checkoutRequirementsComplete = computed(() => {
  return (
    customer.value.email.includes('@')
    && customer.value.phone.trim()
    && customer.value.firstName.trim()
    && customer.value.lastName.trim()
    && customer.value.address1.trim()
    && customer.value.city.trim()
    && customer.value.state.trim()
    && customer.value.zip.trim()
    && !!selectedShippingOption.value
    && paymentRequirementsComplete.value
    && cartItems.value.length
  )
})

const checkoutChecklist = computed(() => [
  {
    id: 'contact',
    label: 'Contact information',
    complete: customer.value.email.includes('@') && customer.value.phone.trim(),
  },
  {
    id: 'shipping',
    label: 'Shipping details',
    complete:
      customer.value.firstName.trim()
      && customer.value.lastName.trim()
      && customer.value.address1.trim()
      && customer.value.city.trim()
      && customer.value.state.trim()
      && customer.value.zip.trim(),
  },
  {
    id: 'delivery',
    label: 'Delivery method',
    complete: !!selectedShippingOption.value,
  },
  {
    id: 'payment',
    label: 'Payment information',
    complete: paymentRequirementsComplete.value,
  },
])


const customer = ref(loadSavedCustomer())
function getEmptyCustomer() {
  return {
    email: '',
    phone: '',
    deliveryNotes: '',
    firstName: '',
    lastName: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    zip: '',
    country: 'US',
    saveInfo: false,
    marketingOptIn: false,
  }
}

function loadSavedCustomer() {
  try {
    const savedCustomer = JSON.parse(localStorage.getItem(CUSTOMER_STORAGE_KEY) || 'null')
    return savedCustomer && typeof savedCustomer === 'object'
      ? { ...getEmptyCustomer(), ...savedCustomer }
      : getEmptyCustomer()
  } catch {
    return getEmptyCustomer()
  }
}

function saveCustomerForNextCheckout() {
  if (!customer.value.saveInfo) {
    localStorage.removeItem(CUSTOMER_STORAGE_KEY)
    return
  }

  localStorage.setItem(CUSTOMER_STORAGE_KEY, JSON.stringify({
    email: customer.value.email,
    phone: customer.value.phone,
    firstName: customer.value.firstName,
    lastName: customer.value.lastName,
    address1: customer.value.address1,
    address2: customer.value.address2,
    city: customer.value.city,
    state: customer.value.state,
    zip: customer.value.zip,
    country: customer.value.country,
    saveInfo: true,
    marketingOptIn: customer.value.marketingOptIn,
  }))
}


const shippingOptions = [
  {
    code: 'standard',
    label: 'Standard shipping',
    description: 'Estimated arrival in 3–5 business days.',
    price: 5.99,
  },
  {
    code: 'priority',
    label: 'Priority shipping',
    description: 'Estimated arrival in 1–2 business days.',
    price: 11.99,
  },
]

const subtotal = computed(() =>
  calculateSubtotal(cartItems.value)
)

const {
  promoCode,
  appliedPromoCode,
  appliedPromoDiscount,
  promoMessage,
  promoStatus,
  applyPromoCode,
  clearPromo,
} = useCheckoutPromos({
  customer,
  cartItems,
  subtotal,
})

const itemCount = computed(() =>
  calculateItemCount(cartItems.value)
)

const shippingPrice = computed(() =>
  selectedShippingOption.value?.price || 0
)

const discount = computed(() =>
  calculateDiscount({
    subtotal: subtotal.value,
    discountAmount: appliedPromoDiscount.value,
  })
)

const taxableTotal = computed(() =>
  calculateTaxableTotal({
    subtotal: subtotal.value,
    discount: discount.value,
    shipping: shippingPrice.value,
  })
)

const tax = computed(() =>
  calculateTax({
    taxableTotal: taxableTotal.value,
    taxRate: TAX_RATE,
  })
)

const total = computed(() =>
  calculateOrderTotal({
    taxableTotal: taxableTotal.value,
    tax: tax.value,
  })
)

const {
  checkoutPreviewResult,
  isRefreshingCheckoutPreview,
  refreshCheckoutPreview,
  scheduleCheckoutPreview,
} = useCheckoutPreview({
  cartItems,
  appliedPromoCode,
  customer,
  selectedShipping,
  shippingPrice,
})

function loadSavedCart() {
  try {
    const savedCart = JSON.parse(localStorage.getItem(CART_STORAGE_KEY) || '[]')

    return Array.isArray(savedCart)
      ? savedCart.map(normalizeCartItem)
      : []
  } catch {
    return []
  }
}

function formatPrice(value) {
  return `$${Number(value || 0).toFixed(2)}`
}

function normalizeCartItem(item) {
  return {
    ...item,
    price: Number(item.price || 0),
    quantity: Number(item.quantity || 1),
    availableQuantity: Number(item.availableQuantity || 0),
  }
}


async function loadCampaignPreview() {
  if (!cartItems.value.length) {
    campaignPreview.value = []
    return
  }

  isLoadingCampaignPreview.value = true

  try {
    campaignPreview.value = await previewCampaigns(
      cartItems.value,
    )
  } catch (error) {
    console.error(
      'Failed to load campaign preview.',
      error,
    )

    campaignPreview.value = []
  } finally {
    isLoadingCampaignPreview.value = false
  }
}


const totalCampaignDonation = computed(() =>
  campaignPreview.value.reduce((total, campaign) => total + Number(campaign.donationAmount || 0), 0)
)

const trustedPricing = computed(() =>
  checkoutPreviewResult.value?.pricing || null,
)

const summarySubtotal = computed(() => trustedPricing.value?.subtotal ?? subtotal.value)
const summaryDiscount = computed(() => trustedPricing.value?.discountAmount ?? discount.value)
const summaryShipping = computed(() => trustedPricing.value?.shippingAmount ?? shippingPrice.value)
const summaryTax = computed(() => (
  trustedPricing.value?.taxAmount
  ?? trustedPricing.value?.tax
  ?? tax.value
))
const summaryDonation = computed(() => trustedPricing.value?.donationAmount ?? totalCampaignDonation.value)
const summaryTotal = computed(() => trustedPricing.value?.total ?? total.value)


function validateCheckout() {
  if (!cartItems.value.length) {
    checkoutStatusType.value = 'error'
    checkoutStatus.value = 'Your cart is empty. Add a treat before placing an order.'
    return false
  }

  if (!customer.value.email.includes('@')) {
    checkoutStatusType.value = 'error'
    checkoutStatus.value = 'Please enter a valid email address.'
    return false
  }

  const requiredCustomerFields = [
    customer.value.phone,
    customer.value.firstName,
    customer.value.lastName,
    customer.value.address1,
    customer.value.city,
    customer.value.state,
    customer.value.zip,
  ]

  if (requiredCustomerFields.some((field) => !String(field || '').trim())) {
    checkoutStatusType.value = 'error'
    checkoutStatus.value = 'Please complete all required contact and shipping fields.'
    return false
  }

  if (!selectedShippingOption.value) {
    checkoutStatusType.value = 'error'
    checkoutStatus.value = 'Please choose a valid delivery method.'
    return false
  }

  if (!stripePaymentForm.value) {
    checkoutStatusType.value = 'error'
    checkoutStatus.value = 'Secure payment form is still loading.'
    return false
  }

  if (!paymentRequirementsComplete.value) {
    checkoutStatusType.value = 'error'
    checkoutStatus.value = 'Please complete your secure payment details.'
    return false
  }

  checkoutStatus.value = ''
  checkoutStatusType.value = ''
  return true
}


watch(
  customer,
  () => {
    scheduleCheckoutPreview()
  },
  {
    deep: true,
  },
)

watch(
  cartItems,
  () => {
    scheduleCheckoutPreview()
  },
  {
    deep: true,
  },
)

watch(
  selectedShipping,
  () => {
    scheduleCheckoutPreview()
  },
)

watch(
  appliedPromoCode,
  () => {
    scheduleCheckoutPreview()
  },
)

watch(
  shippingPrice,
  () => {
    scheduleCheckoutPreview()
  },
)

onMounted(() => {
  loadCampaignPreview()
  refreshCheckoutPreview()
})
</script>

<template>
  <div class="min-h-screen bg-[linear-gradient(180deg,rgba(243,232,210,0.7)_0%,#ffffff_100%)] text-stone-900">
    <div class="w-full border-b border-[color-mix(in_srgb,var(--brand-1)_18%,white)] bg-white text-sm text-stone-700">
      <div class="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-4 px-4 py-2">
        <span class="inline-flex items-center gap-2"><i class="fa-solid fa-lock text-emerald-400"></i> Secure checkout</span>
        <span class="inline-flex items-center gap-2"><i class="fa-solid fa-truck-fast text-emerald-400"></i> Free shipping $39+</span>
        <span class="hidden items-center gap-2 sm:inline-flex"><i class="fa-solid fa-shield-dog text-emerald-400"></i> Small-batch treats</span>
      </div>
    </div>

    <header class="sticky top-0 z-50 border-b border-[color-mix(in_srgb,var(--brand-1)_22%,white)] bg-white/80 backdrop-blur">
      <nav class="mx-auto flex max-w-7xl items-center justify-between px-4 py-4" aria-label="Checkout Navigation">
        <RouterLink to="/" class="flex items-center gap-3 text-xl font-black tracking-tight">
          <span class="chip-blue-ring inline-flex h-9 w-9 items-center justify-center rounded-full bg-emerald-400 text-stone-900">
            <i class="fa-solid fa-paw"></i>
          </span>
          <span>Chase &amp; Evie Co.</span>
        </RouterLink>

        <div class="flex items-center gap-3 text-sm">
          <span class="hidden rounded-full border border-stone-800 bg-[color-mix(in_srgb,var(--brand-5)_72%,white)] px-3 py-2 font-bold text-[var(--brand-4)] sm:inline-flex">
            <i class="fa-solid fa-lock mr-2 text-emerald-400"></i> SSL Secured
          </span>
          <RouterLink to="/" class="inline-flex items-center gap-2 font-semibold text-emerald-400 hover:underline">
            <i class="fa-solid fa-arrow-left"></i> Back to shop
          </RouterLink>
        </div>
      </nav>
    </header>

    <CheckoutProcessingOverlay v-if="isProcessingOrder" />

    <main class="pb-28 xl:pb-0">
      <div class="mx-auto max-w-7xl px-4 py-10">
        <CheckoutHeader />

        <div class="grid gap-6 xl:grid-cols-[220px_minmax(0,1.35fr)_minmax(320px,400px)] xl:items-start">
          <CheckoutProgress
            :checklist="checkoutChecklist"
          />
          
          
 

          <section
            class="section-panel p-5 md:p-8"
            :class="isProcessingOrder ? 'pointer-events-none opacity-75' : ''"
          >
            <div class="flex items-center justify-between gap-4 border-b border-stone-800 pb-5">
              <div>
                <p class="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-400">Checkout Flow</p>
                <h2 class="text-2xl font-extrabold">Secure order details</h2>
              </div>
              <div class="text-right">
                <p class="text-sm text-stone-300">Estimated time</p>
                <p class="text-sm font-bold leading-tight">~2 minutes</p>
              </div>
            </div>

            <form class="mt-6 space-y-6" @submit.prevent="placeOrder">
              <CheckoutContactSection
                :customer="customer"
              />

              <CheckoutShippingSection
                :customer="customer"
              />

              <CheckoutDeliverySection
                v-model:selected-shipping="selectedShipping"
                :shipping-options="shippingOptions"
                :format-price="formatPrice"
              />
              <CheckoutPaymentSection
                ref="stripePaymentForm"
                :cart-items="cartItems"
                :checkout-total="summaryTotal"
                :customer="{
                  ...customer,
                  country:
                    customer.country === 'US'
                      ? 'United States'
                      : customer.country === 'CA'
                        ? 'Canada'
                        : customer.country,
                }"
                :promo-code="appliedPromoCode || null"
                :shipping="{
                  method: selectedShipping,
                  price: shippingPrice,
                }"
                @card-complete="paymentFormComplete = $event"
              />

              <CheckoutSubmitSection
                :is-processing-order="isProcessingOrder"
                :checkout-requirements-complete="checkoutRequirementsComplete"
                :checkout-status="checkoutStatus"
                :checkout-status-type="checkoutStatusType"
              />
            </form>
          </section>

          
          <section class="section-panel mb-28 overflow-hidden xl:hidden">
  <button
    type="button"
    class="flex w-full items-center justify-between gap-4 p-4 text-left"
    @click="mobileSummaryOpen = !mobileSummaryOpen"
  >
    <div>
      <p class="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-400">
        Order Summary
      </p>

      <p class="mt-1 text-lg font-extrabold text-[var(--brand-4)]">
        {{ formatPrice(summaryTotal) }}
      </p>
    </div>

    <div class="flex items-center gap-3">
      <span class="rounded-full border border-stone-800 bg-[color-mix(in_srgb,var(--brand-5)_72%,white)] px-3 py-1.5 text-xs font-bold text-[var(--brand-4)]">
        {{ itemCount }} items
      </span>

      <i
        class="fa-solid transition"
        :class="mobileSummaryOpen ? 'fa-chevron-up rotate-180' : 'fa-chevron-down'"
      ></i>
    </div>
  </button>
</section>

          <aside class="space-y-4 lg:sticky lg:top-24">
            <CheckoutOrderSummary
              :mobile-summary-open="mobileSummaryOpen"
              :cart-items="cartItems"
              :item-count="itemCount"
              :is-loading-campaign-preview="isLoadingCampaignPreview"
              :campaign-preview="campaignPreview"
              :total-campaign-donation="totalCampaignDonation"
              :summary-subtotal="summarySubtotal"
              :summary-discount="summaryDiscount"
              :summary-shipping="summaryShipping"
              :summary-tax="summaryTax"
              :summary-donation="summaryDonation"
              :summary-total="summaryTotal"
              :applied-promo-code="appliedPromoCode"
              :is-refreshing-checkout-preview="isRefreshingCheckoutPreview"
              :promo-code="promoCode"
              :promo-status="promoStatus"
              :promo-message="promoMessage"
              :format-price="formatPrice"
              @update:promo-code="promoCode = $event"
              @apply-promo-code="applyPromoCode"
            />

            <section class="section-panel p-5 md:p-6">
              <h3 class="text-lg font-extrabold">Questions before you order?</h3>
              <ul class="mt-4 space-y-3 text-sm text-stone-300">
                <li class="flex gap-3"><i class="fa-solid fa-lock mt-1 text-emerald-400"></i><span>Secure payment processing and encrypted checkout protection.</span></li>
                <li class="flex gap-3"><i class="fa-solid fa-truck-fast mt-1 text-emerald-400"></i><span>Shipping options are shown before you place your order.</span></li>
                <li class="flex gap-3"><i class="fa-solid fa-envelope mt-1 text-emerald-400"></i><span>Order confirmation and tracking updates are sent by email after purchase.</span></li>
              </ul>
              <div class="my-5 h-px bg-[color-mix(in_srgb,var(--brand-3)_30%,white)]"></div>
              <RouterLink to="/" class="inline-flex items-center gap-2 font-semibold text-emerald-400 hover:underline">
                <i class="fa-solid fa-arrow-left"></i>
                Back to cart
              </RouterLink>
            </section>
          </aside>
        </div>
      </div>
    

      <CheckoutMobileSummaryBar
        :summary-total="summaryTotal"
        :is-processing-order="isProcessingOrder"
        :checkout-requirements-complete="checkoutRequirementsComplete"
        :format-price="formatPrice"
        @place-order="placeOrder"
      />

    </main>
  </div>
</template>
