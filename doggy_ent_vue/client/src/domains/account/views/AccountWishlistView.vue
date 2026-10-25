<script setup>
import { computed, inject, nextTick, onMounted, ref, watch } from 'vue'
import { Heart, RefreshCw, ShoppingBag, Trash2 } from '@lucide/vue'
import ProductCard from '@products/ProductCard/ProductCard.vue'
import ProductQuickView from '@products/ProductQuickView/ProductQuickView.vue'
import { useProducts } from '@products/composables/useProducts.js'
import { useProductVariants } from '@products/composables/useProductVariants.js'
import { useStorefrontCampaigns } from '@campaigns/composables/useStorefrontCampaigns.js'
import { formatCurrency } from '@shared/utils/currency.js'
import { useAccountWishlist } from '../composables/useAccountWishlist.js'
import '@storefront/styles/storefront.css'

const { entries, loading, loaded, error, load, toggle, isPending } = useAccountWishlist()
const { products, isLoading, errorMessage, loadProducts } = useProducts()
const { campaignsForProduct, loadCampaigns, error: campaignError } = useStorefrontCampaigns()
const variants = useProductVariants()
const cart = inject('accountCart', null)
const heading = ref(null), selectedProduct = ref(null), quickOpen = ref(false)
const savedProducts = computed(() => entries.value.map(entry => ({ ...entry, product: products.value.find(product => product.id === entry.productId) || null })))
const getTags = product => Array.isArray(product.tags) ? product.tags : []
function openQuickView(product) { selectedProduct.value = { ...product, selectedSize: variants.getSelectedCardSize(product) }; quickOpen.value = true }
async function closeQuickView() {
  quickOpen.value = false; selectedProduct.value = null
  await nextTick()
  if (document.activeElement === document.body) heading.value?.focus()
}
async function refresh() { await load(true); await loadProducts(); await loadCampaigns() }
watch(() => entries.value.length, async (count, before) => {
  if (count < before) { await nextTick(); if (document.activeElement === document.body) heading.value?.focus() }
})
onMounted(() => { loadProducts(); loadCampaigns() })
</script>
<template>
  <header class="account-heading account-row">
    <div><p class="account-muted mb-2 text-xs font-semibold uppercase">Saved for later</p><h1 ref="heading" tabindex="-1">Your wishlist</h1><p>Your favourite treats, all in one place. Saving does not reserve stock or lock a price.</p></div>
    <button type="button" class="account-button" :disabled="loading || isLoading" @click="refresh"><RefreshCw :size="16" aria-hidden="true" />Refresh</button>
  </header>
  <p v-if="loading || isLoading" role="status" class="account-muted py-5">Loading your saved treats...</p>
  <div v-if="error || errorMessage" role="alert" class="mb-5 rounded-lg border border-red-200 bg-white p-5"><p class="account-error">{{ error || 'Treat details could not load. Please try again.' }}</p><button type="button" class="account-link mt-3" :disabled="loading || isLoading" @click="refresh">Try again</button></div>
  <div v-else-if="loaded && !loading && !isLoading && !entries.length" class="rounded-lg border border-[var(--account-line)] bg-white p-7 shadow-sm">
    <Heart :size="30" class="text-[var(--account-green)]" aria-hidden="true" /><h2 class="mt-4">A little list of favourites</h2><p class="account-muted mt-2 max-w-lg text-sm">No favourites yet. Find something they will love.</p><RouterLink to="/#shop" class="account-button account-button--primary mt-5"><ShoppingBag :size="17" aria-hidden="true" />Find your next favourite</RouterLink>
  </div>
  <template v-if="loaded && !isLoading && !errorMessage && entries.length">
    <p class="account-muted mb-4 text-sm">{{ entries.length }} saved {{ entries.length === 1 ? 'treat' : 'treats' }}<span v-if="campaignError"> · Giving details are temporarily unavailable.</span></p>
    <div class="storefront-ui !bg-transparent grid items-stretch gap-5 min-[1000px]:grid-cols-2">
      <template v-for="item in savedProducts" :key="item.productId">
        <ProductCard v-if="item.product" :product="item.product" :campaigns="campaignsForProduct(item.product)" :format-price="formatCurrency" :get-display-tags="getTags" :get-product-variants="variants.getProductVariants" :get-selected-card-size="variants.getSelectedCardSize" :select-card-size="variants.selectCardSize" :get-selected-card-price="variants.getSelectedCardPrice" :get-selected-card-variant="variants.getSelectedCardVariant" :get-selected-stock-label="variants.getSelectedStockLabel" :is-purchasable="variants.isPurchasable" @quick-view="openQuickView" @add-to-cart="cart?.addToCart($event, variants.getSelectedCardSize($event))" />
        <article v-else class="rounded-lg border border-[var(--account-line)] bg-white p-6 shadow-sm"><Heart :size="24" class="text-[var(--account-muted)]" aria-hidden="true" /><h2 class="mt-4">This treat is unavailable</h2><p class="account-muted mt-2 text-sm">It is no longer in the current catalog. You can remove it from your saved list.</p><button type="button" class="account-button mt-5" :disabled="isPending(item.productId)" @click="toggle(item.productId)"><Trash2 :size="16" aria-hidden="true" />Remove from wishlist</button></article>
      </template>
    </div>
  </template>
  <ProductQuickView :product="selectedProduct" :is-open="quickOpen" @close="closeQuickView" @add-to-cart="cart?.addToCart($event, $event.size)" />
</template>
