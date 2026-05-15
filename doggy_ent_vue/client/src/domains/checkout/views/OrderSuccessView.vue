

<script setup>
import { computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'

const route = useRoute()

const orderId = computed(() => route.params.orderId || 'Pending')
</script>

<template>
  <div class="min-h-screen bg-[var(--brand-1)] text-[var(--brand-4)]">
    <section class="mx-auto flex max-w-4xl flex-col px-4 py-14 md:px-6 md:py-20">
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
              Your secure payment was successfully processed and your order is now being prepared.
            </p>
          </div>
        </div>

        <div class="grid gap-6 px-6 py-8 md:grid-cols-[minmax(0,1fr)_320px] md:px-10 md:py-10">
          <section class="rounded-3xl border border-stone-800 bg-white p-6 shadow-sm">
            <div class="flex items-center justify-between gap-4 border-b border-stone-200 pb-5">
              <div>
                <p class="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-500">
                  Order Reference
                </p>

                <h2 class="mt-2 text-2xl font-black text-[var(--brand-4)]">
                  #{{ orderId }}
                </h2>
              </div>

              <span class="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-700">
                <i class="fa-solid fa-badge-check"></i>
                Payment Approved
              </span>
            </div>

            <div class="mt-6 grid gap-4 md:grid-cols-2">
              <div class="rounded-2xl border border-stone-200 bg-stone-50 p-5">
                <p class="text-xs font-semibold uppercase tracking-[0.16em] text-stone-400">
                  Shipping Status
                </p>

                <p class="mt-3 text-lg font-black text-[var(--brand-4)]">
                  Preparing Order
                </p>

                <p class="mt-2 text-sm leading-relaxed text-stone-500">
                  Your treats are being prepared and packaged for shipment.
                </p>
              </div>

              <div class="rounded-2xl border border-stone-200 bg-stone-50 p-5">
                <p class="text-xs font-semibold uppercase tracking-[0.16em] text-stone-400">
                  Confirmation Email
                </p>

                <p class="mt-3 text-lg font-black text-[var(--brand-4)]">
                  Sent Successfully
                </p>

                <p class="mt-2 text-sm leading-relaxed text-stone-500">
                  A confirmation receipt and order summary will arrive shortly.
                </p>
              </div>
            </div>

            <div class="mt-8 flex flex-col gap-4 sm:flex-row">
              <RouterLink
                to="/"
                class="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-400 px-6 py-4 text-sm font-black uppercase tracking-[0.08em] text-[var(--brand-4)] transition hover:bg-emerald-300"
              >
                <i class="fa-solid fa-bag-shopping"></i>
                Continue Shopping
              </RouterLink>

              <RouterLink
                to="/cart"
                class="inline-flex items-center justify-center gap-2 rounded-2xl border border-stone-300 bg-white px-6 py-4 text-sm font-bold text-stone-600 transition hover:bg-stone-50"
              >
                <i class="fa-solid fa-cart-shopping"></i>
                View Cart
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
                    Fast fulfillment
                  </p>

                  <p class="mt-2 text-sm leading-relaxed text-stone-500">
                    Most orders are packed and shipped within 1–2 business days.
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
                    Payments are securely encrypted and processed through Stripe.
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