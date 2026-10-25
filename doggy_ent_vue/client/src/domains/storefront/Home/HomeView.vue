<script setup>
import { computed, onMounted, ref } from 'vue'
import CartDrawer from '@cart/CartDrawer/CartDrawer.vue'
import PromoStrip from '@app/layouts/PromoStrip.vue'
import SiteHeader from '@app/layouts/SiteHeader.vue'
import SiteFooter from '@app/layouts/SiteFooter.vue'
import '@storefront/styles/storefront.css'
import '@storefront/styles/home.css'
import { useStorefrontCampaigns } from '@campaigns/composables/useStorefrontCampaigns'
import ProductQuickView from '@products/ProductQuickView/ProductQuickView.vue'
import { useProducts } from '@products/composables/useProducts'
import { useProductFilters } from '@products/composables/useProductFilters'
import { useProductVariants } from '@products/composables/useProductVariants'
import { useCart } from '@cart/composables/useCart'
import HomePageContent from './HomePageContent.vue'
import { useStorefrontContent } from '../composables/useStorefrontContent.js'
const { content, loadContent } = useStorefrontContent()

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
  loadContent()

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

const pageContext = computed(() => ({
  products: storefrontProducts.value, activeProducts: activeProducts.value,
  comingSoonProducts: comingSoonProducts.value, isLoading: isLoading.value,
  errorMessage: errorMessage.value, campaignError: campaignError.value,
  availableCategories: availableCategories.value, availableProteins: availableProteins.value,
  selectedCategory: selectedCategory.value, selectedProtein: selectedProtein.value, selectedSort: selectedSort.value,
  getProductVariants, getSelectedCardSize, selectCardSize, getSelectedCardPrice,
  getSelectedCardVariant, getSelectedStockLabel, isPurchasable, getDisplayTags,
  campaignsForProduct, loadProducts, loadCampaigns,
}))

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
  <div class="storefront-ui store-home site-page flex flex-1 flex-col">
    <PromoStrip />

    <SiteHeader
      :cart-count="itemCount"
      :search-query="searchQuery"
      @open-cart="isCartOpen = true"
      @update:search-query="searchQuery = $event"
    />

    <HomePageContent
      class="flex-1"
      :content="content" :context="pageContext"
      @quick-view="openQuickView"
      @add-to-cart="addToCart"
      @select-size="selectCardSize"
      @category="selectedCategory = $event"
      @protein="selectedProtein = $event"
      @sort="selectedSort = $event"
    />

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
