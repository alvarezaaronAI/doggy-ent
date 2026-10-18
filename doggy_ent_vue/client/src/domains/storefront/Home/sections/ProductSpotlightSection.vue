<script setup>
import { mediaImageSource } from '@shared/utils/mediaImage.js'
import { computed } from 'vue'
import { Package, ShoppingBag, ArrowRight } from '@lucide/vue'
import ProductCardVariantSelector from '@products/ProductCard/ProductCardVariantSelector.vue'
import { useProductVariants } from '@products/composables/useProductVariants'
import { formatCurrency } from '@shared/utils/currency'
import { sectionSettings } from '@storefront-content/sectionCatalog.js'
const props = defineProps({
  featuredProduct: Object,
  selectedSize: String,
  campaigns: { type: Array, default: () => [] },
  id: { type: String, default: 'spotlight' },
  settings: { type: Object, default: () => sectionSettings('spotlight') },
})
const emit = defineEmits(['add-to-cart', 'select-size', 'quick-view'])
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
  <section :id="id" class="store-section">
    <div class="store-inner">
      <div
        v-if="featuredProduct"
        class="home-feature"
      >
        <div class="spotlight-image">
          <img
            v-if="featuredProduct.image"
            :src="mediaImageSource(featuredProduct.image)"
            :alt="featuredProduct.name"
            loading="lazy"
          />
          <Package v-else :size="48" aria-hidden="true" />
        </div>
        <div class="home-feature-copy min-w-0">
          <p class="store-eyebrow">{{ settings.eyebrow }}</p>
          <h2 class="text-3xl font-bold">{{ settings.title || featuredProduct.name }}</h2>
          <p class="store-muted mt-4 leading-relaxed">
            {{ settings.text || featuredProduct.shortDescription }}
          </p>
          <div class="mt-5">
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
            <div class="flex flex-wrap gap-2"><button
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
            </button><button type="button" class="store-button" @click="emit('quick-view', featuredProduct)">A closer look <ArrowRight :size="16" /></button></div>
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
  height: 310px;
  width: 100%;
  min-width: 0;
  background: #f3f5f2;
  display: grid;
  place-items: center;
  overflow: hidden;
}
.home-feature { display:grid; grid-template-columns:300px minmax(0,1fr); align-items:center; border:1px solid #d4ded7; border-radius:8px; background:white; box-shadow:0 8px 22px #243e3210; overflow:hidden; }
.home-feature-copy { padding:24px; }
@media(max-width:620px) { .home-feature { grid-template-columns:minmax(0,1fr); } .spotlight-image { aspect-ratio:1.6; } }
@container website-preview (max-width:620px) { .home-feature { grid-template-columns:minmax(0,1fr); } }
.spotlight-image { align-self:stretch; height:auto; min-height:300px; }
.spotlight-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
