<script setup>
import { computed, onMounted, ref } from 'vue'
import CartDrawer from '../components/cart/CartDrawer.vue'
import PromoStrip from '../components/layout/PromoStrip.vue'
import SiteHeader from '../components/layout/SiteHeader.vue'
import SiteFooter from '../components/layout/SiteFooter.vue'
import HeroSection from '../components/storefront/HeroSection.vue'
import ProductSpotlightSection from '../components/storefront/ProductSpotlightSection.vue'
import ShopCollectionsSection from '../components/storefront/ShopCollectionsSection.vue'
import ProcessSection from '../components/storefront/ProcessSection.vue'
import IngredientsAnalysisSection from '../components/storefront/IngredientsAnalysisSection.vue'
import ReviewsPreviewSection from '../components/storefront/ReviewsPreviewSection.vue'
import BundlesSection from '../components/storefront/BundlesSection.vue'
import AboutBrandSection from '../components/storefront/AboutBrandSection.vue'
import QuickViewModal from '../components/storefront/QuickViewModal.vue'

const products = ref([])
const cart = ref([])
const isCartOpen = ref(false)
const isLoading = ref(true)
const selectedProduct = ref(null)
const isQuickViewOpen = ref(false)
const errorMessage = ref('')

async function loadProducts() {
  isLoading.value = true
  errorMessage.value = ''

  try {
    const res = await fetch('/api/products')

    if (!res.ok) {
      throw new Error(`Products request failed with status ${res.status}`)
    }

    const data = await res.json()
    products.value = Array.isArray(data) ? data : []
  } catch (error) {
    products.value = []
    errorMessage.value = error.message || 'Unable to load products.'
  } finally {
    isLoading.value = false
  }
}

onMounted(loadProducts)

function openQuickView(product) {
  selectedProduct.value = product
  isQuickViewOpen.value = true
}

function closeQuickView() {
  selectedProduct.value = null
  isQuickViewOpen.value = false
}

function addToCart(product) {
  const size = product.size || (product.category === 'Bundle' ? 'Bundle' : '6 oz')
  const quantityToAdd = product.quantity || 1
  const price = Number(product.price || 0)
  const existing = cart.value.find((item) => item.id === product.id && item.size === size)

  if (existing) {
    existing.quantity += quantityToAdd
  } else {
    cart.value.push({
      ...product,
      price,
      size,
      quantity: quantityToAdd,
    })
  }

  isCartOpen.value = true
  isQuickViewOpen.value = false
}

function increase(id, size) {
  const item = cart.value.find((cartItem) => cartItem.id === id && cartItem.size === size)
  if (item) item.quantity += 1
}

function decrease(id, size) {
  const item = cart.value.find((cartItem) => cartItem.id === id && cartItem.size === size)

  if (!item) return

  item.quantity -= 1

  if (item.quantity <= 0) {
    remove(id, size)
  }
}

function remove(id, size) {
  cart.value = cart.value.filter((cartItem) => !(cartItem.id === id && cartItem.size === size))
}

const subtotal = computed(() =>
  cart.value.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0)
)

const itemCount = computed(() =>
  cart.value.reduce((sum, item) => sum + item.quantity, 0)
)

const featuredProduct = computed(() =>
  products.value.find((product) => product.featured) || products.value[0] || null
)

function formatPrice(value) {
  return `$${Number(value).toFixed(2)}`
}
</script>

<template>
  <div class="min-h-screen bg-[var(--brand-5)] text-stone-900">
    <PromoStrip />

    <SiteHeader
      :cart-count="itemCount"
      @open-cart="isCartOpen = true"
    />

    <HeroSection />

    <main>
      <ProductSpotlightSection
        :featured-product="featuredProduct"
        @add-to-cart="addToCart"
      />

      <ShopCollectionsSection />

      <section id="catalog" class="section-panel mx-auto max-w-7xl px-4 py-14">
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

        <div v-if="isLoading" class="mt-8 text-stone-300">
          Loading treats...
        </div>

        <div v-else-if="errorMessage" class="mt-8 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
          {{ errorMessage }}
        </div>

        <div v-else-if="!products.length" class="mt-8 rounded-2xl border border-stone-800 bg-white p-6 text-stone-300">
          No products found yet. Add products from the admin dashboard.
        </div>

        <div v-else class="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <article
            v-for="product in products"
            :key="product.id"
            class="tile-strong flex h-full min-h-[520px] cursor-pointer flex-col overflow-hidden rounded-2xl transition hover:-translate-y-1 hover:shadow-2xl"
            @click="openQuickView(product)"
          >
            <img
              class="h-56 w-full flex-shrink-0 object-cover"
              :src="product.image"
              :alt="product.name"
            />

            <div class="flex flex-1 flex-col p-5">
              <div class="flex items-start justify-between gap-3">
                <div>
                  <p class="text-xs font-bold uppercase tracking-[0.16em] text-emerald-400">
                    {{ product.category }}
                  </p>
                  <h3 class="mt-2 text-xl font-semibold">{{ product.name }}</h3>
                </div>

                <span
                  class="rounded-full px-2 py-1 text-[11px] font-bold"
                  :class="product.status === 'active'
                    ? 'bg-[color:var(--success-1)]/15 text-[color:var(--success-1)]'
                    : 'bg-stone-200 text-stone-700'"
                >
                  {{ product.status }}
                </span>
              </div>

              <p class="mt-3 min-h-[72px] text-sm text-stone-300">
                {{ product.shortDescription }}
              </p>

              <div class="mt-auto flex flex-wrap items-center justify-between gap-3 pt-4">
                <p class="font-semibold text-[var(--brand-4)]">
                  {{ formatPrice(product.price) }}
                </p>

                <div class="flex items-center gap-2">
                  <button
                    class="rounded-lg border border-emerald-400 px-3 py-2 text-sm font-semibold text-emerald-400 hover:bg-stone-900"
                    @click.stop="openQuickView(product)"
                  >
                    Quick View
                  </button>

                  <button
                    class="focus-ring rounded-lg bg-emerald-400 px-4 py-2 font-semibold text-[var(--brand-4)] hover:bg-emerald-300"
                    @click.stop="addToCart(product)"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          </article>
        </div>
      </section>

      <ProcessSection />
      <IngredientsAnalysisSection />
      <ReviewsPreviewSection />
      <BundlesSection />
      <AboutBrandSection />
    </main>

    <SiteFooter />

    <QuickViewModal
      :product="selectedProduct"
      :is-open="isQuickViewOpen"
      @close="closeQuickView"
      @add-to-cart="addToCart"
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
