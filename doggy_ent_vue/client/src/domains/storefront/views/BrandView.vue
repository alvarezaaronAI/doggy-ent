<script setup>
import { onMounted } from 'vue'
import PromoStrip from '@app/layouts/PromoStrip.vue'
import SiteHeader from '@app/layouts/SiteHeader.vue'
import SiteFooter from '@app/layouts/SiteFooter.vue'
import CartDrawer from '@cart/CartDrawer/CartDrawer.vue'
import BrandPageContent from '@storefront/components/BrandPageContent.vue'
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
  <div class="storefront-ui store-brand site-page flex flex-1 flex-col">
    <PromoStrip />
    <SiteHeader
      :cart-count="itemCount"
      v-model:search-query="searchQuery"
      @open-cart="isCartOpen = true"
    />
    <main class="flex-1">
      <BrandPageContent />
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
