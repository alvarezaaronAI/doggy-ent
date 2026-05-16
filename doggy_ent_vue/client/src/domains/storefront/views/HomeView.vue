<script setup>
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import CartDrawer from '../../cart/components/CartDrawer.vue'
import PromoStrip from '../../../app/layouts/PromoStrip.vue'
import SiteHeader from '../../../app/layouts/SiteHeader.vue'
import SiteFooter from '../../../app/layouts/SiteFooter.vue'
import HeroSection from '../components/HeroSection.vue'
import ProductSpotlightSection from '../components/ProductSpotlightSection.vue'
import ShopCollectionsSection from '../components/ShopCollectionsSection.vue'
import ProcessSection from '../components/ProcessSection.vue'
import IngredientsAnalysisSection from '../components/IngredientsAnalysisSection.vue'
import ReviewsPreviewSection from '../components/ReviewsPreviewSection.vue'
import AboutBrandSection from '../components/AboutBrandSection.vue'
import QuickViewModal from '../components/QuickViewModal.vue'
import ProductCard from '../components/ProductCard.vue'
import FilterBar from '../components/FilterBar.vue'
import ComingSoonCard from '../components/ComingSoonCard.vue'
import { useProducts } from '../composables/useProducts'
import { useProductFilters } from '../composables/useProductFilters'
import { useProductVariants } from '../composables/useProductVariants'
import { useCart } from '../../cart/composables/useCart'

const selectedProduct = ref(null)
const isQuickViewOpen = ref(false)

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
} = useProductFilters(storefrontProducts, getSelectedCardPrice)

const featuredProduct = computed(() =>
  activeProducts.value.find((product) => product.featured) ||
  activeProducts.value[0] ||
  null
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
  selectedProduct.value = product
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

  return ['Small-batch', 'No fillers']
}


function formatPrice(value) {
  return `$${Number(value).toFixed(2)}`
}
</script>

<template>
  <div class="min-h-screen bg-[var(--brand-5)] text-stone-900">
    <PromoStrip />

    <SiteHeader
      :cart-count="itemCount"
      :search-query="searchQuery"
      @open-cart="isCartOpen = true"
      @update:search-query="searchQuery = $event"
    />

    <HeroSection />

    <main class="space-y-8 pb-12">
      <ProductSpotlightSection
        :featured-product="featuredProduct"
        @add-to-cart="addToCart"
      />

      <ShopCollectionsSection
        :products="products"
      />


      <section id="shop" class="section-panel mx-auto max-w-7xl px-5 py-9 md:px-6">
        <div class="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p class="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-400">
              Product feed
            </p>
            <h2 class="u-underline-blue mt-2 text-3xl font-bold">All Treats</h2>
          </div>

          <RouterLink
            to="/admin/products"
            class="rounded-lg border border-emerald-400 px-4 py-2 text-sm font-semibold text-emerald-400 hover:bg-stone-900"
          >
            Admin Products
          </RouterLink>
        </div>

        <FilterBar
          :available-categories="availableCategories"
          :available-proteins="availableProteins"
          :selected-category="selectedCategory"
          :selected-protein="selectedProtein"
          :selected-sort="selectedSort"
          @update:selected-category="selectedCategory = $event"
          @update:selected-protein="selectedProtein = $event"
          @update:selected-sort="selectedSort = $event"
        />

        <div v-if="isLoading" class="mt-8 text-stone-300">
          Loading treats...
        </div>

        <div v-else-if="errorMessage" class="mt-8 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
          {{ errorMessage }}
        </div>

        <div v-else-if="!activeProducts.length" class="mt-8 rounded-2xl border border-stone-800 bg-white p-6 text-stone-300">
          No matching products found. Try a different search term or add more products from the admin dashboard.
        </div>

        <div v-else class="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <ProductCard
            v-for="product in activeProducts"
            :key="product.id"
            :product="product"
            :format-price="formatPrice"
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
      </section>

      <section
        v-if="comingSoonProducts.length"
        id="coming-soon"
        class="section-panel mx-auto max-w-7xl px-5 py-9 md:px-6"
      >
        <div class="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p class="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-400">
              Coming soon
            </p>
            <h2 class="u-underline-blue mt-2 text-3xl font-bold">Next Drops</h2>
            <p class="mt-3 max-w-2xl text-stone-300">
              These treats are in development or planned for future seasonal drops. Join the list to get notified when they launch.
            </p>
          </div>
        </div>

        <div class="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <ComingSoonCard
            v-for="product in comingSoonProducts"
            :key="product.id"
            :product="product"
            :get-display-tags="getDisplayTags"
            @preview="openQuickView"
          />
        </div>
      </section>

      <section class="mx-auto max-w-7xl px-5 py-2 md:px-6">
        <div class="space-y-8">
          <ReviewsPreviewSection />
          <ProcessSection />
          <IngredientsAnalysisSection />
          <AboutBrandSection />
        </div>
      </section>
    </main>

    <SiteFooter />

    <QuickViewModal
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
