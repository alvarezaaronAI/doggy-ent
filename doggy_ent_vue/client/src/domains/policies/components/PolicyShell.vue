<script setup>
import { onMounted } from 'vue'
import SiteHeader from '@app/layouts/SiteHeader.vue'
import SiteFooter from '@app/layouts/SiteFooter.vue'
import PromoStrip from '@app/layouts/PromoStrip.vue'
import CartDrawer from '@cart/CartDrawer/CartDrawer.vue'
import { useCart } from '@cart/composables/useCart.js'
import { useProductVariants } from '@products/composables/useProductVariants.js'
import { useStorefrontSearch } from '@storefront/composables/useStorefrontSearch.js'
import '@storefront/styles/storefront.css'
const { searchQuery } = useStorefrontSearch()
const { cart, itemCount, subtotal, isCartOpen, loadSavedCart, increase, decrease, remove } = useCart(useProductVariants())
onMounted(loadSavedCart)
</script>
<template>
  <div class="storefront-ui site-page flex flex-1 flex-col">
    <PromoStrip />
    <SiteHeader :cart-count="itemCount" v-model:search-query="searchQuery" @open-cart="isCartOpen = true" />
    <main id="policy-content" class="flex-1"><slot /></main>
    <SiteFooter />
    <CartDrawer :is-open="isCartOpen" :cart-items="cart" :subtotal="subtotal" :item-count="itemCount" @close="isCartOpen = false" @increase="increase" @decrease="decrease" @remove="remove" @continue-shopping="isCartOpen = false" />
  </div>
</template>
