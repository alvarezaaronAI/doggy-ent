<script setup>
import { onMounted } from 'vue'
import PromoAnalyticsModal from '@promos/components/PromoAnalyticsModal.vue'
import PromoCodeTester from '@promos/components/PromoCodeTester.vue'
import PromoForm from '@promos/components/PromoForm.vue'
import AdminPromoFormExtraFields from '../components/AdminPromoFormExtraFields.vue'
import AdminPromosHeader from '../components/AdminPromosHeader.vue'
import AdminPromosLibrary from '../components/AdminPromosLibrary.vue'
import AdminPromosStats from '../components/AdminPromosStats.vue'
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
} = useAdminPromos()

onMounted(loadPromos)
</script>

<template>
  <section class="mx-auto max-w-7xl px-5 py-8 md:px-6">
    <AdminPromosHeader />

    <AdminPromosStats
      :active-count="activePromos.length"
      :total-discount-given="totalDiscountGiven"
      :total-uses="totalUses"
    />

    <PromoCodeTester
      :form="promoTestForm"
      :result="promoTestResult"
      :is-testing="isTestingPromo"
      @submit="testPromoCode"
    />

    <div class="grid gap-6 lg:grid-cols-[420px_minmax(0,1fr)]">
      <PromoForm
        :form="form"
        :is-saving="isSaving"
        :is-editing="Boolean(editingPromoId)"
        :is-unique-promo="isUniquePromo"
        :is-referral-promo="isReferralPromo"
        :error-message="errorMessage"
        :success-message="successMessage"
        @submit="savePromo"
        @reset="resetForm"
        @generate-code="generateUniquePromoCode"
      >
        <AdminPromoFormExtraFields
          :form="form"
          :is-referral-promo="isReferralPromo"
          :is-unique-promo="isUniquePromo"
        />
      </PromoForm>

      <AdminPromosLibrary
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
        @test="selectPromoForTest"
      />
    </div>

    <PromoAnalyticsModal
      :is-open="isAnalyticsModalOpen"
      :analytics="selectedPromoAnalytics"
      :is-loading="isLoadingAnalytics"
      @close="closePromoAnalytics"
    />
  </section>
</template>
