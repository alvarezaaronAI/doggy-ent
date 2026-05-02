<script setup>
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'

const CART_STORAGE_KEY = 'doggy-ent-cart'
const PROMO_CODE = 'CHASE10'
const PROMO_DISCOUNT_AMOUNT = 10
const TAX_RATE = 0.075

const cartItems = ref(loadSavedCart())
const selectedShipping = ref('standard')
const promoCode = ref('')
const appliedPromoCode = ref('')
const promoMessage = ref('Try demo code CHASE10 to simulate a successful promo application.')
const promoStatus = ref('idle')
const checkoutStatus = ref('')
const checkoutStatusType = ref('')
const isProcessingOrder = ref(false)

const customer = ref({
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
})

const payment = ref({
  nameOnCard: '',
  cardNumber: '',
  expiry: '',
  cvc: '',
})

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

const discount = computed(() => (appliedPromoCode.value ? Math.min(PROMO_DISCOUNT_AMOUNT, subtotal.value) : 0))

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

function applyPromoCode() {
  const normalizedCode = promoCode.value.trim().toUpperCase()

  if (!normalizedCode) {
    appliedPromoCode.value = ''
    promoStatus.value = 'error'
    promoMessage.value = 'Enter a promo code to apply a discount.'
    return
  }

  if (normalizedCode === PROMO_CODE) {
    appliedPromoCode.value = PROMO_CODE
    promoCode.value = PROMO_CODE
    promoStatus.value = 'success'
    promoMessage.value = 'Promo code CHASE10 applied successfully. Demo discount of $10.00 added.'
    return
  }

  appliedPromoCode.value = ''
  promoStatus.value = 'error'
  promoMessage.value = `Promo code ${normalizedCode} is not valid.`
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

  const requiredPaymentFields = [
    payment.value.nameOnCard,
    payment.value.cardNumber,
    payment.value.expiry,
    payment.value.cvc,
  ]

  if (requiredPaymentFields.some((field) => !String(field || '').trim())) {
    checkoutStatusType.value = 'error'
    checkoutStatus.value = 'Please complete the payment fields before placing the order.'
    return false
  }

  checkoutStatus.value = ''
  checkoutStatusType.value = ''
  return true
}

