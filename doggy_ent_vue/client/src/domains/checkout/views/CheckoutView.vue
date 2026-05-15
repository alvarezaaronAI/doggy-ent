<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import StripeElementsForm from '../components/StripeElementsForm.vue'

const CART_STORAGE_KEY = 'doggy-ent-cart'
const CUSTOMER_STORAGE_KEY = 'doggy-ent-checkout-customer'
const TAX_RATE = 0.075

const router = useRouter()

const cartItems = ref(loadSavedCart())
const selectedShipping = ref('standard')
const promoCode = ref('')
const appliedPromoCode = ref('')
const appliedPromoDiscount = ref(0)
const promoMessage = ref('Enter a promo code if you have one.')
const promoStatus = ref('idle')
const checkoutStatus = ref('')
const checkoutStatusType = ref('')
const isProcessingOrder = ref(false)
const checkoutResult = ref(null)
const campaignPreview = ref([])
const isLoadingCampaignPreview = ref(false)
const isRefreshingCheckoutPreview = ref(false)
const paymentCompleted = ref(false)
const completedPaymentIntent = ref(null)
const paymentFormComplete = ref(false)
const mobileSummaryOpen = ref(false)


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
    // Use actual shipping options to verify selection is valid
    complete: shippingOptions.some((option) => option.code === selectedShipping.value),
  },
  {
    id: 'payment',
    label: 'Payment information',
    complete: paymentFormComplete.value || paymentCompleted.value || !!completedPaymentIntent.value,
  },
])

const stripePaymentForm = ref(null)

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
    && paymentFormComplete.value
    && cartItems.value.length
  )
})

let checkoutPreviewTimer = null

const customer = ref(loadSavedCustomer())
function getEmptyCustomer() {
  return {
    email: '',
    phone: '',
    notes: '',
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
  cartItems.value.reduce((total, item) => total + Number(item.price || 0) * Number(item.quantity || 0), 0)
)

const itemCount = computed(() =>
  cartItems.value.reduce((total, item) => total + Number(item.quantity || 0), 0)
)

const shippingPrice = computed(() =>
  shippingOptions.find((option) => option.code === selectedShipping.value)?.price || 0
)

const discount = computed(() => Math.min(Number(appliedPromoDiscount.value || 0), subtotal.value))

const taxableTotal = computed(() => Math.max(subtotal.value - discount.value + shippingPrice.value, 0))
const tax = computed(() => taxableTotal.value * TAX_RATE)
const total = computed(() => taxableTotal.value + tax.value)

function loadSavedCart() {
  try {
    const savedCart = JSON.parse(localStorage.getItem(CART_STORAGE_KEY) || '[]')
    return Array.isArray(savedCart) ? savedCart : []
  } catch {
    return []
  }
}

function formatPrice(value) {
  return `$${Number(value || 0).toFixed(2)}`
}

async function loadCampaignPreview() {
  if (!cartItems.value.length) {
    campaignPreview.value = []
    return
  }

  isLoadingCampaignPreview.value = true

  try {
    const response = await fetch('/api/campaigns/preview', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        cartItems: cartItems.value,
      }),
    })

    if (!response.ok) throw new Error('Unable to preview donation campaigns.')

    const data = await response.json()
    campaignPreview.value = Array.isArray(data) ? data : []
  } catch {
    campaignPreview.value = []
  } finally {
    isLoadingCampaignPreview.value = false
  }
}


const totalCampaignDonation = computed(() =>
  campaignPreview.value.reduce((total, campaign) => total + Number(campaign.donationAmount || 0), 0)
)

const trustedPricing = computed(() => checkoutResult.value?.pricing || null)

const summarySubtotal = computed(() => trustedPricing.value?.subtotal ?? subtotal.value)
const summaryDiscount = computed(() => trustedPricing.value?.discountAmount ?? discount.value)
const summaryShipping = computed(() => trustedPricing.value?.shippingAmount ?? shippingPrice.value)
const summaryTax = computed(() => trustedPricing.value?.tax ?? tax.value)
const summaryDonation = computed(() => trustedPricing.value?.donationAmount ?? totalCampaignDonation.value)
const summaryTotal = computed(() => trustedPricing.value?.total ?? total.value)

