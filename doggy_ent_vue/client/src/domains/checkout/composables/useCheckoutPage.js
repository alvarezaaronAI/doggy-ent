import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

import {
  submitCheckout,
} from '../api/checkout.api'

import {
  previewCampaigns,
} from '../../campaigns/api/campaigns.api'

import {
  useCheckoutPromos,
} from './useCheckoutPromos'
import {
  useCheckoutPreview,
} from './useCheckoutPreview'
import {
  useCheckout,
} from './useCheckout'

import {
  calculateDiscount,
  calculateItemCount,
  calculateOrderTotal,
  calculateSubtotal,
  calculateTax,
  calculateTaxableTotal,
} from '../utils/checkout.utils'

import { useCheckoutIdentity } from './useCheckoutIdentity.js'
import { useCheckoutShipping } from './useCheckoutShipping.js'
import { useStorefrontCampaigns } from '@campaigns/composables/useStorefrontCampaigns.js'
export function useCheckoutPage() {
const CART_STORAGE_KEY = 'doggy-ent-cart'
const TAX_RATE = 0.075

const router = useRouter()

const cartItems = ref(loadSavedCart())
const campaignPreview = ref([])
const isLoadingCampaignPreview = ref(false)
const paymentFormComplete = ref(false)
const checkoutAuthMode = ref(null)

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
  placeOrder: submitCurrentOrder,
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
        ...buildSelectedShippingPayload(),
      },
      checkoutProof: completedPaymentIntent?.checkoutProof,
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

const paymentRequirementsComplete = computed(() =>
  paymentFormComplete.value
  || paymentCompleted.value
  || !!completedPaymentIntent.value,
)

const checkoutRequirementsComplete = computed(() => {
  return Boolean(
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
    && (paymentCompleted.value || (!!trustedPricing.value && !isRefreshingCheckoutPreview.value))
    && cartItems.value.length
  )
})

const isSignedInCheckout = computed(() =>
  Boolean(accountProfile.value?.id),
)

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


const { customer, accountProfile, accountProfileLoaded, profilePrefilled, saveCustomerForNextCheckout, loadCheckoutAccountProfile } = useCheckoutIdentity()
function openCheckoutAuth(mode) { checkoutAuthMode.value = mode || 'sign-in' }
async function handleCheckoutAuthenticated(details = {}) {
  checkoutAuthMode.value = null
  for (const key of ['firstName', 'lastName', 'email']) if (!String(customer.value[key] || '').trim() && details[key]) customer.value[key] = details[key]
  await loadCheckoutAccountProfile()
}


const subtotal = computed(() =>
  calculateSubtotal(cartItems.value)
)

const { selectedShipping, selectedShippingOption, shippingPrice, shippingOptions, isLoadingShippingRates, shippingRateMessage, buildSelectedShippingPayload, loadShippingOptions, scheduleShippingRates } = useCheckoutShipping(customer, cartItems)
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
  getShippingPayload: buildSelectedShippingPayload,
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


function validateCheckout({ wallet = false } = {}) {
  if (!paymentCompleted.value && (!trustedPricing.value || isRefreshingCheckoutPreview.value)) {
    checkoutStatusType.value = 'error'
    checkoutStatus.value = 'Wait for the current order total to be verified before paying.'
    return false
  }
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

  if (!wallet && !paymentRequirementsComplete.value) {
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
    scheduleShippingRates()
    scheduleCheckoutPreview()
  },
  {
    deep: true,
  },
)

watch(
  cartItems,
  () => {
    scheduleShippingRates()
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

onMounted(async () => {
  await loadShippingOptions()
  loadCheckoutAccountProfile()
  loadCampaignPreview()
  refreshCheckoutPreview()
})
const placeOrder = () => submitCurrentOrder()
const placeWalletOrder = paymentExecutor => submitCurrentOrder({ paymentExecutor })
const walletReady = computed(() => checkoutChecklist.value.slice(0, 3).every(step => step.complete) && !!trustedPricing.value && !isRefreshingCheckoutPreview.value)
const { campaigns, loadCampaigns } = useStorefrontCampaigns()
onMounted(loadCampaigns)
return { cartItems, customer, selectedShipping, shippingOptions, isLoadingShippingRates, shippingRateMessage, campaignPreview, isLoadingCampaignPreview, paymentFormComplete, accountProfile, isSignedInCheckout, profilePrefilled, checkoutAuthMode, stripePaymentForm, checkoutChecklist, isProcessingOrder, paymentCompleted, checkoutRequirementsComplete, checkoutStatus, checkoutStatusType, summarySubtotal, summaryDiscount, summaryShipping, summaryTax, summaryDonation, summaryTotal, totalCampaignDonation, itemCount, appliedPromoCode, isRefreshingCheckoutPreview, promoCode, promoStatus, promoMessage, formatPrice, buildSelectedShippingPayload, placeOrder, placeWalletOrder, walletReady, openCheckoutAuth, handleCheckoutAuthenticated, applyPromoCode, campaigns }

}
