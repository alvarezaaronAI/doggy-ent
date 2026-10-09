<script setup>
import { CAMPAIGN_STATUS_FILTER_OPTIONS } from '../constants/adminCampaigns.constants'
import AdminCampaignsTable from './AdminCampaignsTable.vue'
import AdminIcon from './AdminIcon.vue'
defineProps({
  campaignGroups: Array,
  campaigns: { type: Array, required: true },
  filteredCampaigns: { type: Array, required: true },
  getCampaignProductNames: { type: Function, required: true },
  isLoading: Boolean,
})
const campaignSearchQuery = defineModel('campaignSearchQuery', {
  type: String,
  required: true,
})
const campaignStatusFilter = defineModel('campaignStatusFilter', {
  type: String,
  required: true,
})
const emit = defineEmits([
  'analytics',
  'clear-filters',
  'delete',
  'edit',
  'refresh',
])
</script>
<template>
  <section>
    <div class="admin-filters">
      <label class="admin-field grow"
        >Search campaigns<input
          v-model="campaignSearchQuery"
          type="search"
          placeholder="Campaign or beneficiary"
      /></label>
      <label class="admin-field"
        >Status<select aria-label="Status" v-model="campaignStatusFilter">
          <option
            v-for="o in CAMPAIGN_STATUS_FILTER_OPTIONS"
            :key="o.value"
            :value="o.value"
          >
            {{ o.label }}
          </option>
        </select></label
      >
      <button
        class="admin-icon-button"
        title="Refresh campaigns"
        aria-label="Refresh campaigns"
        :disabled="isLoading"
        @click="emit('refresh')"
      >
        <AdminIcon name="refresh" />
      </button>
      <button class="admin-link" @click="emit('clear-filters')">Clear</button>
    </div>
    <p class="admin-muted my-4">
      {{ filteredCampaigns.length }} of {{ campaigns.length }} campaigns
    </p>
    <p v-if="isLoading" class="admin-state" role="status">
      Loading campaigns...
    </p>
    <p v-else-if="!filteredCampaigns.length" class="admin-state">
      {{
        campaigns.length
          ? 'No campaigns match your filters.'
          : 'No campaigns yet.'
      }}
    </p>
    <AdminCampaignsTable
      v-else
      :campaigns="filteredCampaigns"
      :get-campaign-product-names="getCampaignProductNames"
      @analytics="emit('analytics', $event)"
      @delete="emit('delete', $event)"
      @edit="emit('edit', $event)"
    />
  </section>
</template>
