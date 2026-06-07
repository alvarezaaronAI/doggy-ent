<script setup>
import { computed, onMounted, ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import {
  fetchCheckoutOrder,
} from '../api/checkout.api'

const route = useRoute()

const order = ref(null)
const isLoading = ref(false)
const errorMessage = ref('')

const routeReference = computed(() =>
  String(route.params.orderId || '').trim(),
)

const orderReference = computed(() =>
  order.value?.customerReference
  || order.value?.orderNumber
  || routeReference.value
  || 'Pending',
)

const campaignAttributions = computed(() =>
  Array.isArray(order.value?.campaignAttributions)
    ? order.value.campaignAttributions
    : [],
)

function formatPrice(value) {
  return Number(value || 0).toLocaleString(undefined, {
    style: 'currency',
    currency: 'USD',
  })
}

function formatDate(value) {
  if (!value) return 'shortly'

  return new Date(value).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

async function loadOrder() {
  if (!routeReference.value || routeReference.value === 'pending') {
    return
  }

  isLoading.value = true
  errorMessage.value = ''

  try {
    order.value = await fetchCheckoutOrder(
      routeReference.value,
    )
  } catch (error) {
    errorMessage.value = error.message || 'Unable to load order confirmation.'
  } finally {
    isLoading.value = false
  }
}

onMounted(loadOrder)
</script>

<template>
  <div class="min-h-screen bg-[var(--brand-1)] text-[var(--brand-4)]">
    <section class="mx-auto flex max-w-5xl flex-col px-4 py-14 md:px-6 md:py-20">
      <div class="overflow-hidden rounded-[2rem] border border-stone-800 bg-[color-mix(in_srgb,var(--brand-5)_65%,white)] shadow-[0_30px_80px_rgba(0,0,0,0.08)]">
        <div class="border-b border-stone-800 px-6 py-8 md:px-10">
          <div class="flex flex-col items-center text-center">
            <span class="inline-flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-4xl text-emerald-600 shadow-inner">
              <i class="fa-solid fa-check"></i>
            </span>

            <p class="mt-6 text-xs font-semibold uppercase tracking-[0.24em] text-emerald-500">
              Order Confirmed
            </p>

            <h1 class="mt-3 text-4xl font-black tracking-tight text-[var(--brand-4)] md:text-5xl">
              Thank you for your order
            </h1>

            <p class="mt-4 max-w-2xl text-base leading-relaxed text-stone-500 md:text-lg">
              Your secure payment was processed and your treats are queued for fulfillment.
            </p>
          </div>
        </div>

        <div class="grid gap-6 px-6 py-8 md:grid-cols-[minmax(0,1fr)_340px] md:px-10 md:py-10">
          <section class="rounded-3xl border border-stone-800 bg-white p-6 shadow-sm">
            <div class="flex flex-col gap-4 border-b border-stone-200 pb-5 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p class="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-500">
                  Order Reference
                </p>

                <h2 class="mt-2 text-2xl font-black text-[var(--brand-4)]">
                  {{ orderReference }}
                </h2>

                <p class="mt-2 text-sm text-stone-500">
                  Confirmed {{ formatDate(order?.createdAt) }}
                </p>
              </div>

              <span class="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-700">
                <i class="fa-solid fa-circle-check"></i>
                Payment approved
              </span>
            </div>

            <div v-if="isLoading" class="mt-6 rounded-2xl border border-stone-200 bg-stone-50 p-5 text-sm font-semibold text-stone-500">
              Loading your order details...
            </div>

            <div v-else-if="errorMessage" class="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm font-semibold text-amber-700">
              {{ errorMessage }}
            </div>

            <template v-if="order">
              <div class="mt-6 grid gap-4 md:grid-cols-2">
                <div class="rounded-2xl border border-stone-200 bg-stone-50 p-5">
                  <p class="text-xs font-semibold uppercase tracking-[0.16em] text-stone-400">
                    Fulfillment Status
                  </p>

                  <p class="mt-3 text-lg font-black text-[var(--brand-4)]">
                    Preparing order
                  </p>

                  <p class="mt-2 text-sm leading-relaxed text-stone-500">
                    Most orders are packed and shipped within 1-2 business days.
                  </p>
                </div>

                <div class="rounded-2xl border border-stone-200 bg-stone-50 p-5">
                  <p class="text-xs font-semibold uppercase tracking-[0.16em] text-stone-400">
                    Confirmation Email
                  </p>

                  <p class="mt-3 text-lg font-black text-[var(--brand-4)]">
                    Receipt summary ready
                  </p>

                  <p class="mt-2 text-sm leading-relaxed text-stone-500">
                    A confirmation email should arrive shortly at {{ order.customerEmail || 'your checkout email' }}.
                  </p>
                </div>
              </div>

              <section class="mt-8">
                <div class="flex items-center justify-between gap-3">
                  <h3 class="text-lg font-black text-[var(--brand-4)]">Items</h3>
                  <p class="text-sm font-semibold text-stone-500">{{ order.items.length }} item{{ order.items.length === 1 ? '' : 's' }}</p>
                </div>

                <div class="mt-4 divide-y divide-stone-100 rounded-2xl border border-stone-200">
                  <div
                    v-for="item in order.items"
                    :key="`${item.id}-${item.size}`"
                    class="flex gap-4 p-4"
                  >
                    <div class="h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-stone-200 bg-[var(--brand-5)]">
                      <img
                        v-if="item.productImage"
                        :src="item.productImage"
                        :alt="item.productName"
                        class="h-full w-full object-cover"
                      />
                    </div>

                    <div class="min-w-0 flex-1">
                      <div class="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <p class="font-black text-[var(--brand-4)]">{{ item.productName }}</p>
                          <p class="mt-1 text-sm text-stone-500">Variant: {{ item.size }} · Qty {{ item.quantity }}</p>
                        </div>
                        <p class="font-black text-[var(--brand-4)]">{{ formatPrice(item.lineTotal) }}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <section class="mt-8 rounded-2xl border border-stone-200 bg-stone-50 p-5">
                <h3 class="text-lg font-black text-[var(--brand-4)]">Order Summary</h3>
                <div class="mt-4 space-y-3 text-sm">
                  <div class="flex justify-between gap-3">
                    <span class="text-stone-500">Subtotal</span>
                    <span class="font-bold">{{ formatPrice(order.subtotal) }}</span>
                  </div>
                  <div class="flex justify-between gap-3">
                    <span class="text-stone-500">Discount</span>
                    <span class="font-bold">-{{ formatPrice(order.discountAmount) }}</span>
                  </div>
                  <div class="flex justify-between gap-3">
                    <span class="text-stone-500">Shipping</span>
                    <span class="font-bold">{{ formatPrice(order.shippingAmount) }}</span>
                  </div>
                  <div class="flex justify-between gap-3">
                    <span class="text-stone-500">Tax</span>
                    <span class="font-bold">{{ formatPrice(order.taxAmount) }}</span>
                  </div>
                  <div class="flex justify-between gap-3">
                    <span class="text-stone-500">Donation generated</span>
                    <span class="font-bold text-emerald-700">{{ formatPrice(order.donationAmount) }}</span>
                  </div>
                  <div v-if="campaignAttributions.length" class="rounded-xl bg-white px-3 py-2 text-xs font-semibold text-stone-500">
                    Donation supports {{ campaignAttributions.map((campaign) => campaign.campaignName || campaign.donationTarget).filter(Boolean).join(', ') }}.
                  </div>
                </div>

                <div class="mt-4 border-t border-stone-200 pt-4">
                  <div class="flex justify-between gap-3 text-lg">
                    <span class="font-black">Total</span>
                    <span class="font-black text-[var(--brand-4)]">{{ formatPrice(order.total) }}</span>
                  </div>
                </div>
              </section>
            </template>

            <div class="mt-8 flex flex-col gap-4 sm:flex-row">
              <RouterLink
                to="/"
                class="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-400 px-6 py-4 text-sm font-black uppercase tracking-[0.08em] text-[var(--brand-4)] transition hover:bg-emerald-300"
              >
                <i class="fa-solid fa-bag-shopping"></i>
                Continue Shopping
              </RouterLink>
            </div>
          </section>

          <aside class="space-y-4">
            <section class="rounded-3xl border border-stone-800 bg-white p-6 shadow-sm">
              <div class="flex items-start gap-4">
                <span class="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[color-mix(in_srgb,var(--brand-5)_72%,white)] text-xl text-[var(--brand-4)]">
                  <i class="fa-solid fa-truck-fast"></i>
                </span>

                <div>
                  <p class="text-lg font-black text-[var(--brand-4)]">
                    What happens next
                  </p>

                  <p class="mt-2 text-sm leading-relaxed text-stone-500">
                    We will prepare, pack, and ship your treats. Watch your email for shipping updates.
                  </p>
                </div>
              </div>
            </section>

            <section class="rounded-3xl border border-stone-800 bg-white p-6 shadow-sm">
              <div class="flex items-start gap-4">
                <span class="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[color-mix(in_srgb,var(--brand-5)_72%,white)] text-xl text-[var(--brand-4)]">
                  <i class="fa-solid fa-shield-heart"></i>
                </span>

                <div>
                  <p class="text-lg font-black text-[var(--brand-4)]">
                    Secure checkout
                  </p>

                  <p class="mt-2 text-sm leading-relaxed text-stone-500">
                    Payments are encrypted and processed through Stripe. We do not show payment identifiers on this customer page.
                  </p>
                </div>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </section>
  </div>
</template>
