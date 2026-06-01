
<script setup>
import { ref } from 'vue'
import StripeElementsForm from '@payments/components/StripeElementsForm.vue'

defineProps({
  cartItems: {
    type: Array,
    required: true,
  },
  checkoutTotal: {
    type: Number,
    required: true,
  },
})

const emit = defineEmits([
  'card-complete',
])

const stripeElementsForm = ref(null)

defineExpose({
  async confirmPayment(...args) {
    return await stripeElementsForm.value?.confirmPayment(...args)
  },
})
</script>

<template>
  <div class="rounded-2xl border border-stone-800 bg-[color-mix(in_srgb,white_88%,var(--brand-5))] p-5">
    <div class="flex gap-4">
      <span class="inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-emerald-400 font-extrabold text-[var(--brand-4)]">
        4
      </span>

      <div class="min-w-0 flex-1">
        <h3 class="text-xl font-extrabold">Payment</h3>
        <p class="mt-1 text-xs leading-relaxed text-stone-300">
          Your payment details are securely processed with Stripe while keeping the Doggy Ent checkout experience.
        </p>

        <div class="mt-5 rounded-2xl border border-stone-700 bg-[color-mix(in_srgb,var(--brand-5)_48%,white)] p-4">
          <div class="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p class="text-sm font-extrabold text-[var(--brand-4)]">Express checkout</p>
              <p class="mt-1 text-xs leading-relaxed text-stone-300">
                Pay faster with your saved wallet details.
              </p>
            </div>

            <span class="rounded-full border border-stone-800 bg-white px-3 py-2 text-sm font-bold text-[var(--brand-4)]">
              <i class="fa-solid fa-bolt mr-2"></i> Faster checkout
            </span>
          </div>

          <div class="mt-4 grid gap-3 sm:grid-cols-3">
            <button
              type="button"
              class="rounded-2xl bg-stone-900 px-4 py-4 font-extrabold text-white transition hover:-translate-y-0.5"
            >
              Apple Pay
            </button>

            <button
              type="button"
              class="rounded-2xl bg-stone-900 px-4 py-4 font-extrabold text-white transition hover:-translate-y-0.5"
            >
              Google Pay
            </button>

            <button
              type="button"
              class="rounded-2xl border border-stone-700 bg-white px-4 py-4 font-extrabold text-blue-800 transition hover:-translate-y-0.5"
            >
              PayPal
            </button>
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
            ref="stripeElementsForm"
            :cart-items="cartItems"
            :checkout-total="checkoutTotal"
            @card-complete="emit('card-complete', $event)"
          />
        </div>
      </div>
    </div>
  </div>
</template>