function placeOrder() {
  if (!validateCheckout()) return

  isProcessingOrder.value = true
  checkoutStatus.value = ''

  window.setTimeout(() => {
    isProcessingOrder.value = false
    checkoutStatusType.value = 'success'
    checkoutStatus.value = 'Order placed successfully. A confirmation email and shipping updates will be sent shortly.'
  }, 900)
}
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

    <main>
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

        <div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(320px,420px)] lg:items-start">
          <section class="section-panel p-5 md:p-8">
            <div class="flex items-center justify-between gap-4 border-b border-stone-800 pb-5">
              <div>
                <p class="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-400">Checkout Flow</p>
                <h2 class="text-2xl font-extrabold">Secure order details</h2>
              </div>
              <div class="text-right">
                <p class="text-sm text-stone-300">Estimated time</p>
                <p class="font-bold">~2 minutes</p>
              </div>
            </div>

            <form class="mt-6 space-y-6" @submit.prevent="placeOrder">
              <div class="rounded-2xl border border-stone-800 bg-[color-mix(in_srgb,white_88%,var(--brand-5))] p-5">
                <div class="flex gap-4">
                  <span class="inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-emerald-400 font-extrabold text-[var(--brand-4)]">1</span>
                  <div class="min-w-0 flex-1">
                    <h3 class="text-xl font-extrabold">Contact</h3>
                    <p class="mt-1 text-sm text-stone-300">We’ll send your confirmation and shipping updates here.</p>

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
                    <p class="mt-1 text-sm text-stone-300">Enter the shipping address where you’d like your order delivered.</p>

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
                    <p class="mt-1 text-sm text-stone-300">Choose the shipping method that works best for your timeline.</p>

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
                          <p class="mt-1 text-sm text-stone-300">{{ option.description }}</p>
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
                    <p class="mt-1 text-sm text-stone-300">Use express checkout or enter card details below.</p>

                    <div class="mt-5 rounded-2xl border border-stone-700 bg-[color-mix(in_srgb,var(--brand-5)_48%,white)] p-4">
                      <div class="flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <p class="text-sm font-extrabold text-[var(--brand-4)]">Express checkout</p>
                          <p class="mt-1 text-sm text-stone-300">Pay faster with your saved wallet details.</p>
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

                    <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <input v-model="payment.nameOnCard" class="rounded-2xl border border-stone-700 bg-white px-4 py-3 outline-none focus:border-emerald-400 md:col-span-2" placeholder="Name on card" />
                      <input v-model="payment.cardNumber" class="rounded-2xl border border-stone-700 bg-white px-4 py-3 outline-none focus:border-emerald-400 md:col-span-2" placeholder="1234 1234 1234 1234" />
                      <input v-model="payment.expiry" class="rounded-2xl border border-stone-700 bg-white px-4 py-3 outline-none focus:border-emerald-400" placeholder="MM / YY" />
                      <input v-model="payment.cvc" class="rounded-2xl border border-stone-700 bg-white px-4 py-3 outline-none focus:border-emerald-400" placeholder="CVC" />
                    </div>

                    <div class="mt-5 rounded-2xl border border-stone-700 bg-[color-mix(in_srgb,var(--brand-5)_60%,white)] p-4">
                      <div class="flex items-start gap-3">
                        <i class="fa-solid fa-shield-heart mt-0.5 text-xl text-emerald-400"></i>
                        <div>
                          <p class="font-extrabold">Protected payment</p>
                          <p class="mt-1 text-sm text-stone-300">
                            Card fields are placeholders for now. Later this should become Stripe Elements or a hosted secure payment field.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="rounded-2xl border border-stone-700 bg-[color-mix(in_srgb,var(--brand-5)_48%,white)] p-5">
                <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <p class="max-w-2xl text-sm text-stone-300">
                    By placing your order, you agree to our store policies, shipping terms, and secure payment authorization.
                  </p>

                  <button
                    type="submit"
                    class="focus-ring rounded-2xl bg-emerald-400 px-6 py-4 font-extrabold text-[var(--brand-4)] shadow-md transition hover:-translate-y-0.5 hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60 md:min-w-[240px]"
                    :disabled="isProcessingOrder"
                  >
                    <i class="fa-solid fa-lock mr-2"></i>
                    {{ isProcessingOrder ? 'Processing...' : 'Place Secure Order' }}
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

          <aside class="space-y-4 lg:sticky lg:top-24">
            <section class="section-panel p-5 md:p-6">
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
                        <p class="mt-1 text-sm text-stone-300">{{ item.size }} • Qty {{ item.quantity }}</p>
                      </div>
                      <p class="font-extrabold">{{ formatPrice(item.price * item.quantity) }}</p>
                    </div>
                  </div>
                </article>
              </div>

              <div v-else class="mt-5 rounded-2xl border border-stone-800 bg-[color-mix(in_srgb,var(--brand-5)_55%,white)] p-4 text-sm text-stone-300">
                Your cart is empty. Return to the shop to add treats before checking out.
              </div>

              <div class="my-5 h-px bg-[color-mix(in_srgb,var(--brand-3)_30%,white)]"></div>

              <div class="space-y-3 text-sm">
                <div class="flex items-center justify-between">
                  <span class="text-stone-300">Subtotal</span>
                  <span class="font-bold">{{ formatPrice(subtotal) }}</span>
                </div>
                <div v-if="discount" class="flex items-start justify-between gap-3">
                  <div>
                    <span class="text-sm text-stone-300">Promo applied</span>
                    <p class="text-xs font-semibold text-[var(--brand-4)]">{{ appliedPromoCode }}</p>
                  </div>
                  <span class="font-bold text-[var(--success-1)]">-{{ formatPrice(discount) }}</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-stone-300">Shipping</span>
                  <span class="font-bold">{{ formatPrice(shippingPrice) }}</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-stone-300">Taxes</span>
                  <span class="font-bold">{{ formatPrice(tax) }}</span>
                </div>
              </div>

              <div class="my-5 h-px bg-[color-mix(in_srgb,var(--brand-3)_30%,white)]"></div>

              <div class="flex items-center justify-between text-lg">
                <span class="font-extrabold">Total</span>
                <span class="font-extrabold text-[var(--brand-4)]">{{ formatPrice(total) }}</span>
              </div>

              <div class="my-5 h-px bg-[color-mix(in_srgb,var(--brand-3)_30%,white)]"></div>

              <div>
                <h3 class="text-base font-extrabold">Promo code</h3>
                <p class="mt-1 text-sm text-stone-300">Have a discount code? Apply it before placing your order.</p>

                <div class="mt-4 flex flex-col gap-3 sm:flex-row">
                  <input
                    v-model="promoCode"
                    class="flex-1 rounded-2xl border bg-white px-4 py-3 outline-none focus:border-emerald-400"
                    :class="promoStatus === 'error' ? 'border-red-300 bg-red-50' : promoStatus === 'success' ? 'border-green-300 bg-green-50' : 'border-stone-700'"
                    placeholder="Enter promo code"
                    @keydown.enter.prevent="applyPromoCode"
                  />
                  <button type="button" class="focus-ring rounded-lg border border-emerald-400 px-5 py-3 font-semibold text-emerald-400 hover:bg-stone-900" @click="applyPromoCode">
                    <i class="fa-solid fa-tag mr-2"></i> Apply
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
              <RouterLink to="/" class="inline-flex items-center gap-2 font-semibold text-emerald-400 hover:underline">
                <i class="fa-solid fa-arrow-left"></i>
                Back to cart
              </RouterLink>
            </section>
          </aside>
        </div>
      </div>
    </main>
  </div>
</template>