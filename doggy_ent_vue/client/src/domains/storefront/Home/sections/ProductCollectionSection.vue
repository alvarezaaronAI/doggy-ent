<script setup>
import { computed } from 'vue'
import ProductCard from '@products/ProductCard/ProductCard.vue'
import ProductFilters from '@products/ProductFilters/ProductFilters.vue'
import { formatCurrency } from '@shared/utils/currency.js'
import { sectionSettings } from '@storefront-content/sectionCatalog.js'
const props = defineProps({ context: { type: Object, required: true }, settings: { type: Object, default: () => sectionSettings('collection') }, id: { type: String, default: 'shop' } })
const displayedProducts = computed(() => {
  const active = props.context.activeProducts.filter(product => product.status === 'active')
  if (props.settings.productIds.length) return active.filter(product => props.settings.productIds.includes(product.id))
  return active
})
defineEmits(['quick-view', 'add-to-cart', 'category', 'protein', 'sort'])
</script>
<template>
  <section :id="id" class="store-section">
    <div class="store-inner">
      <p class="store-eyebrow">{{ settings.eyebrow }}</p>
      <h2 class="mt-3 text-3xl font-bold">{{ settings.title }}</h2>
      <p v-if="settings.text" class="store-muted mt-3 whitespace-pre-line">{{ settings.text }}</p>
      <ProductFilters v-if="id === 'shop'" :available-categories="context.availableCategories" :available-proteins="context.availableProteins" :selected-category="context.selectedCategory" :selected-protein="context.selectedProtein" :selected-sort="context.selectedSort" @update:selected-category="$emit('category', $event)" @update:selected-protein="$emit('protein', $event)" @update:selected-sort="$emit('sort', $event)" />
      <p v-if="context.campaignError" class="store-muted mt-4 text-sm" role="status">Giving details are temporarily unavailable. <button type="button" class="store-button ml-2" @click="context.loadCampaigns">Reload giving details</button></p>
      <p v-if="context.isLoading" class="store-muted mt-8" role="status">Loading treats...</p>
      <div v-else-if="context.errorMessage" class="mt-8 rounded border border-red-200 bg-red-50 p-4 text-red-700" role="alert">{{ context.errorMessage }}<button type="button" class="store-button ml-3" @click="context.loadProducts">Try again</button></div>
      <template v-else>
        <div v-if="displayedProducts.length" class="store-product-grid mt-6">
          <ProductCard v-for="product in displayedProducts" :key="product.id" :product="product" :campaigns="context.campaignsForProduct(product)" :format-price="formatCurrency" :get-display-tags="context.getDisplayTags" :get-product-variants="context.getProductVariants" :get-selected-card-size="context.getSelectedCardSize" :select-card-size="context.selectCardSize" :get-selected-card-price="context.getSelectedCardPrice" :get-selected-card-variant="context.getSelectedCardVariant" :get-selected-stock-label="context.getSelectedStockLabel" :is-purchasable="context.isPurchasable" @quick-view="$emit('quick-view', $event)" @add-to-cart="$emit('add-to-cart', $event, context.getSelectedCardSize($event))" />
        </div>
        <p v-else class="store-muted py-8">No matching treats. Try a different search or filter.</p>
      </template>
    </div>
  </section>
</template>
