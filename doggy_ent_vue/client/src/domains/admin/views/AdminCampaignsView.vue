<script setup>
import { onMounted } from 'vue'
import AdminCampaignForm from '../components/AdminCampaignForm.vue'
import AdminCampaignsLibrary from '../components/AdminCampaignsLibrary.vue'
import AdminCampaignImpact from '../components/AdminCampaignImpact.vue'
import AdminPageHeader from '../components/AdminPageHeader.vue'
import AdminMetrics from '../components/AdminMetrics.vue'
import AdminIcon from '../components/AdminIcon.vue'
import { formatAdminCampaignPrice } from '../utils/adminCampaigns.utils'
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
  showForm,
  openCreateForm,
} = useAdminCampaigns()
onMounted(loadPageData)
</script>
<template>
  <section class="admin-page">
    <AdminPageHeader
      :title="
        showForm
          ? editingCampaignId
            ? 'Edit campaign'
            : 'New campaign'
          : 'Campaigns'
      "
      eyebrow="Giving &amp; growth"
      ><button
        v-if="!showForm && !selectedCampaignAnalytics"
        class="admin-button admin-primary"
        @click="openCreateForm"
      >
        <AdminIcon name="plus" /> Create campaign
      </button></AdminPageHeader
    >
    <div
      v-if="errorMessage && !showForm"
      class="admin-alert admin-error"
      role="alert"
    >
      {{ errorMessage }}
    </div>
    <div v-if="successMessage" class="admin-alert admin-success" role="status">
      {{ successMessage }}
    </div>
    <AdminCampaignForm
      v-if="showForm"
      :editing-campaign-id="editingCampaignId"
      :error-message="errorMessage"
      :form="form"
      :is-saving="isSaving"
      :products="products"
      @reset="resetForm"
      @submit="saveCampaign"
    />
    <AdminCampaignImpact
      v-else-if="selectedCampaignAnalytics"
      :campaign="selectedCampaignAnalytics"
      :get-campaign-product-names="getCampaignProductNames"
      @close="closeCampaignAnalytics"
    />
    <template v-else>
      <AdminMetrics
        :loading="isLoading"
        :items="[
          { label: 'Active campaigns', value: activeCampaigns.length },
          {
            label: 'Donations generated',
            value: formatAdminCampaignPrice(totalDonationGenerated),
          },
          { label: 'Attributed orders', value: totalOrders },
          {
            label: 'Attributed order value',
            value: formatAdminCampaignPrice(totalRevenueGenerated),
          },
        ]"
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
    </template>
  </section>
</template>
