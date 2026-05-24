

<script setup>
const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },

  analytics: {
    type: Object,
    default: null,
  },

  isLoading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits([
  'close',
])

function formatPrice(value) {
  return `$${Number(value || 0).toFixed(2)}`
}

function formatDate(value) {
  if (!value) {
    return 'Unknown'
  }

  return new Date(value).toLocaleString()
}
</script>

<template>
  <div
    v-if="props.isOpen"
    class="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 p-4"
  >
    <div class="w-full max-w-5xl rounded-3xl bg-white shadow-2xl">
      <div class="flex items-center justify-between border-b border-stone-200 px-6 py-5">
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-400">
            Promo analytics
          </p>

          <h2 class="mt-2 text-2xl font-extrabold text-[var(--brand-4)]">
            {{ props.analytics?.promo?.code || 'Analytics' }}
          </h2>
        </div>

        <button
          class="rounded-xl border border-stone-200 px-4 py-2 text-sm font-bold text-stone-500 hover:border-red-200 hover:text-red-600"
          @click="emit('close')"
        >
          Close
        </button>
      </div>

      <div class="max-h-[80vh] overflow-y-auto p-6">
        <div
          v-if="props.isLoading"
          class="flex items-center justify-center py-20 text-sm font-semibold text-stone-400"
        >
          Loading promo analytics...
        </div>

        <template v-else-if="props.analytics">
          <div class="grid gap-4 md:grid-cols-4">
            <div class="rounded-2xl border border-stone-200 bg-stone-50 p-4">
              <p class="text-xs font-semibold uppercase tracking-[0.14em] text-stone-400">
                Total Uses
              </p>

              <p class="mt-3 text-3xl font-black text-[var(--brand-4)]">
                {{ props.analytics.summary.totalUses }}
              </p>
            </div>

            <div class="rounded-2xl border border-stone-200 bg-stone-50 p-4">
              <p class="text-xs font-semibold uppercase tracking-[0.14em] text-stone-400">
                Revenue Generated
              </p>

              <p class="mt-3 text-3xl font-black text-[var(--brand-4)]">
                {{ formatPrice(props.analytics.summary.totalRevenue) }}
              </p>
            </div>

            <div class="rounded-2xl border border-stone-200 bg-stone-50 p-4">
              <p class="text-xs font-semibold uppercase tracking-[0.14em] text-stone-400">
                Discount Given
              </p>

              <p class="mt-3 text-3xl font-black text-[var(--brand-4)]">
                {{ formatPrice(props.analytics.summary.totalDiscountGiven) }}
              </p>
            </div>

            <div class="rounded-2xl border border-stone-200 bg-stone-50 p-4">
              <p class="text-xs font-semibold uppercase tracking-[0.14em] text-stone-400">
                Average Order Value
              </p>

              <p class="mt-3 text-3xl font-black text-[var(--brand-4)]">
                {{ formatPrice(props.analytics.summary.averageOrderValue) }}
              </p>
            </div>
          </div>

          <section class="mt-8">
            <div class="mb-4 flex items-center justify-between gap-3">
              <h3 class="text-lg font-extrabold text-[var(--brand-4)]">
                Redemption History
              </h3>

              <span class="rounded-full bg-stone-100 px-3 py-1 text-xs font-bold text-stone-600">
                {{ props.analytics.usages.length }} redemptions
              </span>
            </div>

            <div
              v-if="!props.analytics.usages.length"
              class="rounded-2xl border border-stone-200 bg-stone-50 p-6 text-sm text-stone-400"
            >
              No promo redemptions yet.
            </div>

            <div
              v-else
              class="overflow-x-auto rounded-2xl border border-stone-200"
            >
              <table class="min-w-full text-left text-sm">
                <thead class="bg-stone-50 text-[var(--brand-4)]">
                  <tr>
                    <th class="px-5 py-4 font-extrabold">Customer</th>
                    <th class="px-5 py-4 font-extrabold">Order</th>
                    <th class="px-5 py-4 font-extrabold">Subtotal</th>
                    <th class="px-5 py-4 font-extrabold">Discount</th>
                    <th class="px-5 py-4 font-extrabold">Redeemed At</th>
                  </tr>
                </thead>

                <tbody>
                  <tr
                    v-for="usage in props.analytics.usages"
                    :key="usage.id"
                    class="border-t border-stone-200"
                  >
                    <td class="px-5 py-4 font-semibold text-[var(--brand-4)]">
                      {{ usage.customerEmail || 'Guest' }}
                    </td>

                    <td class="px-5 py-4 text-stone-500">
                      {{ usage.orderId || 'Unknown' }}
                    </td>

                    <td class="px-5 py-4 font-bold text-[var(--brand-4)]">
                      {{ formatPrice(usage.subtotalAmount) }}
                    </td>

                    <td class="px-5 py-4 font-bold text-emerald-500">
                      {{ formatPrice(usage.discountAmount) }}
                    </td>

                    <td class="px-5 py-4 text-stone-500">
                      {{ formatDate(usage.createdAt) }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </template>
      </div>
    </div>
  </div>
</template>