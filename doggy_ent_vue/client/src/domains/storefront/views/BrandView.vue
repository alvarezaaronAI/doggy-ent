<script setup>
import { onMounted } from 'vue'
import { ArrowRight } from '@lucide/vue'
import PromoStrip from '@app/layouts/PromoStrip.vue'
import SiteHeader from '@app/layouts/SiteHeader.vue'
import SiteFooter from '@app/layouts/SiteFooter.vue'
import CartDrawer from '@cart/CartDrawer/CartDrawer.vue'
import StorefrontHero from '@storefront/components/StorefrontHero.vue'
import BrandStoryContent from '@storefront/components/BrandStoryContent.vue'
import { BRAND_STORY } from '@storefront/constants/brandContent.js'
import { useStorefrontSearch } from '@storefront/composables/useStorefrontSearch.js'
import { useProducts } from '@products/composables/useProducts.js'
import { useProductVariants } from '@products/composables/useProductVariants.js'
import { useCart } from '@cart/composables/useCart.js'
import '@storefront/styles/storefront.css'
import '@storefront/styles/brand.css'

const { searchQuery } = useStorefrontSearch()
const { products, loadProducts } = useProducts()
const variants = useProductVariants()
const {
  cart,
  itemCount,
  subtotal,
  isCartOpen,
  loadSavedCart,
  increase,
  decrease,
  remove,
} = useCart({ products, ...variants })
onMounted(() => {
  loadSavedCart()
  loadProducts()
})
</script>

<template>
  <div class="storefront-ui store-brand min-h-screen">
    <PromoStrip />
    <SiteHeader
      :cart-count="itemCount"
      v-model:search-query="searchQuery"
      @open-cart="isCartOpen = true"
    />
    <main>
      <StorefrontHero
        id="brand-hero"
        :title="BRAND_STORY.title"
        eyebrow="Our story"
        :description="BRAND_STORY.introduction"
        :image="BRAND_STORY.heroImage"
        image-alt="Illustrative dog photography for the Chase and Evie story"
      >
        <a href="#brand-pair" class="store-button store-button-primary"
          >Meet the pair <ArrowRight :size="18"
        /></a>
        <RouterLink :to="{ path: '/', hash: '#shop' }" class="store-button"
          >Shop all treats</RouterLink
        >
      </StorefrontHero>
      <BrandStoryContent />
    </main>
    <SiteFooter />
    <CartDrawer
      :is-open="isCartOpen"
      :cart-items="cart"
      :subtotal="subtotal"
      :item-count="itemCount"
      @close="isCartOpen = false"
      @increase="increase"
      @decrease="decrease"
      @remove="remove"
      @continue-shopping="isCartOpen = false"
    />
  </div>
</template>