async function applyPromoCode() {
  const normalizedCode = promoCode.value.trim().toUpperCase()

  if (!normalizedCode) {
    appliedPromoCode.value = ''
    appliedPromoDiscount.value = 0
    promoStatus.value = 'error'
    promoMessage.value = 'Enter a promo code to apply a discount.'
    return
  }

  promoStatus.value = 'checking'
  promoMessage.value = 'Checking promo code...'

  try {
    const response = await fetch('/api/promos/validate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code: normalizedCode,
        customerEmail: customer.value.email,
        cart: {
          items: cartItems.value,
          subtotal: subtotal.value,
        },
      }),
    })

    const data = await response.json()

    if (!response.ok || !data.valid) {
      appliedPromoCode.value = ''
      appliedPromoDiscount.value = 0
      promoStatus.value = 'error'
      promoMessage.value = data.message || `Promo code ${normalizedCode} is not valid.`
      return
    }

    appliedPromoCode.value = normalizedCode
    appliedPromoDiscount.value = Number(data.discountAmount || 0)
    promoCode.value = normalizedCode
    promoStatus.value = 'success'
    promoMessage.value = data.message || `Promo code ${normalizedCode} applied successfully.`
  } catch {
    appliedPromoCode.value = ''
    appliedPromoDiscount.value = 0
    promoStatus.value = 'error'
    promoMessage.value = 'Promo validation is not available yet. Please try again later.'
  }
}

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

  if (!stripePaymentForm.value) {
    checkoutStatusType.value = 'error'
    checkoutStatus.value = 'Secure payment form is still loading.'
    return false
  }

  checkoutStatus.value = ''
  checkoutStatusType.value = ''
  return true
}

async function submitCheckoutToBackend() {
  const response = await fetch('/api/checkout', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      cartItems: cartItems.value,
      promoCode: appliedPromoCode.value || null,
      customerEmail: customer.value.email,
      customer: customer.value,
      shipping: {
        method: selectedShipping.value,
        price: shippingPrice.value,
      },
    }),
  })

  const data = await response.json()

  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Checkout failed.')
  }

  return data
}

// Live checkout preview (separate endpoint)
async function submitCheckoutPreviewToBackend() {
  const response = await fetch('/api/checkout/preview', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      cartItems: cartItems.value,
      promoCode: appliedPromoCode.value || null,
      customerEmail: customer.value.email,
      customer: customer.value,
      shipping: {
        method: selectedShipping.value,
        price: shippingPrice.value,
      },
    }),
  })

  const data = await response.json()

  if (!response.ok || !data.success) {
    throw new Error(data.message || 'Checkout preview failed.')
  }

  return data
}

// Live backend checkout/tax preview
async function refreshCheckoutPreview() {
  if (!cartItems.value.length) {
    checkoutResult.value = null
    return
  }

  isRefreshingCheckoutPreview.value = true

  try {
    checkoutResult.value = await submitCheckoutPreviewToBackend()
  } catch {
    // Live preview should fail quietly. Final checkout still shows the real error.
  } finally {
    isRefreshingCheckoutPreview.value = false
  }
}

function scheduleCheckoutPreview() {
  window.clearTimeout(checkoutPreviewTimer)
  checkoutPreviewTimer = window.setTimeout(refreshCheckoutPreview, 350)
}

async function placeOrder() {
  if (!validateCheckout()) return

  isProcessingOrder.value = true

  try {
    if (!paymentCompleted.value) {
      const paymentResult = await stripePaymentForm.value.submitPayment()

      paymentCompleted.value = true
      completedPaymentIntent.value = paymentResult
    }
  } catch (error) {
    checkoutStatusType.value = 'error'
    checkoutStatus.value = error.message || 'Payment failed. Please try again.'
    return
  }

  checkoutStatus.value = ''
  checkoutResult.value = null

  try {
    const result = await submitCheckoutToBackend()

    checkoutResult.value = result
    saveCustomerForNextCheckout()

    // Clear checkout/cart state after successful order
    cartItems.value = []
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify([]))
    campaignPreview.value = []
    promoCode.value = ''
    appliedPromoCode.value = ''
    appliedPromoDiscount.value = 0
    promoStatus.value = 'idle'
    promoMessage.value = 'Enter a promo code if you have one.'
    paymentCompleted.value = false
    completedPaymentIntent.value = null

    checkoutStatusType.value = 'success'
    checkoutStatus.value = 'Order placed successfully! Redirecting...'

    await router.push(`/order-success/${result.order?.id || 'pending'}`)
  } catch (error) {
    checkoutStatusType.value = 'error'
    checkoutStatus.value = error.message || 'Checkout failed. Please try again.'
  } finally {
    isProcessingOrder.value = false
  }
}

