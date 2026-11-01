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
  calculateSubtotal,
} from '../utils/checkout.utils'

import { useCheckoutIdentity } from './useCheckoutIdentity.js'
import { useCheckoutShipping } from './useCheckoutShipping.js'
import { useCheckoutRecovery } from './useCheckoutRecovery.js'
import { cartFingerprint, clearRecoveredCart } from '../utils/checkoutRecovery.js'
import { rememberReceiptAccess } from '../utils/receiptAccess.js'
import { isUSShippingDestination } from '../constants/shippingDestinations.js'
import { useStorefrontCampaigns } from '@campaigns/composables/useStorefrontCampaigns.js'
export function useCheckoutPage() {
const CART_STORAGE_KEY = 'doggy-ent-cart'

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
  isProcessingOrder: legacyProcessing,
  hasSubmittedOrder,
  paymentCompleted: legacyPaymentCompleted,
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

function buildCheckoutPayload() {
  return {
    cartItems: cartItems.value,
    promoCode: appliedPromoCode.value || null,
    customer: { ...customer.value, country: customer.value.country === 'US' ? 'United States' : customer.value.country },
    shipping: buildSelectedShippingPayload(),
  }
}
let recoveredShipping = null
const recovery = useCheckoutRecovery({
  getPayload: buildCheckoutPayload,
  getTotal: () => summaryTotal.value,
  async onRestore(saved, fingerprint) {
    if (!['PREPARED', 'OPEN'].includes(saved.status) || await cartFingerprint(cartItems.value) !== fingerprint) return
    for (const key of ['email', 'phone', 'deliveryNotes', 'firstName', 'lastName', 'address1', 'address2', 'city', 'state', 'zip']) {
      if (!String(customer.value[key] || '').trim() && typeof saved.customer?.[key] === 'string') customer.value[key] = saved.customer[key]
    }
    if (saved.customer?.country && (!customer.value.country || customer.value.country === 'US')) customer.value.country = saved.customer.country === 'United States' ? 'US' : saved.customer.country
    recoveredShipping = saved.shipping
    if (saved.promo?.valid && typeof saved.promo.code === 'string') {
      promoCode.value = saved.promo.code; appliedPromoCode.value = saved.promo.code
    }
  },
  async onComplete(result, fingerprint) {
    rememberReceiptAccess(result.orderReference, result.receiptAccess)
    try {
      if (await clearRecoveredCart(CART_STORAGE_KEY, fingerprint)) {
        cartItems.value = []; campaignPreview.value = []; clearPromo()
        saveCustomerForNextCheckout(result.attempt.customer)
      }
    } catch { /* Receipt navigation must not depend on optional bag cleanup. */ }
    const failure = await router.push(`/order-success/${encodeURIComponent(result.orderReference)}`)
    if (failure) throw new Error('Confirmation navigation is not available.')
  },
})
const isProcessingOrder = computed(() => legacyProcessing.value || recovery.busy.value)
const paymentCompleted = computed(() => legacyPaymentCompleted.value || recovery.paid.value)
const paymentLocked = computed(() => isProcessingOrder.value || paymentCompleted.value || recovery.locked.value)
const recoveryUi = computed(() => ({
  visible: recovery.hasRecovery.value || recovery.blocked.value || (recovery.active.value && recovery.message.value),
  status: recovery.attempt.value?.status || '', message: recovery.message.value,
  busy: recovery.busy.value || recovery.initializing.value,
  canCheck: recovery.hasRecovery.value && !recovery.blocked.value,
  canCancel: recovery.canCancel.value, canFinalize: recovery.canFinalize.value, canPrepare: recovery.canPrepare.value, canStartNew: recovery.canStartNew.value,
  hideControls: recovery.initializing.value || recovery.blocked.value || (recovery.hasRecovery.value && !recovery.busy.value && recovery.locked.value),
  check: recovery.check, cancel: recovery.cancel, finalize: recovery.finalize, prepare: recovery.retryPreparation, startNew: recovery.startNew,
}))
const preparePayment = (payload, total) => recovery.preparePayment(payload, total)

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
    && isUSShippingDestination(customer.value)
    && !!selectedShippingOption.value
    && paymentRequirementsComplete.value
    && (paymentCompleted.value || pricingReady.value)
    && cartItems.value.length
    && !recovery.locked.value
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
      && customer.value.zip.trim()
      && isUSShippingDestination(customer.value),
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

const summaryCartItems = computed(() => recovery.attempt.value?.items || cartItems.value)
const itemCount = computed(() => calculateItemCount(summaryCartItems.value))

const discount = computed(() =>
  calculateDiscount({
    subtotal: subtotal.value,
    discountAmount: appliedPromoDiscount.value,
  })
)

const {
  checkoutPreviewResult,
  trustedPricing,
  checkoutPreviewError,
  isRefreshingCheckoutPreview,
  refreshCheckoutPreview,
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
  if (value == null) return 'Pending'
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

const pricingReady = computed(() => Boolean(trustedPricing.value)
  && trustedPricing.value.taxDetails?.status !== 'pending_address')
const frozenPricing = computed(() => recovery.attempt.value?.pricing || null)
const summaryTaxDetails = computed(() => recovery.attempt.value ? frozenPricing.value?.taxDetails || null : trustedPricing.value?.taxDetails || null)
const summaryPromo = computed(() => recovery.attempt.value ? recovery.attempt.value.promo : trustedPricing.value ? checkoutPreviewResult.value?.promo || null : null)
const summaryAppliedPromoCode = computed(() => recovery.attempt.value ? recovery.attempt.value.promo?.code || '' : appliedPromoCode.value)
const summaryCampaigns = computed(() => recovery.attempt.value ? recovery.attempt.value.campaigns : campaignPreview.value)
const campaignPreviewLoading = computed(() => !recovery.attempt.value && (isLoadingCampaignPreview.value || isRefreshingCheckoutPreview.value))

const summarySubtotal = computed(() => recovery.attempt.value ? frozenPricing.value?.subtotal ?? null : trustedPricing.value?.subtotal ?? subtotal.value)
const summaryDiscount = computed(() => recovery.attempt.value ? frozenPricing.value?.discountAmount ?? null : trustedPricing.value?.discountAmount ?? discount.value)
const summaryShipping = computed(() => recovery.attempt.value ? frozenPricing.value?.shippingAmount ?? null : trustedPricing.value?.shippingAmount ?? shippingPrice.value)
const summaryTax = computed(() => (
  recovery.attempt.value ? frozenPricing.value?.taxAmount ?? frozenPricing.value?.tax ?? null : pricingReady.value ? trustedPricing.value.taxAmount ?? trustedPricing.value.tax : null
))
const summaryDonation = computed(() => recovery.attempt.value ? frozenPricing.value?.donationAmount ?? summaryCampaigns.value.reduce((sum, campaign) => sum + Number(campaign.donationAmount || 0), 0) : trustedPricing.value?.donationAmount ?? totalCampaignDonation.value)
const summaryTotal = computed(() => recovery.attempt.value ? recovery.attempt.value.amountCents / 100 : pricingReady.value ? trustedPricing.value.total : null)
const summaryRefreshing = computed(() => !recovery.attempt.value && isRefreshingCheckoutPreview.value)
const summaryPreviewError = computed(() => recovery.attempt.value ? '' : checkoutPreviewError.value)


function validateCheckout({ wallet = false } = {}) {
  if (!paymentCompleted.value && !pricingReady.value) {
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

  if (!isUSShippingDestination(customer.value)) {
    checkoutStatusType.value = 'error'
    checkoutStatus.value = 'Shipping is available only to the 50 US states and District of Columbia. Choose a US shipping address.'
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
  },
  {
    deep: true,
  },
)

watch(
  cartItems,
  () => {
    scheduleShippingRates()
  },
  {
    deep: true,
  },
)

onMounted(async () => {
  await recovery.initialize()
  await loadShippingOptions()
  if (recoveredShipping?.method) {
    const saved = recoveredShipping
    shippingOptions.value = [{ ...saved, code: saved.method, label: saved.service || 'Saved delivery method' }, ...shippingOptions.value.filter(option => option.code !== saved.method)]
    selectedShipping.value = saved.method
  }
  loadCheckoutAccountProfile()
  loadCampaignPreview()
  refreshCheckoutPreview()
})
async function placeOrder() {
  if (recovery.initializing.value || !validateCheckout()) return false
  return recovery.active.value ? recovery.pay(() => stripePaymentForm.value.submitPayment(), () => validateCheckout()) : submitCurrentOrder()
}
async function placeWalletOrder(paymentExecutor) {
  if (recovery.initializing.value || !validateCheckout({ wallet: true })) return false
  return recovery.active.value ? recovery.pay(paymentExecutor, () => validateCheckout({ wallet: true })) : submitCurrentOrder({ paymentExecutor })
}
const walletReady = computed(() => !recovery.locked.value && checkoutChecklist.value.slice(0, 3).every(step => step.complete) && isUSShippingDestination(customer.value) && pricingReady.value)
const { campaigns, loadCampaigns } = useStorefrontCampaigns()
onMounted(loadCampaigns)
return { cartItems, customer, selectedShipping, shippingOptions, isLoadingShippingRates, shippingRateMessage, campaignPreview: summaryCampaigns, isLoadingCampaignPreview, paymentFormComplete, accountProfile, isSignedInCheckout, profilePrefilled, checkoutAuthMode, stripePaymentForm, checkoutChecklist, isProcessingOrder, paymentCompleted, checkoutRequirementsComplete, checkoutStatus, checkoutStatusType, summarySubtotal, summaryDiscount, summaryShipping, summaryTax, summaryTaxDetails, summaryPromo, summaryDonation, summaryTotal, totalCampaignDonation, itemCount, appliedPromoCode, isRefreshingCheckoutPreview, checkoutPreviewError, refreshCheckoutPreview, promoCode, promoStatus, promoMessage, formatPrice, buildSelectedShippingPayload, placeOrder, placeWalletOrder, walletReady, openCheckoutAuth, handleCheckoutAuthenticated, applyPromoCode, campaigns, paymentLocked, recoveryUi, preparePayment: computed(() => recovery.active.value ? preparePayment : undefined), summaryCartItems, summaryRefreshing, summaryPreviewError, summaryAppliedPromoCode, campaignPreviewLoading }

}
