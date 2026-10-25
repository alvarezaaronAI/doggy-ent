<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import SiteHeader from '@app/layouts/SiteHeader.vue'
import SiteFooter from '@app/layouts/SiteFooter.vue'
import PromoStrip from '@app/layouts/PromoStrip.vue'
import CampaignPageContent from '../components/CampaignPageContent.vue'
import { useCampaignPage } from '../composables/useCampaignPage.js'
import { useProducts } from '@products/composables/useProducts.js'
import { useProductVariants } from '@products/composables/useProductVariants.js'
import { useStorefrontSearch } from '@storefront/composables/useStorefrontSearch.js'
import { useCart } from '@cart/composables/useCart.js'
import CartDrawer from '@cart/CartDrawer/CartDrawer.vue'
import ProductQuickView from '@products/ProductQuickView/ProductQuickView.vue'
import PageRecovery from '@shared/components/PageRecovery.vue'
import { useRecoveryMetadata } from '@shared/composables/useRecoveryMetadata.js'
const route = useRoute()
const { campaign, loading, error, errorKind, load } = useCampaignPage(
  computed(() => route.params.slug),
)
useRecoveryMetadata(computed(() => !loading.value && (error.value || !campaign.value)
  ? errorKind.value === 'campaign-not-found' ? 'Campaign not found' : 'Campaign unavailable'
  : null))
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
  <div class="storefront-ui site-page flex flex-1 flex-col">
    <PromoStrip />
    <SiteHeader
      :cart-count="itemCount"
      v-model:search-query="searchQuery"
      @open-cart="isCartOpen = true"
    />
    <main class="flex-1">
      <div v-if="loading" class="store-inner" role="status">
        Loading this campaign...
      </div>
      <div v-else-if="error || !campaign" class="store-pattern"><PageRecovery :kind="errorKind || 'unavailable'" :retrying="loading" @retry="load" /></div>
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
