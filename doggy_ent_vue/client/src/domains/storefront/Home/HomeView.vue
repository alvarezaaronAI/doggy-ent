<script setup>
import { computed, onMounted, ref } from 'vue'
import CartDrawer from '@cart/CartDrawer/CartDrawer.vue'
import PromoStrip from '@app/layouts/PromoStrip.vue'
import SiteHeader from '@app/layouts/SiteHeader.vue'
import SiteFooter from '@app/layouts/SiteFooter.vue'
import HeroSection from '@storefront/Home/sections/HeroSection.vue'
import BrandPromiseStrip from '@storefront/Home/sections/BrandPromiseStrip.vue'
import NextDropsSection from '@storefront/Home/sections/NextDropsSection.vue'
import ProductSpotlightSection from '@storefront/Home/sections/ProductSpotlightSection.vue'
import ProcessSection from '@storefront/Home/sections/ProcessSection.vue'
import IngredientsAnalysisSection from '@storefront/Home/sections/IngredientsAnalysisSection.vue'
import ReviewsPreviewSection from '@storefront/Home/sections/ReviewsPreviewSection.vue'
import AboutBrandSection from '@storefront/Home/sections/AboutBrandSection.vue'
import ShopHelpSection from '@storefront/Home/sections/ShopHelpSection.vue'
import '@storefront/styles/storefront.css'
import '@storefront/styles/home.css'
import { useStorefrontCampaigns } from '@campaigns/composables/useStorefrontCampaigns'
import ProductQuickView from '@products/ProductQuickView/ProductQuickView.vue'
import ProductCard from '@products/ProductCard/ProductCard.vue'
import ProductFilters from '@products/ProductFilters/ProductFilters.vue'
import { useProducts } from '@products/composables/useProducts'
import { useProductFilters } from '@products/composables/useProductFilters'
import { useProductVariants } from '@products/composables/useProductVariants'
import { useCart } from '@cart/composables/useCart'
import { formatCurrency } from '@shared/utils/currency'

const selectedProduct = ref(null)
const isQuickViewOpen = ref(false)
const {
  loadCampaigns,
  campaignsForProduct,
  error: campaignError,
} = useStorefrontCampaigns()

const {
  products,
  isLoading,
  errorMessage,
  availableCategories,
  availableProteins,
  comingSoonProducts,
  storefrontProducts,
  loadProducts,
} = useProducts()

onMounted(async () => {
  loadSavedCart()

  await loadProducts()
  await loadCampaigns()
})

const {
  getSellingMode,
  isPurchasable,
  getAvailableQuantity,
  limitQuantity,
  getProductVariants,
  getSelectedCardSize,
  selectCardSize,
  getSelectedCardPrice,
  getSelectedCardVariant,
  getSelectedStockLabel,
} = useProductVariants()

const {
  searchQuery,
  selectedCategory,
  selectedProtein,
  selectedSort,
  activeProducts,
} = useProductFilters(storefrontProducts)

const featuredProduct = computed(
  () =>
    storefrontProducts.value.find(
      (product) => product.status === 'active' && product.featured,
    ) ||
    storefrontProducts.value.find((product) => product.status === 'active') ||
    null,
)

const {
  cart,
  isCartOpen,
  subtotal,
  itemCount,
  loadSavedCart,
  addToCart,
  increase,
  decrease,
  remove,
} = useCart({
  products,
  getSellingMode,
  isPurchasable,
  getAvailableQuantity,
  limitQuantity,
})

function openQuickView(product) {
  selectedProduct.value = {
    ...product,
    selectedSize: getSelectedCardSize(product),
  }
  isQuickViewOpen.value = true
}

function closeQuickView() {
  selectedProduct.value = null
  isQuickViewOpen.value = false
}

function getDisplayTags(product) {
  if (Array.isArray(product.tags) && product.tags.length) {
    return product.tags
  }

  return []
}
</script>

<template>
  <div class="storefront-ui store-home min-h-screen">
    <PromoStrip />

    <SiteHeader
      :cart-count="itemCount"
      :search-query="searchQuery"
      @open-cart="isCartOpen = true"
      @update:search-query="searchQuery = $event"
    />

    <HeroSection :product="featuredProduct" />
    <BrandPromiseStrip />

    <main>
      <ProductSpotlightSection
        :featured-product="featuredProduct"
        :selected-size="getSelectedCardSize(featuredProduct)"
        :campaigns="campaignsForProduct(featuredProduct)"
        @select-size="selectCardSize(featuredProduct, $event)"
        @add-to-cart="addToCart"
      />

      <section id="shop" class="store-section">
        <div class="store-inner">
          <div class="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p class="store-eyebrow">The collection</p>
              <h2 class="mt-3 text-3xl font-bold">All Treats</h2>
            </div>
          </div>

          <ProductFilters
            :available-categories="availableCategories"
            :available-proteins="availableProteins"
            :selected-category="selectedCategory"
            :selected-protein="selectedProtein"
            :selected-sort="selectedSort"
            @update:selected-category="selectedCategory = $event"
            @update:selected-protein="selectedProtein = $event"
            @update:selected-sort="selectedSort = $event"
          />
          <p
            v-if="campaignError"
            class="store-muted mt-4 text-sm"
            role="status"
          >
            Giving details are temporarily unavailable.
            <button
              type="button"
              class="store-button ml-2"
              @click="loadCampaigns"
            >
              Reload giving details
            </button>
          </p>

          <div v-if="isLoading" class="store-muted mt-8" role="status">
            Loading treats...
          </div>

          <div
            v-else-if="errorMessage"
            class="mt-8 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700"
            role="alert"
          >
            {{ errorMessage }}
            <button
              type="button"
              class="store-button ml-3"
              @click="loadProducts"
            >
              Try again
            </button>
          </div>

          <div v-else-if="!activeProducts.length" class="store-muted py-8">
            No matching treats. Try a different search or filter.
          </div>

          <div v-else class="store-product-grid mt-6">
            <ProductCard
              v-for="product in activeProducts"
              :key="product.id"
              :product="product"
              :campaigns="campaignsForProduct(product)"
              :format-price="formatCurrency"
              :get-display-tags="getDisplayTags"
              :get-product-variants="getProductVariants"
              :get-selected-card-size="getSelectedCardSize"
              :select-card-size="selectCardSize"
              :get-selected-card-price="getSelectedCardPrice"
              :get-selected-card-variant="getSelectedCardVariant"
              :get-selected-stock-label="getSelectedStockLabel"
              :is-purchasable="isPurchasable"
              @quick-view="openQuickView"
              @add-to-cart="addToCart($event, getSelectedCardSize($event))"
            />
          </div>
        </div>
      </section>

      <NextDropsSection
        :products="comingSoonProducts"
        :get-display-tags="getDisplayTags"
        :loading="isLoading"
        :error="errorMessage"
        @preview="openQuickView"
        @retry="loadProducts"
      />

      <ReviewsPreviewSection />
      <ProcessSection />
      <IngredientsAnalysisSection :product="featuredProduct" />
      <AboutBrandSection />
      <ShopHelpSection />
    </main>

    <SiteFooter />

    <ProductQuickView
      :product="selectedProduct"
      :is-open="isQuickViewOpen"
      @close="closeQuickView"
      @add-to-cart="addToCart($event, $event.size)"
    />

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
