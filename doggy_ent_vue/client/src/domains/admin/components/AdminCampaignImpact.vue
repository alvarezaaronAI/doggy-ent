<script setup>
import {
  formatAdminCampaignPrice,
  formatCampaignDonationRule,
} from '../utils/adminCampaigns.utils'
import AdminIcon from './AdminIcon.vue'
import AdminMetrics from './AdminMetrics.vue'
defineProps({
  campaign: { type: Object, required: true },
  getCampaignProductNames: { type: Function, required: true },
})
const emit = defineEmits(['close'])
const date = (value) =>
  value ? new Date(value).toLocaleString() : 'Not scheduled'
</script>
<template>
  <section>
    <button class="admin-link mb-6" @click="emit('close')">
      <AdminIcon name="back" /> Back to campaigns
    </button>
    <h2 class="text-xl font-semibold">{{ campaign.name }}</h2>
    <p class="admin-muted mt-2">{{ campaign.donationTarget }}</p>
    <AdminMetrics
      :items="[
        { label: 'Attributed orders', value: campaign.orderCount || 0 },
        {
          label: 'Attributed order value',
          value: formatAdminCampaignPrice(campaign.revenueGenerated),
        },
        {
          label: 'Donations generated',
          value: formatAdminCampaignPrice(campaign.donationGenerated),
        },
      ]"
    />
    <dl class="admin-form-grid admin-form-section">
      <div>
        <dt class="admin-muted">Donation rule</dt>
        <dd>{{ formatCampaignDonationRule(campaign) }}</dd>
      </div>
      <div>
        <dt class="admin-muted">Eligible products</dt>
        <dd>{{ getCampaignProductNames(campaign) }}</dd>
      </div>
      <div>
        <dt class="admin-muted">Starts</dt>
        <dd>{{ date(campaign.startsAt) }}</dd>
      </div>
      <div>
        <dt class="admin-muted">Ends</dt>
        <dd>{{ date(campaign.endsAt) }}</dd>
      </div>
    </dl>
    <p class="admin-muted my-5">
      Generated donations are recorded against orders. Payout reconciliation is
      not available yet.
    </p>
    <h3 class="text-lg font-semibold mb-4">Attributed orders</h3>
    <p v-if="!campaign.orderAttributions?.length" class="admin-state">
      No attributed orders recorded.
    </p>
    <div v-else class="admin-table-wrap">
      <table class="admin-table">
        <thead>
          <tr>
            <th>Order</th>
            <th>Customer</th>
            <th>Eligible subtotal</th>
            <th>Donation</th>
            <th>Order total</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="usage in campaign.orderAttributions" :key="usage.id">
            <td data-label="Order">
              <RouterLink
                v-if="usage.orderId"
                :to="'/admin/orders/' + usage.orderId"
                class="admin-link"
                >{{ usage.orderNumber || usage.orderId }}</RouterLink
              ><span v-else>{{ usage.orderNumber || 'Unavailable' }}</span>
            </td>
            <td data-label="Customer">{{ usage.customerEmail || 'Guest' }}</td>
            <td data-label="Eligible subtotal">
              {{ formatAdminCampaignPrice(usage.eligibleSubtotal) }}
            </td>
            <td data-label="Donation">
              {{ formatAdminCampaignPrice(usage.donationAmount) }}
            </td>
            <td data-label="Order total">
              {{ formatAdminCampaignPrice(usage.orderTotal) }}
            </td>
            <td data-label="Date">{{ date(usage.createdAt) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>
