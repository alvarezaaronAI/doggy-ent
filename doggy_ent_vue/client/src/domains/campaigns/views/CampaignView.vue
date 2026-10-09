<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import SiteHeader from '@app/layouts/SiteHeader.vue'
import SiteFooter from '@app/layouts/SiteFooter.vue'
import CampaignPageContent from '../components/CampaignPageContent.vue'
import { useCampaignPage } from '../composables/useCampaignPage.js'
import { useProducts } from '@products/composables/useProducts.js'
import { useProductVariants } from '@products/composables/useProductVariants.js'
import { useStorefrontSearch } from '@storefront/composables/useStorefrontSearch.js'
import { useCart } from '@cart/composables/useCart.js'
import CartDrawer from '@cart/CartDrawer/CartDrawer.vue'
import ProductQuickView from '@products/ProductQuickView/ProductQuickView.vue'
const route = useRoute()
const { campaign, loading, error, load } = useCampaignPage(
  computed(() => route.params.slug),
)
const { products, loadProducts, errorMessage } = useProducts()
const variants = useProductVariants()
const { searchQuery } = useStorefrontSearch()
const {
  cart,
  itemCount,
  subtotal,
  isCartOpen,
  loadSavedCart,
  addToCart,
  increase,
  decrease,
  remove,
} = useCart({ products, ...variants })
const selectedProduct = ref(null)
onMounted(() => {
  loadSavedCart()
  loadProducts()
})
</script>
<template>
  <div class="storefront-ui min-h-screen">
    <SiteHeader
      :cart-count="itemCount"
      v-model:search-query="searchQuery"
      @open-cart="isCartOpen = true"
    />
    <main>
      <div v-if="loading" class="store-inner" role="status">
        Loading this campaign...
      </div>
      <div v-else-if="error || !campaign" class="store-inner">
        <h1 class="text-3xl font-bold">This campaign isn't available.</h1>
        <p class="store-muted mt-4" role="alert">{{ error }}</p>
        <button type="button" class="store-button mt-5" @click="load">
          Try again</button
        ><RouterLink to="/" class="store-button ml-3"
          >Back to the shop</RouterLink
        >
      </div>
      <template v-else>
        <div v-if="errorMessage" class="store-inner" role="alert">
          {{ errorMessage }}
          <button type="button" class="store-button" @click="loadProducts">
            Reload treats
          </button>
        </div>
        <CampaignPageContent
          :campaign="campaign"
          :products="products"
          @add-to-cart="addToCart"
          @quick-view="selectedProduct = $event"
        />
      </template>
    </main>
    <SiteFooter />
    <ProductQuickView
      :product="selectedProduct"
      :is-open="Boolean(selectedProduct)"
      @close="selectedProduct = null"
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
