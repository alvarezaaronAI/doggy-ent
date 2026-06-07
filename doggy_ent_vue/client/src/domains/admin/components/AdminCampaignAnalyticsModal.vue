<script setup>
import {
  formatAdminCampaignPrice,
  formatCampaignDonationRule,
} from '../utils/adminCampaigns.utils'

const props = defineProps({
  campaign: {
    type: Object,
    required: true,
  },
  getCampaignProductNames: {
    type: Function,
    required: true,
  },
})

const emit = defineEmits([
  'close',
])

function formatDate(value) {
  if (!value) return 'N/A'

  return new Date(value).toLocaleString()
}

function getAverageOrderValue(campaign) {
  const orders = Number(campaign.orderCount || 0)

  if (!orders) {
    return 0
  }

  return Number(campaign.revenueGenerated || 0) / orders
}
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/70 p-4">
    <section class="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl md:p-6">
      <div class="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p class="text-xs font-bold uppercase tracking-[0.16em] text-emerald-500">Campaign analytics</p>
          <h2 class="mt-2 text-2xl font-extrabold text-[var(--brand-4)]">
            {{ campaign.name }}
          </h2>
          <p class="mt-1 text-sm text-stone-500">
            {{ campaign.donationTarget || 'No donation target set' }}
          </p>
        </div>

        <button
          type="button"
          class="rounded-lg border border-stone-300 px-4 py-2 text-sm font-bold text-stone-600 hover:border-emerald-400"
          @click="emit('close')"
        >
          Close
        </button>
      </div>

      <div class="mt-5 grid gap-3 md:grid-cols-4">
        <article class="rounded-xl border border-stone-200 bg-[var(--brand-5)] p-4">
          <p class="text-xs font-bold uppercase tracking-[0.12em] text-stone-400">Orders</p>
          <p class="mt-2 text-2xl font-extrabold text-[var(--brand-4)]">{{ campaign.orderCount || 0 }}</p>
        </article>

        <article class="rounded-xl border border-stone-200 bg-[var(--brand-5)] p-4">
          <p class="text-xs font-bold uppercase tracking-[0.12em] text-stone-400">Revenue</p>
          <p class="mt-2 text-2xl font-extrabold text-[var(--brand-4)]">{{ formatAdminCampaignPrice(campaign.revenueGenerated) }}</p>
        </article>

        <article class="rounded-xl border border-stone-200 bg-[var(--brand-5)] p-4">
          <p class="text-xs font-bold uppercase tracking-[0.12em] text-stone-400">Donation</p>
          <p class="mt-2 text-2xl font-extrabold text-[var(--success-1)]">{{ formatAdminCampaignPrice(campaign.donationGenerated) }}</p>
        </article>

        <article class="rounded-xl border border-stone-200 bg-[var(--brand-5)] p-4">
          <p class="text-xs font-bold uppercase tracking-[0.12em] text-stone-400">Avg order</p>
          <p class="mt-2 text-2xl font-extrabold text-[var(--brand-4)]">{{ formatAdminCampaignPrice(getAverageOrderValue(campaign)) }}</p>
        </article>
      </div>

      <dl class="mt-5 grid gap-4 rounded-xl border border-stone-200 p-4 text-sm md:grid-cols-2">
        <div>
          <dt class="font-bold text-stone-400">Products included</dt>
          <dd class="mt-1 text-[var(--brand-4)]">{{ getCampaignProductNames(campaign) }}</dd>
        </div>

        <div>
          <dt class="font-bold text-stone-400">Donation rule</dt>
          <dd class="mt-1 text-[var(--brand-4)]">{{ formatCampaignDonationRule(campaign) }}</dd>
        </div>

        <div>
          <dt class="font-bold text-stone-400">Start date</dt>
          <dd class="mt-1 text-[var(--brand-4)]">{{ formatDate(campaign.startsAt) }}</dd>
        </div>

        <div>
          <dt class="font-bold text-stone-400">End date</dt>
          <dd class="mt-1 text-[var(--brand-4)]">{{ formatDate(campaign.endsAt) }}</dd>
        </div>
      </dl>

      <div class="mt-6">
        <div class="flex items-center justify-between gap-3">
          <h3 class="text-lg font-extrabold text-[var(--brand-4)]">Recent campaign orders</h3>
          <span class="text-sm font-semibold text-stone-400">
            {{ campaign.orderAttributions?.length || 0 }} attributed
          </span>
        </div>

        <div v-if="!campaign.orderAttributions?.length" class="mt-3 rounded-xl border border-stone-200 bg-[var(--brand-5)] p-4 text-sm text-stone-500">
          No attributed orders have been recorded yet.
        </div>

        <div v-else class="mt-3 overflow-x-auto rounded-xl border border-stone-200">
          <table class="min-w-full text-left text-sm">
            <thead class="bg-[var(--brand-5)] text-[var(--brand-4)]">
              <tr>
                <th class="px-4 py-3 font-extrabold">Order Reference</th>
                <th class="px-4 py-3 font-extrabold">Customer Email</th>
                <th class="px-4 py-3 font-extrabold">Subtotal</th>
                <th class="px-4 py-3 font-extrabold">Donation Amount</th>
                <th class="px-4 py-3 font-extrabold">Order Total</th>
                <th class="px-4 py-3 font-extrabold">Created Date</th>
              </tr>
            </thead>

            <tbody>
              <tr
                v-for="usage in campaign.orderAttributions"
                :key="usage.id"
                class="border-t border-stone-200"
              >
                <td class="px-4 py-3 font-bold text-[var(--brand-4)]">
                  {{ usage.orderNumber || usage.orderId || 'Order' }}
                </td>
                <td class="px-4 py-3 text-stone-600">
                  {{ usage.customerEmail || 'N/A' }}
                </td>
                <td class="px-4 py-3">
                  {{ formatAdminCampaignPrice(usage.eligibleSubtotal) }}
                </td>
                <td class="px-4 py-3 font-bold text-[var(--success-1)]">
                  {{ formatAdminCampaignPrice(usage.donationAmount) }}
                </td>
                <td class="px-4 py-3">
                  {{ formatAdminCampaignPrice(usage.orderTotal) }}
                </td>
                <td class="px-4 py-3 text-stone-500">
                  {{ formatDate(usage.createdAt) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  </div>
</template>