watch(
  [
    selectedShipping,
    appliedPromoCode,
    () => customer.value.state,
    () => customer.value.zip,
    () => cartItems.value.map((item) => `${item.id}-${item.size}-${item.quantity}-${item.price}`).join('|'),
  ],
  () => {
    scheduleCheckoutPreview()
  }
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

    
<div
  v-if="isProcessingOrder"
  class="fixed inset-0 z-[120] flex items-center justify-center bg-white/78 backdrop-blur-md"
>
  <div class="mx-4 flex w-full max-w-md flex-col items-center rounded-[2rem] border border-stone-200 bg-white px-8 py-10 text-center shadow-[0_30px_80px_rgba(0,0,0,0.12)]">
    <div class="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-4xl text-emerald-600 shadow-inner">
      <i class="fa-solid fa-spinner animate-spin"></i>
    </div>

    <p class="mt-6 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-500">
      Secure Checkout
    </p>

    <h2 class="mt-3 text-3xl font-black tracking-tight text-[var(--brand-4)]">
      Processing Payment
    </h2>

    <p class="mt-4 text-sm leading-relaxed text-stone-500">
      Please wait while we securely confirm your payment. Do not refresh or close this window.
    </p>

    <div class="mt-6 h-2 w-full overflow-hidden rounded-full bg-stone-100">
      <div class="h-full w-1/2 animate-pulse rounded-full bg-emerald-400"></div>
    </div>
  </div>
</div>

<main class="pb-28 xl:pb-0">
      <div class="mx-auto max-w-7xl px-4 py-10">
        <div class="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p class="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-400">Secure Checkout</p>
            <h1 class="mt-2 text-3xl font-extrabold md:text-4xl">Complete your order</h1>
            <p class="mt-2 max-w-2xl text-stone-300">
              Review your order, enter your shipping details, and complete your purchase securely.
            </p>
          </div>

          <div class="flex flex-wrap gap-2">
            <span class="rounded-full border border-stone-800 bg-[color-mix(in_srgb,var(--brand-5)_72%,white)] px-3 py-2 text-sm font-bold text-[var(--brand-4)]">
              <i class="fa-solid fa-shield-heart mr-2"></i> Trusted flow
            </span>
            <span class="rounded-full border border-stone-800 bg-[color-mix(in_srgb,var(--brand-5)_72%,white)] px-3 py-2 text-sm font-bold text-[var(--brand-4)]">
              <i class="fa-solid fa-credit-card mr-2"></i> Encrypted payment
            </span>
          </div>
        </div>

        <div class="grid gap-6 xl:grid-cols-[220px_minmax(0,1.35fr)_minmax(320px,400px)] xl:items-start">
          <aside class="hidden xl:sticky xl:top-24 xl:block xl:self-start xl:max-w-[220px]">
            <section class="section-panel p-5">
              <div class="flex items-center justify-between gap-3">
                <div>
                  <p class="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-400">
                    Checkout Progress
                  </p>

                  <h2 class="mt-1 text-lg font-extrabold leading-tight">
                    Before checkout
                  </h2>
                </div>

                <span class="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--brand-5)_72%,white)] text-[var(--brand-4)]">
                  <i class="fa-solid fa-list-check"></i>
                </span>
              </div>

              <div class="mt-5 space-y-3">
                <div
                  v-for="item in checkoutChecklist"
                  :key="item.id"
                  class="flex items-center gap-3 rounded-2xl border px-3 py-3 transition"
                  :class="item.complete
                    ? 'border-emerald-200 bg-emerald-50/70'
                    : 'border-stone-700 bg-[color-mix(in_srgb,var(--brand-5)_55%,white)]'
                  "
                >
                  <span
                    class="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm"
                    :class="item.complete
                      ? 'bg-emerald-400 text-[var(--brand-4)]'
                      : 'bg-stone-200 text-stone-500'
                    "
                  >
                    <i
                      :class="item.complete
                        ? 'fa-solid fa-check'
                        : 'fa-solid fa-circle'
                      "
                    ></i>
                  </span>

                  <div class="min-w-0 flex-1">
                    <p class="text-sm font-bold leading-tight">
                      {{ item.label }}
                    </p>

                    <p
                      class="mt-0.5 text-xs font-medium"
                      :class="item.complete
                        ? 'text-emerald-700'
                        : 'text-stone-400'
                      "
                    >
                      {{ item.complete ? 'Completed' : 'Still required' }}
                    </p>
                  </div>
                </div>
              </div>

              <div
                class="mt-5 rounded-2xl border border-stone-700 bg-[color-mix(in_srgb,var(--brand-5)_55%,white)] p-4"
              >
                <div class="flex items-start gap-3">
                  <i class="fa-solid fa-shield-heart mt-0.5 text-emerald-400"></i>

                  <div>
                    <p class="text-sm font-bold leading-tight">
                      Secure checkout
                    </p>

                    <p class="mt-1 text-xs leading-relaxed text-stone-300">
                      Your card details are encrypted and securely processed through Stripe.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </aside>
          
<section class="sticky top-[73px] z-40 border-b border-stone-200 bg-white/92 px-4 py-3 backdrop-blur xl:hidden">
  <div class="flex items-center justify-between gap-3">
    <div>
      <p class="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-400">
        Checkout Progress
      </p>

      <div class="mt-2 flex gap-2 overflow-x-auto scrollbar-hide">
        <span
          v-for="item in checkoutChecklist"
          :key="item.id"
          class="inline-flex flex-shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold whitespace-nowrap"
          :class="item.complete
            ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
            : 'border-stone-700 bg-[color-mix(in_srgb,var(--brand-5)_55%,white)] text-stone-400'
          "
        >
          <i :class="item.complete ? 'fa-solid fa-check' : 'fa-regular fa-circle'"></i>
          {{ item.label }}
        </span>
      </div>
    </div>
  </div>
</section>

<section
            class="section-panel p-5 md:p-8"
            :class="isProcessingOrder ? 'pointer-events-none opacity-75' : ''"
          >            <div class="flex items-center justify-between gap-4 border-b border-stone-800 pb-5">
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
              <div class="rounded-2xl border border-stone-800 bg-[color-mix(in_srgb,white_88%,var(--brand-5))] p-5">
                <div class="flex gap-4">
                  <span class="inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-emerald-400 font-extrabold text-[var(--brand-4)]">1</span>
                  <div class="min-w-0 flex-1">
                    <h3 class="text-xl font-extrabold">Contact</h3>
                    <p class="mt-1 text-xs leading-relaxed text-stone-300">We’ll send your confirmation and shipping updates here.</p>

                    <div class="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                      <label class="md:col-span-2">
                        <span class="mb-2 block text-xs font-extrabold uppercase tracking-[0.08em] text-[var(--brand-4)]">Email address</span>
                        <input v-model="customer.email" type="email" class="w-full rounded-2xl border border-stone-700 bg-white px-4 py-3 outline-none focus:border-emerald-400" placeholder="you@example.com" />
                      </label>

                      <label>
                        <span class="mb-2 block text-xs font-extrabold uppercase tracking-[0.08em] text-[var(--brand-4)]">Phone number</span>
                        <input v-model="customer.phone" type="tel" class="w-full rounded-2xl border border-stone-700 bg-white px-4 py-3 outline-none focus:border-emerald-400" placeholder="(555) 555-5555" />
                      </label>

                      <label>
                        <span class="mb-2 block text-xs font-extrabold uppercase tracking-[0.08em] text-[var(--brand-4)]">Delivery notes</span>
                        <input v-model="customer.notes" type="text" class="w-full rounded-2xl border border-stone-700 bg-white px-4 py-3 outline-none focus:border-emerald-400" placeholder="Gate code, apartment, etc." />
                      </label>
                    </div>

                    <div class="mt-4 space-y-2">
                      <label class="flex items-start gap-2 text-sm text-stone-300">
                        <input v-model="customer.saveInfo" type="checkbox" class="mt-1" />
                        <span>Save my information for faster checkout next time.</span>
                      </label>
                      <label class="flex items-start gap-2 text-sm text-stone-300">
                        <input v-model="customer.marketingOptIn" type="checkbox" class="mt-1" />
                        <span>Email me exclusive offers, new drops, and rewards updates.</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div class="rounded-2xl border border-stone-800 bg-[color-mix(in_srgb,white_88%,var(--brand-5))] p-5">
                <div class="flex gap-4">
                  <span class="inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-emerald-400 font-extrabold text-[var(--brand-4)]">2</span>
                  <div class="min-w-0 flex-1">
                    <h3 class="text-xl font-extrabold">Shipping</h3>
                    <p class="mt-1 text-xs leading-relaxed text-stone-300">Enter the shipping address where you’d like your order delivered.</p>

                    <div class="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                      <input v-model="customer.firstName" class="rounded-2xl border border-stone-700 bg-white px-4 py-3 outline-none focus:border-emerald-400" placeholder="First name" />
                      <input v-model="customer.lastName" class="rounded-2xl border border-stone-700 bg-white px-4 py-3 outline-none focus:border-emerald-400" placeholder="Last name" />
                      <input v-model="customer.address1" class="rounded-2xl border border-stone-700 bg-white px-4 py-3 outline-none focus:border-emerald-400 md:col-span-2" placeholder="Street address" />
                      <input v-model="customer.address2" class="rounded-2xl border border-stone-700 bg-white px-4 py-3 outline-none focus:border-emerald-400 md:col-span-2" placeholder="Apartment, suite, etc. Optional" />
                      <input v-model="customer.city" class="rounded-2xl border border-stone-700 bg-white px-4 py-3 outline-none focus:border-emerald-400" placeholder="City" />
                      <select v-model="customer.state" class="rounded-2xl border border-stone-700 bg-white px-4 py-3 outline-none focus:border-emerald-400">
                        <option value="">Select state</option>
                        <option value="CA">California</option>
                        <option value="NV">Nevada</option>
                        <option value="AZ">Arizona</option>
                        <option value="OR">Oregon</option>
                      </select>
                      <input v-model="customer.zip" class="rounded-2xl border border-stone-700 bg-white px-4 py-3 outline-none focus:border-emerald-400" placeholder="ZIP code" />
                      <select v-model="customer.country" class="rounded-2xl border border-stone-700 bg-white px-4 py-3 outline-none focus:border-emerald-400">
                        <option value="US">United States</option>
                        <option value="CA">Canada</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div class="rounded-2xl border border-stone-800 bg-[color-mix(in_srgb,white_88%,var(--brand-5))] p-5">
                <div class="flex gap-4">
                  <span class="inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-emerald-400 font-extrabold text-[var(--brand-4)]">3</span>
                  <div class="min-w-0 flex-1">
                    <h3 class="text-xl font-extrabold">Delivery</h3>
                    <p class="mt-1 text-xs leading-relaxed text-stone-300">Choose the shipping method that works best for your timeline.</p>

                    <div class="mt-5 space-y-3">
                      <label
                        v-for="option in shippingOptions"
                        :key="option.code"
                        class="flex cursor-pointer items-start justify-between gap-4 rounded-2xl border p-4 transition hover:-translate-y-0.5"
                        :class="selectedShipping === option.code ? 'border-emerald-400 bg-[color-mix(in_srgb,white_92%,var(--brand-5))] shadow-md' : 'border-stone-800 bg-white'"
                      >
                        <input v-model="selectedShipping" class="sr-only" type="radio" :value="option.code" />
                        <div>
                          <p class="font-extrabold">{{ option.label }}</p>
                          <p class="mt-1 text-xs leading-relaxed text-stone-300">{{ option.description }}</p>
                        </div>
                        <div class="font-extrabold">{{ formatPrice(option.price) }}</div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div class="rounded-2xl border border-stone-800 bg-[color-mix(in_srgb,white_88%,var(--brand-5))] p-5">
                <div class="flex gap-4">
                  <span class="inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-emerald-400 font-extrabold text-[var(--brand-4)]">4</span>
                  <div class="min-w-0 flex-1">
                    <h3 class="text-xl font-extrabold">Payment</h3>
                    <p class="mt-1 text-xs leading-relaxed text-stone-300">
                      Your payment details are securely processed with Stripe while keeping the Doggy Ent checkout experience.
                    </p>

                    <div class="mt-5 rounded-2xl border border-stone-700 bg-[color-mix(in_srgb,var(--brand-5)_48%,white)] p-4">
                      <div class="flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <p class="text-sm font-extrabold text-[var(--brand-4)]">Express checkout</p>
                          <p class="mt-1 text-xs leading-relaxed text-stone-300">Pay faster with your saved wallet details.</p>
                        </div>
                        <span class="rounded-full border border-stone-800 bg-white px-3 py-2 text-sm font-bold text-[var(--brand-4)]">
                          <i class="fa-solid fa-bolt mr-2"></i> Faster checkout
                        </span>
                      </div>

                      <div class="mt-4 grid gap-3 sm:grid-cols-3">
                        <button type="button" class="rounded-2xl bg-stone-900 px-4 py-4 font-extrabold text-white transition hover:-translate-y-0.5">Apple Pay</button>
                        <button type="button" class="rounded-2xl bg-stone-900 px-4 py-4 font-extrabold text-white transition hover:-translate-y-0.5">Google Pay</button>
                        <button type="button" class="rounded-2xl border border-stone-700 bg-white px-4 py-4 font-extrabold text-blue-800 transition hover:-translate-y-0.5">PayPal</button>
                      </div>
                    </div>

                    <div class="my-5 flex items-center gap-4 text-xs font-extrabold uppercase tracking-[0.08em] text-stone-400">
                      <div class="h-px flex-1 bg-[color-mix(in_srgb,var(--brand-3)_30%,white)]"></div>
                      Or pay with card
                      <div class="h-px flex-1 bg-[color-mix(in_srgb,var(--brand-3)_30%,white)]"></div>
                    </div>

                    
                    <div class="mt-5 rounded-2xl border border-stone-700 bg-[color-mix(in_srgb,var(--brand-5)_60%,white)] p-4">
                      <div class="flex items-start gap-3">
                        <i class="fa-solid fa-shield-heart mt-0.5 text-xl text-emerald-400"></i>
                        <div>
                          <p class="font-extrabold">Protected payment</p>
                          <p class="mt-1 text-xs leading-relaxed text-stone-300">
                            Your payment details are securely encrypted and processed through Stripe.
                          </p>
                        </div>
                      </div>
                    </div>
                    <div class="mt-5 overflow-hidden rounded-2xl border border-stone-700 bg-white shadow-sm">
                      <StripeElementsForm
                        ref="stripePaymentForm"
                        @card-complete="paymentFormComplete = $event"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div class="rounded-2xl border border-stone-700 bg-[color-mix(in_srgb,var(--brand-5)_48%,white)] p-5">
                <div class="hidden flex-col gap-4 md:flex-row md:items-center md:justify-between xl:flex">
                  <p class="max-w-2xl text-sm text-stone-300">
                    By placing your order, you agree to our store policies, shipping terms, and secure payment authorization.
                  </p>

                  <button
                    type="submit"
                    class="focus-ring rounded-2xl px-6 py-4 font-extrabold transition md:min-w-[240px]"
                    :disabled="isProcessingOrder || !checkoutRequirementsComplete"
                    :class="checkoutRequirementsComplete
                      ? 'bg-emerald-400 hover:bg-emerald-300 text-[var(--brand-4)] shadow-md hover:-translate-y-0.5'
                      : 'bg-stone-200 text-stone-400 shadow-none cursor-not-allowed grayscale saturate-0'
                    "
                  >
                    <i
                      :class="isProcessingOrder
                        ? 'fa-solid fa-spinner animate-spin mr-2'
                        : 'fa-solid fa-lock mr-2'
                      "
                    ></i>
                    {{ isProcessingOrder ? 'Processing Secure Payment...' : 'Complete Secure Order' }}
                  </button>
                </div>

                <div
                  v-if="checkoutStatus"
                  class="mt-4 rounded-2xl border p-4 text-sm font-bold"
                  :class="checkoutStatusType === 'success'
                    ? 'border-green-200 bg-green-50 text-green-800'
                    : 'border-red-200 bg-red-50 text-red-800'"
                >
                  {{ checkoutStatus }}
                </div>
              </div>
            </form>
          </section>

          
<section class="section-panel overflow-hidden xl:hidden mb-28">
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
            <section
              class="section-panel p-5 md:p-6"
              :class="mobileSummaryOpen ? 'block' : 'hidden xl:block'"
            >
              <div class="flex items-center justify-between gap-3">
                <div>
                  <p class="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-400">Order Summary</p>
                  <h2 class="text-2xl font-extrabold">Order summary</h2>
                </div>
                <span class="rounded-full border border-stone-800 bg-[color-mix(in_srgb,var(--brand-5)_72%,white)] px-3 py-2 text-sm font-bold text-[var(--brand-4)]">
                  <i class="fa-solid fa-bag-shopping mr-2"></i>{{ itemCount }} items
                </span>
              </div>

              <div v-if="cartItems.length" class="mt-5 space-y-4">
                <article v-for="item in cartItems" :key="`${item.id}-${item.size}`" class="flex gap-3">
                  <img class="h-[70px] w-[70px] flex-shrink-0 rounded-2xl border border-stone-800 object-cover" :src="item.image" :alt="item.name" />
                  <div class="min-w-0 flex-1">
                    <div class="flex items-start justify-between gap-3">
                      <div>
                        <h3 class="font-extrabold leading-tight">{{ item.name }}</h3>
                        <p class="mt-1 text-xs leading-relaxed text-stone-300">{{ item.size }} • Qty {{ item.quantity }}</p>
                      </div>
                      <p class="font-extrabold">{{ formatPrice(item.price * item.quantity) }}</p>
                    </div>
                  </div>
                </article>
              </div>

              <div v-else class="mt-5 rounded-2xl border border-stone-800 bg-[color-mix(in_srgb,var(--brand-5)_55%,white)] p-4 text-sm text-stone-300">
                Your cart is empty. Return to the shop to add treats before checking out.
              </div>

              <div
                v-if="isLoadingCampaignPreview"
                class="mt-5 rounded-2xl border border-stone-800 bg-[color-mix(in_srgb,var(--brand-5)_55%,white)] p-4 text-sm font-semibold text-stone-400"
              >
                Checking donation campaigns...
              </div>

              <div
                v-else-if="cartItems.length && campaignPreview.length"
                class="mt-5 rounded-2xl border border-green-200 bg-green-50 p-4 text-green-800"
              >
                <div class="flex items-start gap-3">
                  <i class="fa-solid fa-shield-dog mt-1 text-emerald-400"></i>
                  <div>
                    <p class="font-extrabold">This order helps dogs in need</p>
                    <p class="mt-1 text-sm">
                      Estimated donation from eligible items: {{ formatPrice(totalCampaignDonation) }}
                    </p>
                  </div>
                </div>

                <div class="mt-4 space-y-3">
                  <div
                    v-for="campaign in campaignPreview"
                    :key="campaign.campaignId"
                    class="rounded-xl bg-white/70 p-3 text-sm"
                  >
                    <div class="flex items-start justify-between gap-3">
                      <div>
                        <p class="text-sm font-bold leading-tight">{{ campaign.campaignName }}</p>
                        <p class="mt-1 text-xs opacity-80">Supports {{ campaign.donationTarget }}</p>
                      </div>
                      <p class="font-extrabold">{{ formatPrice(campaign.donationAmount) }}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div class="my-5 h-px bg-[color-mix(in_srgb,var(--brand-3)_30%,white)]"></div>

              <div class="space-y-3 text-sm">
                <div class="flex items-center justify-between">
                  <span class="text-stone-300">Subtotal</span>
                  <span class="font-bold">{{ formatPrice(summarySubtotal) }}</span>
                </div>
                <div v-if="summaryDiscount" class="flex items-start justify-between gap-3">
                  <div>
                    <span class="text-sm text-stone-300">Promo applied</span>
                    <p class="text-xs font-semibold text-[var(--brand-4)]">{{ appliedPromoCode }}</p>
                  </div>
                  <span class="font-bold text-[var(--success-1)]">-{{ formatPrice(summaryDiscount) }}</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-stone-300">Shipping</span>
                  <span class="font-bold">{{ formatPrice(summaryShipping) }}</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-stone-300">Taxes</span>
                  <span class="font-bold">{{ formatPrice(summaryTax) }}</span>
                </div>
                <div v-if="summaryDonation" class="flex items-center justify-between">
                  <span class="text-stone-300">Donation generated</span>
                  <span class="font-bold text-[var(--success-1)]">{{ formatPrice(summaryDonation) }}</span>
                </div>
              </div>

              <div class="my-5 h-px bg-[color-mix(in_srgb,var(--brand-3)_30%,white)]"></div>

              <div class="flex items-center justify-between text-lg">
                <span class="font-extrabold">Total</span>
                <span class="font-extrabold text-[var(--brand-4)]">{{ formatPrice(summaryTotal) }}</span>
              </div>
              <p v-if="isRefreshingCheckoutPreview" class="mt-2 text-xs font-semibold text-stone-400">
                Updating tax and total...
              </p>
              <p v-else-if="trustedPricing" class="mt-2 text-xs font-semibold text-[var(--success-1)]">
                Verified by backend checkout.
              </p>

              <div class="my-5 h-px bg-[color-mix(in_srgb,var(--brand-3)_30%,white)]"></div>

              <div v-if="cartItems.length">
                <h3 class="text-base font-extrabold">Promo code</h3>
                <p class="mt-1 text-xs leading-relaxed text-stone-300">Have a discount code? Apply it before placing your order.</p>

                <div class="mt-4 flex flex-col gap-3 sm:flex-row">
                  <input
                    v-model="promoCode"
                    class="flex-1 rounded-2xl border bg-white px-4 py-3 outline-none focus:border-emerald-400"
                    :class="promoStatus === 'error' ? 'border-red-300 bg-red-50' : promoStatus === 'success' ? 'border-green-300 bg-green-50' : promoStatus === 'checking' ? 'border-amber-300 bg-amber-50' : 'border-stone-700'"
                    placeholder="Enter promo code"
                    @keydown.enter.prevent="applyPromoCode"
                  />
                  <button
                    type="button"
                    class="focus-ring rounded-lg border border-emerald-400 px-5 py-3 font-semibold text-emerald-400 hover:bg-stone-900 disabled:cursor-not-allowed disabled:opacity-60"
                    :disabled="promoStatus === 'checking'"
                    @click="applyPromoCode"
                  >
                    <i class="fa-solid fa-tag mr-2"></i>
                    {{ promoStatus === 'checking' ? 'Checking...' : 'Apply' }}
                  </button>
                </div>

                <p class="mt-3 text-sm text-stone-300">{{ promoMessage }}</p>
              </div>
            </section>

            <section class="section-panel p-5 md:p-6">
              <h3 class="text-lg font-extrabold">Questions before you order?</h3>
              <ul class="mt-4 space-y-3 text-sm text-stone-300">
                <li class="flex gap-3"><i class="fa-solid fa-lock mt-1 text-emerald-400"></i><span>Secure payment processing and encrypted checkout protection.</span></li>
                <li class="flex gap-3"><i class="fa-solid fa-truck-fast mt-1 text-emerald-400"></i><span>Shipping options are shown before you place your order.</span></li>
                <li class="flex gap-3"><i class="fa-solid fa-envelope mt-1 text-emerald-400"></i><span>Order confirmation and tracking updates are sent by email after purchase.</span></li>
              </ul>
              <div class="my-5 h-px bg-[color-mix(in_srgb,var(--brand-3)_30%,white)]"></div>
              <RouterLink to="/cart" class="inline-flex items-center gap-2 font-semibold text-emerald-400 hover:underline">
                <i class="fa-solid fa-arrow-left"></i>
                Back to cart
              </RouterLink>
            </section>
          </aside>
        </div>
      </div>
    
<div class="fixed inset-x-0 bottom-0 z-[90] border-t border-stone-300 bg-white/95 p-4 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] backdrop-blur supports-[backdrop-filter]:bg-white/80 xl:hidden">
  <div class="mx-auto flex max-w-7xl items-center gap-3 pb-[env(safe-area-inset-bottom)]">
    <div class="min-w-0 flex-1">
      <p class="text-xs font-semibold uppercase tracking-[0.08em] text-stone-400">
        Total
      </p>

      <p class="truncate text-lg font-extrabold text-[var(--brand-4)]">
        {{ formatPrice(summaryTotal) }}
      </p>
    </div>

    <button
      type="button"
      @click="placeOrder"
      class="focus-ring rounded-2xl px-5 py-3 font-extrabold transition"
      :disabled="isProcessingOrder || !checkoutRequirementsComplete"
      :class="checkoutRequirementsComplete
        ? 'bg-emerald-400 text-[var(--brand-4)] shadow-md'
        : 'bg-stone-200 text-stone-400 shadow-none cursor-not-allowed grayscale saturate-0'
      "
    >
      <i
        :class="isProcessingOrder
          ? 'fa-solid fa-spinner animate-spin mr-2'
          : 'fa-solid fa-lock mr-2'
        "
      ></i>
      {{ isProcessingOrder ? 'Processing...' : 'Complete Order' }}
    </button>
  </div>
</div>

</main>
  </div>
</template>