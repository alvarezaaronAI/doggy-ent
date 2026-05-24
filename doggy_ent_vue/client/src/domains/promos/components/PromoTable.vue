
<script setup>
import PromoBadge from './PromoBadge.vue'
import PromoStatusPill from './PromoStatusPill.vue'

const props = defineProps({
  promos: {
    type: Array,
    required: true,
  },

  title: {
    type: String,
    required: true,
  },

  emptyMessage: {
    type: String,
    required: true,
  },

  countLabel: {
    type: String,
    required: true,
  },

  countClass: {
    type: String,
    default: 'bg-stone-100 text-stone-600',
  },
})

const emit = defineEmits([
  'test',
  'edit',
  'delete',
  'analytics',
])

function formatPrice(value) {
  return `$${Number(value || 0).toFixed(2)}`
}

function formatDiscount(promo) {
  if (promo.discountType === 'PERCENT') {
    return `${promo.discountValue}% OFF`
  }

  return `$${Number(promo.discountValue || 0).toFixed(2)} OFF`
}

function getUsageLabel(promo) {
  const total = promo.usageLimitTotal ?? 'Unlimited'
  return `${promo.usedCount || 0} / ${total} used`
}
</script>

<template>
  <section>
    <div class="mb-3 flex items-center justify-between gap-3">
      <h3 class="text-lg font-extrabold text-[var(--brand-4)]">
        {{ props.title }}
      </h3>

      <span
        class="rounded-full px-3 py-1 text-xs font-bold"
        :class="props.countClass"
      >
        {{ props.countLabel }}
      </span>
    </div>

    <div
      v-if="!props.promos.length"
      class="rounded-2xl border border-stone-200 bg-white/70 p-4 text-sm text-stone-400"
    >
      {{ props.emptyMessage }}
    </div>

    <div
      v-else
      class="overflow-x-auto rounded-2xl border border-stone-200 bg-white/70"
    >
      <table class="min-w-full text-left text-sm">
        <thead class="bg-[color:var(--brand-5)]/65 text-[var(--brand-4)]">
          <tr>
            <th class="px-5 py-4 font-extrabold">Code</th>
            <th class="px-5 py-4 font-extrabold">Type</th>
            <th class="px-5 py-4 font-extrabold">Status</th>
            <th class="px-5 py-4 font-extrabold">Discount</th>
            <th class="px-5 py-4 font-extrabold">Usage</th>
            <th class="px-5 py-4 font-extrabold">Performance</th>
            <th class="px-5 py-4 font-extrabold">Actions</th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="promo in props.promos"
            :key="promo.id"
            class="border-t border-stone-200 align-top"
          >
            <td class="px-5 py-4">
              <p class="font-extrabold text-[var(--brand-4)]">
                {{ promo.code }}
              </p>

              <p class="mt-1 text-xs text-stone-400">
                {{ promo.name }}
              </p>
            </td>

            <td class="px-5 py-4">
              <PromoBadge :type="promo.type" />

              <p
                v-if="promo.assignedCustomerEmail"
                class="mt-2 text-xs text-stone-400"
              >
                {{ promo.assignedCustomerEmail }}
              </p>
            </td>

            <td class="px-5 py-4">
              <PromoStatusPill :status="promo.status" />
            </td>

            <td class="px-5 py-4">
              <p class="font-bold">
                {{ formatDiscount(promo) }}
              </p>

              <p class="mt-1 text-xs text-stone-400">
                Minimum {{ formatPrice(promo.minimumSubtotal) }}
              </p>
            </td>

            <td class="px-5 py-4">
              <p class="font-bold">
                {{ getUsageLabel(promo) }}
              </p>

              <p
                v-if="promo.usageLimitTotal && promo.usedCount >= promo.usageLimitTotal"
                class="mt-1 text-xs font-bold text-red-600"
              >
                Limit reached
              </p>

              <p class="mt-1 text-xs text-stone-400">
                Per customer {{ promo.usageLimitPerCustomer || 'Unlimited' }}
              </p>
            </td>

            <td class="px-5 py-4">
              <p class="text-xs text-stone-400">
                Revenue
              </p>

              <p class="font-bold">
                {{ formatPrice(promo.revenueGenerated) }}
              </p>

              <p class="mt-2 text-xs text-stone-400">
                Discount
              </p>

              <p class="font-bold">
                {{ formatPrice(promo.discountGiven) }}
              </p>
            </td>

            <td class="px-5 py-4">
              <div class="flex flex-wrap gap-2">
                <button
                  class="rounded-lg border border-stone-700 px-3 py-2 text-xs font-bold text-stone-500 hover:border-emerald-400"
                  @click="emit('test', promo)"
                >
                  Test
                </button>

                <button
                  class="rounded-lg border border-blue-200 px-3 py-2 text-xs font-bold text-blue-600 hover:bg-blue-50"
                  @click="emit('analytics', promo)"
                >
                  Analytics
                </button>

                <button
                  class="rounded-lg border border-emerald-400 px-3 py-2 text-xs font-bold text-emerald-400 hover:bg-stone-900"
                  @click="emit('edit', promo)"
                >
                  Edit
                </button>

                <button
                  class="rounded-lg border border-red-200 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50"
                  @click="emit('delete', promo)"
                >
                  Delete
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>