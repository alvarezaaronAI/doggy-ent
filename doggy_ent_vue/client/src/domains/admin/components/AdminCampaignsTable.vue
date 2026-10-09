<script setup>
import {
  formatAdminCampaignPrice,
  formatCampaignDonationRule,
} from '../utils/adminCampaigns.utils'
import AdminCampaignStatusBadge from './AdminCampaignStatusBadge.vue'
import AdminIcon from './AdminIcon.vue'
defineProps({
  campaigns: { type: Array, required: true },
  getCampaignProductNames: { type: Function, required: true },
})
const emit = defineEmits(['analytics', 'delete', 'edit'])
</script>
<template>
  <div class="admin-table-wrap">
    <table class="admin-table">
      <thead>
        <tr>
          <th>Campaign</th>
          <th>Donation rule</th>
          <th>Impact</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="campaign in campaigns" :key="campaign.id">
          <td data-label="Campaign">
            <button
              class="admin-link font-semibold"
              @click="emit('edit', campaign)"
            >
              {{ campaign.name }}
            </button>
            <p class="admin-muted">{{ campaign.donationTarget }}</p>
            <p class="admin-muted text-xs">
              {{ getCampaignProductNames(campaign) }}
            </p>
          </td>
          <td data-label="Donation rule">
            {{ formatCampaignDonationRule(campaign) }}
          </td>
          <td data-label="Impact">
            {{ formatAdminCampaignPrice(campaign.donationGenerated) }} generated
            <p class="admin-muted text-xs">
              {{ campaign.orderCount || 0 }} orders ·
              {{ formatAdminCampaignPrice(campaign.revenueGenerated) }} order
              value
            </p>
          </td>
          <td data-label="Status">
            <AdminCampaignStatusBadge :status="campaign.status" />
          </td>
          <td>
            <div class="flex gap-1">
              <button
                v-for="a in [
                  { event: 'analytics', icon: 'reports', label: 'View impact' },
                  { event: 'edit', icon: 'edit', label: 'Edit' },
                  { event: 'delete', icon: 'delete', label: 'Delete' },
                ]"
                :key="a.event"
                class="admin-icon-button"
                :aria-label="a.label + ' ' + campaign.name"
                :title="a.label + ' ' + campaign.name"
                @click="emit(a.event, campaign)"
              >
                <AdminIcon :name="a.icon" />
              </button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
