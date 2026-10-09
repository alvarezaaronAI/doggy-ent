<script setup>
import { onMounted, ref } from 'vue'
import PromoCodeTester from '@promos/components/PromoCodeTester.vue'
import PromoForm from '@promos/components/PromoForm.vue'
import AdminPromoFormExtraFields from '../components/AdminPromoFormExtraFields.vue'
import AdminPromosLibrary from '../components/AdminPromosLibrary.vue'
import AdminPromoAnalytics from '../components/AdminPromoAnalytics.vue'
import AdminPageHeader from '../components/AdminPageHeader.vue'
import AdminMetrics from '../components/AdminMetrics.vue'
import AdminIcon from '../components/AdminIcon.vue'
import { formatCurrency } from '@shared/utils/currency'
import { useAdminPromos } from '../composables/useAdminPromos'
const {
  activePromos,
  clearPromoFilters,
  closePromoAnalytics,
  deletePromo,
  editPromo,
  editingPromoId,
  errorMessage,
  filteredPromos,
  form,
  generateUniquePromoCode,
  isAnalyticsModalOpen,
  isLoading,
  isLoadingAnalytics,
  isReferralPromo,
  isSaving,
  isTestingPromo,
  isUniquePromo,
  loadPromos,
  openPromoAnalytics,
  promoGroups,
  promoSearchQuery,
  promoStatusFilter,
  promoTestForm,
  promoTestResult,
  promoTypeFilter,
  promos,
  resetForm,
  savePromo,
  selectPromoForTest,
  selectedPromoAnalytics,
  successMessage,
  testPromoCode,
  totalDiscountGiven,
  totalUses,
  showForm,
  openCreateForm,
} = useAdminPromos()
const tab = ref('codes')
function testSelected(promo) {
  selectPromoForTest(promo)
  tab.value = 'tester'
}
onMounted(loadPromos)
</script>
<template>
  <section class="admin-page">
    <AdminPageHeader
      :title="
        showForm ? (editingPromoId ? 'Edit promo' : 'New promo') : 'Promos'
      "
      eyebrow="Merchandising"
    >
      <button
        v-if="!showForm && !isAnalyticsModalOpen"
        class="admin-button admin-primary"
        @click="openCreateForm"
      >
        <AdminIcon name="plus" /> Create promo
      </button>
    </AdminPageHeader>
    <div
      v-if="errorMessage && !showForm"
      role="alert"
      class="admin-alert admin-error"
    >
      {{ errorMessage }}
    </div>
    <div v-if="successMessage" role="status" class="admin-alert admin-success">
      {{ successMessage }}
    </div>
    <PromoForm
      v-if="showForm"
      :form="form"
      :is-saving="isSaving"
      :is-editing="Boolean(editingPromoId)"
      :is-unique-promo="isUniquePromo"
      :is-referral-promo="isReferralPromo"
      :error-message="errorMessage"
      @submit="savePromo"
      @reset="resetForm"
      @generate-code="generateUniquePromoCode"
      ><AdminPromoFormExtraFields
        :form="form"
        :is-unique-promo="isUniquePromo"
        :is-referral-promo="isReferralPromo"
    /></PromoForm>
    <AdminPromoAnalytics
      v-else-if="isAnalyticsModalOpen"
      :analytics="selectedPromoAnalytics"
      :is-loading="isLoadingAnalytics"
      @close="closePromoAnalytics"
    />
    <template v-else>
      <AdminMetrics
        :loading="isLoading"
        :items="[
          { label: 'Active codes', value: activePromos.length },
          { label: 'Redemptions', value: totalUses },
          {
            label: 'Discount given',
            value: formatCurrency(totalDiscountGiven),
          },
        ]"
      />
      <div class="admin-segments mb-6">
        <button :aria-pressed="tab === 'codes'" @click="tab = 'codes'">
          Promo codes</button
        ><button :aria-pressed="tab === 'tester'" @click="tab = 'tester'">
          Code tester
        </button>
      </div>
      <AdminPromosLibrary
        v-if="tab === 'codes'"
        v-model:promo-search-query="promoSearchQuery"
        v-model:promo-status-filter="promoStatusFilter"
        v-model:promo-type-filter="promoTypeFilter"
        :filtered-promos="filteredPromos"
        :is-loading="isLoading"
        :promo-groups="promoGroups"
        :promos="promos"
        @analytics="openPromoAnalytics"
        @clear-filters="clearPromoFilters"
        @delete="deletePromo"
        @edit="editPromo"
        @refresh="loadPromos"
        @test="testSelected"
      />
      <PromoCodeTester
        v-else
        :form="promoTestForm"
        :result="promoTestResult"
        :is-testing="isTestingPromo"
        @submit="testPromoCode"
      />
    </template>
  </section>
</template>
