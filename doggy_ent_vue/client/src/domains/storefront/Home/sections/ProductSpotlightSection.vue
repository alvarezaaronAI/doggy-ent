<script setup>
import { computed } from 'vue'
import { Package, ShoppingBag } from '@lucide/vue'
import ProductCampaignBadge from '@products/ProductCard/ProductCampaignBadge.vue'
import ProductCardVariantSelector from '@products/ProductCard/ProductCardVariantSelector.vue'
import { useProductVariants } from '@products/composables/useProductVariants'
import { formatCurrency } from '@shared/utils/currency'
const props = defineProps({
  featuredProduct: Object,
  selectedSize: String,
  campaigns: { type: Array, default: () => [] },
})
const emit = defineEmits(['add-to-cart', 'select-size'])
const {
  getProductVariants,
  getVariantBySize,
  isPurchasable,
  getSelectedStockLabel,
} = useProductVariants()
const variant = computed(() =>
  getVariantBySize(props.featuredProduct, props.selectedSize),
)
</script>
<template>
  <section id="spotlight" class="store-section">
    <div class="store-inner">
      <p class="store-eyebrow">Featured treat</p>
      <div
        v-if="featuredProduct"
        class="mt-5 grid gap-8 md:grid-cols-2 md:items-center"
      >
        <div class="spotlight-image">
          <img
            v-if="featuredProduct.image"
            :src="featuredProduct.image"
            :alt="featuredProduct.name"
            loading="lazy"
          />
          <Package v-else :size="48" aria-hidden="true" />
        </div>
        <div class="min-w-0">
          <h2 class="text-3xl font-bold">{{ featuredProduct.name }}</h2>
          <p class="store-muted mt-4 leading-relaxed">
            {{ featuredProduct.shortDescription }}
          </p>
          <div class="mt-4 flex flex-wrap gap-2">
            <span
              v-for="tag in featuredProduct.tags"
              :key="tag"
              class="store-product-tag"
              >{{ tag }}</span
            >
          </div>
          <ProductCampaignBadge :campaigns="campaigns" />
          <div class="mt-6 border-t border-[#d6ddd4] pt-5">
            <ProductCardVariantSelector
              :product="featuredProduct"
              :variants="getProductVariants(featuredProduct)"
              :selected-size="selectedSize"
              @select-size="emit('select-size', $event)"
            />
            <div class="my-5 flex flex-wrap items-center justify-between gap-3">
              <span class="text-2xl font-bold">{{
                formatCurrency(variant?.price ?? featuredProduct.price ?? 0)
              }}</span>
              <span class="text-sm text-[#17664d]">{{
                getSelectedStockLabel(featuredProduct, variant)
              }}</span>
            </div>
            <button
              type="button"
              class="store-button store-button-primary w-full sm:w-auto"
              :disabled="!isPurchasable(featuredProduct, variant)"
              @click="emit('add-to-cart', featuredProduct, selectedSize)"
            >
              <ShoppingBag :size="18" aria-hidden="true" />
              {{
                isPurchasable(featuredProduct, variant)
                  ? 'Add to Cart'
                  : 'Unavailable'
              }}
            </button>
          </div>
        </div>
      </div>
      <p v-else class="store-muted mt-4">
        Our featured treat will appear here when the collection is available.
      </p>
    </div>
  </section>
</template>
<style scoped>
.spotlight-image {
  aspect-ratio: 4/3;
  background: #f3f5f2;
  display: grid;
  place-items: center;
  overflow: hidden;
  border-radius: 8px;
  border: 1px solid #dfd2bd;
  box-shadow: 0 12px 30px rgba(67, 46, 27, 0.11);
}
.spotlight-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
