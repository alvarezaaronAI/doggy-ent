<script setup>
import { onMounted } from 'vue'
import AdminCampaignForm from '../components/AdminCampaignForm.vue'
import AdminCampaignAnalyticsModal from '../components/AdminCampaignAnalyticsModal.vue'
import AdminCampaignsHeader from '../components/AdminCampaignsHeader.vue'
import AdminCampaignsLibrary from '../components/AdminCampaignsLibrary.vue'
import AdminCampaignsStats from '../components/AdminCampaignsStats.vue'
import { useAdminCampaigns } from '../composables/useAdminCampaigns'

const {
  activeCampaigns,
  campaignGroups,
  campaignSearchQuery,
  campaignStatusFilter,
  campaigns,
  clearCampaignFilters,
  closeCampaignAnalytics,
  deleteCampaign,
  editCampaign,
  editingCampaignId,
  errorMessage,
  filteredCampaigns,
  form,
  getCampaignProductNames,
  isLoading,
  isSaving,
  loadPageData,
  openCampaignAnalytics,
  products,
  resetForm,
  saveCampaign,
  selectedCampaignAnalytics,
  successMessage,
  totalDonationGenerated,
  totalOrders,
  totalRevenueGenerated,
} = useAdminCampaigns()

onMounted(loadPageData)
</script>

<template>
  <section class="mx-auto max-w-7xl px-5 py-8 md:px-6">
    <AdminCampaignsHeader />

    <AdminCampaignsStats
      :active-count="activeCampaigns.length"
      :total-donation-generated="totalDonationGenerated"
      :total-orders="totalOrders"
      :total-revenue-generated="totalRevenueGenerated"
    />

    <div class="grid gap-6 lg:grid-cols-[420px_minmax(0,1fr)]">
      <AdminCampaignForm
        :editing-campaign-id="editingCampaignId"
        :error-message="errorMessage"
        :form="form"
        :is-saving="isSaving"
        :products="products"
        :success-message="successMessage"
        @reset="resetForm"
        @submit="saveCampaign"
      />

      <AdminCampaignsLibrary
        v-model:campaign-search-query="campaignSearchQuery"
        v-model:campaign-status-filter="campaignStatusFilter"
        :campaign-groups="campaignGroups"
        :campaigns="campaigns"
        :filtered-campaigns="filteredCampaigns"
        :get-campaign-product-names="getCampaignProductNames"
        :is-loading="isLoading"
        @analytics="openCampaignAnalytics"
        @clear-filters="clearCampaignFilters"
        @delete="deleteCampaign"
        @edit="editCampaign"
        @refresh="loadPageData"
      />
    </div>

    <AdminCampaignAnalyticsModal
      v-if="selectedCampaignAnalytics"
      :campaign="selectedCampaignAnalytics"
      :get-campaign-product-names="getCampaignProductNames"
      @close="closeCampaignAnalytics"
    />
  </section>
</template>
