<script setup>
import { formatPromoDiscount } from '../utils/promo.utils'

const props = defineProps({
  form: {
    type: Object,
    required: true,
  },

  result: {
    type: Object,
    default: null,
  },

  isTesting: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits([
  'submit',
])

function formatPrice(value) {
  return `$${Number(value || 0).toFixed(2)}`
}
</script>

<template>
  <section class="section-panel mb-8 p-5 md:p-6">
    <div class="flex flex-wrap items-start justify-between gap-4">
      <div>
        <p class="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-400">
          Test promo
        </p>

        <h2 class="mt-2 text-2xl font-extrabold text-[var(--brand-4)]">
          Preview code behavior
        </h2>

        <p class="mt-2 max-w-2xl text-sm text-stone-300">
          Check if a promo is valid for a subtotal and customer email before using it at checkout.
        </p>
      </div>
    </div>

    <form
      class="mt-5 grid gap-4 md:grid-cols-[1.2fr_0.8fr_1.2fr_auto] md:items-end"
      @submit.prevent="emit('submit')"
    >
      <label class="block">
        <span class="mb-2 block text-sm font-semibold text-[var(--brand-4)]">
          Promo code
        </span>

        <input
          v-model="props.form.code"
          required
          class="w-full rounded-2xl border border-stone-700 bg-white px-4 py-3 outline-none focus:border-emerald-400"
          placeholder="CHASE10"
        />
      </label>

      <label class="block">
        <span class="mb-2 block text-sm font-semibold text-[var(--brand-4)]">
          Subtotal
        </span>

        <input
          v-model.number="props.form.subtotal"
          type="number"
          min="0"
          step="0.01"
          class="w-full rounded-2xl border border-stone-700 bg-white px-4 py-3 outline-none focus:border-emerald-400"
        />
      </label>

      <label class="block">
        <span class="mb-2 block text-sm font-semibold text-[var(--brand-4)]">
          Customer email
        </span>

        <input
          v-model="props.form.customerEmail"
          type="email"
          class="w-full rounded-2xl border border-stone-700 bg-white px-4 py-3 outline-none focus:border-emerald-400"
          placeholder="optional for unique codes"
        />
      </label>

      <button
        type="submit"
        class="focus-ring rounded-lg bg-emerald-400 px-5 py-3 font-semibold text-[var(--brand-4)] hover:bg-emerald-300 disabled:opacity-60"
        :disabled="props.isTesting"
      >
        {{ props.isTesting ? 'Testing...' : 'Test Code' }}
      </button>
    </form>

    <div
      v-if="props.result"
      class="mt-5 rounded-2xl border p-4"
      :class="props.result.valid
        ? 'border-green-200 bg-green-50 text-green-800'
        : 'border-red-200 bg-red-50 text-red-800'"
    >
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p class="text-sm font-extrabold">
            {{ props.result.valid ? 'Promo is valid' : 'Promo is not valid' }}
          </p>

          <p class="mt-1 text-sm">
            {{ props.result.message }}
          </p>
        </div>

        <span class="rounded-full bg-white/70 px-3 py-1 text-xs font-bold">
          Status {{ props.result.statusCode }}
        </span>
      </div>

      <div
        v-if="props.result.valid"
        class="mt-4 grid gap-3 md:grid-cols-2"
      >
        <div class="rounded-xl bg-white/70 p-3">
          <p class="text-xs font-semibold opacity-70">
            Discount
          </p>

          <p class="mt-1 text-lg font-extrabold">
            {{ formatPrice(props.result.discountAmount) }}
          </p>
        </div>

        <div class="rounded-xl bg-white/70 p-3">
          <p class="text-xs font-semibold opacity-70">
            Referral owner
          </p>

          <p class="mt-1 text-sm font-extrabold">
            {{ props.result.referralOwnerName || 'None' }}
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

