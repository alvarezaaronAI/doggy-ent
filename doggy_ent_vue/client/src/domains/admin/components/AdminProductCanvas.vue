<script setup>
import { computed, onMounted } from 'vue'
import ProductCard from '@products/ProductCard/ProductCard.vue'
import ComingSoonCard from '@products/ProductCard/ComingSoonCard.vue'
import { useProductVariants } from '@products/composables/useProductVariants.js'
import { buildAdminProductPayload } from '../mappers/adminProductForm.mapper.js'
import { formatCurrency } from '@shared/utils/currency.js'
import { useStorefrontCampaigns } from '@campaigns/composables/useStorefrontCampaigns.js'
import '@storefront/styles/storefront.css'
defineEmits(['select-section'])
const props = defineProps({ form: { type: Object, required: true }, productId: String })
const { campaignsForProduct, loadCampaigns } = useStorefrontCampaigns()
onMounted(loadCampaigns)
const product = computed(() => {
  const payload = buildAdminProductPayload(props.form)
  return { ...payload, id: props.productId || 'editor-product', price: Number(props.form.sixOzPrice), variants: payload.variants.map(variant => ({ ...variant, active: true })) }
})
const variants = useProductVariants()
const getTags = (product) => product.tags || []
</script>
<template>
  <div class="product-canvas storefront-ui">
    <p class="mb-4 text-xs text-[#627468]">{{ form.status === 'coming-soon' ? 'Upcoming product card' : form.status === 'draft' ? 'Draft · Not visible to shoppers' : 'Storefront product card' }}</p>
    <template v-if="form.status === 'coming-soon'">
      <button type="button" class="store-button mb-4" @click="$emit('select-section', 'details')">Edit card details</button>
      <div inert><ComingSoonCard :product="product" :get-display-tags="getTags" /></div>
    </template>
    <ProductCard v-else :product="product" :campaigns="campaignsForProduct(product)" editable :format-price="formatCurrency" :get-display-tags="getTags" :get-product-variants="variants.getProductVariants" :get-selected-card-size="variants.getSelectedCardSize" :select-card-size="variants.selectCardSize" :get-selected-card-price="variants.getSelectedCardPrice" :get-selected-card-variant="variants.getSelectedCardVariant" :get-selected-stock-label="variants.getSelectedStockLabel" :is-purchasable="variants.isPurchasable" @select-section="$emit('select-section', $event)" />
  </div>
</template>
<style scoped>
.product-canvas { width: 100%; max-width: 520px; margin: auto; color: #6a3c2b; }
</style>
