<script setup>
import { watch } from 'vue'
import CommerceDialog from '@shared/components/CommerceDialog.vue'
import CampaignPageContent from './CampaignPageContent.vue'
import { useCampaignQuickView } from '../composables/useCampaignQuickView.js'
import { useCampaignPage } from '../composables/useCampaignPage.js'
import { useProducts } from '@products/composables/useProducts.js'
const { slug, closeCampaign } = useCampaignQuickView()
const { campaign, loading, error, load } = useCampaignPage(slug)
const { products, loadProducts } = useProducts()
watch(slug, value => { if (value) loadProducts() })
</script>
<template>
  <CommerceDialog v-if="slug" title="About this campaign" wide @close="closeCampaign">
    <p v-if="loading" class="p-6" role="status">Loading campaign...</p>
    <div v-else-if="error || !campaign" class="p-6" role="alert">{{ error || 'Campaign unavailable.' }}<button type="button" class="store-button ml-3" @click="load">Retry</button></div>
    <CampaignPageContent v-else :campaign="campaign" :products="products" quick-view @browse="closeCampaign" />
  </CommerceDialog>
</template>
