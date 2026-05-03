<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import CartDrawer from '../components/cart/CartDrawer.vue'
import PromoStrip from '../components/layout/PromoStrip.vue'
import SiteHeader from '../components/layout/SiteHeader.vue'
import SiteFooter from '../components/layout/SiteFooter.vue'
import HeroSection from '../components/storefront/HeroSection.vue'
import ProductSpotlightSection from '../components/storefront/ProductSpotlightSection.vue'
import ProcessSection from '../components/storefront/ProcessSection.vue'
import IngredientsAnalysisSection from '../components/storefront/IngredientsAnalysisSection.vue'
import ReviewsPreviewSection from '../components/storefront/ReviewsPreviewSection.vue'
import AboutBrandSection from '../components/storefront/AboutBrandSection.vue'
import QuickViewModal from '../components/storefront/QuickViewModal.vue'
import {
  getSellingMode,
  isPurchasable,
  getAvailableQuantity,
  limitQuantity,
  getStockLabel,
} from '../utils/sellingMode'

const products = ref([])
const cart = ref([])
const isCartOpen = ref(false)
const isLoading = ref(true)
const selectedProduct = ref(null)
const isQuickViewOpen = ref(false)
const errorMessage = ref('')
const selectedCardSizes = ref({})
const CART_STORAGE_KEY = 'doggy-ent-cart'

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

onMounted(() => {
  loadSavedCart()
  loadProducts()
})

watch(
  cart,
  (updatedCart) => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(updatedCart))
  },
  { deep: true }
)

function loadSavedCart() {
  try {
    const savedCart = JSON.parse(localStorage.getItem(CART_STORAGE_KEY) || '[]')
    cart.value = Array.isArray(savedCart) ? savedCart : []
  } catch {
    cart.value = []
  }
}

function openQuickView(product) {
  selectedProduct.value = product
  isQuickViewOpen.value = true
}

function closeQuickView() {
  selectedProduct.value = null
  isQuickViewOpen.value = false
}

function addToCart(product) {
  const selectedSize = selectedCardSizes.value[product.id]
  const defaultSize = product.category === 'Bundle' ? 'Bundle' : '6 oz'
  const size = product.size || selectedSize || defaultSize
  const quantityToAdd = product.quantity || 1
  const selectedVariant = product.variants?.find((variant) => variant.size === size)
  const availableQuantity = getAvailableQuantity(product, selectedVariant)

  if (!isPurchasable(product, selectedVariant)) return

  const price = Number(product.price || selectedVariant?.price || product.variants?.[0]?.price || 0)
  const existing = cart.value.find((item) => item.id === product.id && item.size === size)

  if (existing) {
    const nextQuantity = existing.quantity + quantityToAdd
    existing.quantity = limitQuantity(product, nextQuantity, availableQuantity)
  } else {
    cart.value.push({
      ...product,
      price,
      size,
      quantity: limitQuantity(product, quantityToAdd, availableQuantity),
      availableQuantity,
      sellingMode: getSellingMode(product),
    })
  }

  isCartOpen.value = true
  isQuickViewOpen.value = false
}

function increase(id, size) {
  const item = cart.value.find((cartItem) => cartItem.id === id && cartItem.size === size)
  if (!item) return

  const currentProduct = products.value.find((product) => product.id === id)
  const currentVariant = currentProduct?.variants?.find((variant) => variant.size === size)
  const availableQuantity = getAvailableQuantity(currentProduct || item, currentVariant)

  const nextQuantity = item.quantity + 1
  item.quantity = limitQuantity(currentProduct || item, nextQuantity, availableQuantity)
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

const activeProducts = computed(() =>
  products.value.filter((product) => product.status === 'active')
)

const comingSoonProducts = computed(() =>
  products.value.filter((product) => product.status === 'coming-soon')
)

const featuredProduct = computed(() =>
  activeProducts.value.find((product) => product.featured) || activeProducts.value[0] || null
)

function getDisplayTags(product) {
  if (Array.isArray(product.tags) && product.tags.length) {
    return product.tags
  }

  return ['Small-batch', 'No fillers']
}

function getVariantPrice(product, size) {
  return product.variants?.find((variant) => variant.size === size)?.price || product.price || 0
}

function hasVariant(product, size) {
  return Boolean(product.variants?.find((variant) => variant.size === size))
}

function getProductVariants(product) {
  return Array.isArray(product.variants) ? product.variants : []
}

function getSelectedCardSize(product) {
  return selectedCardSizes.value[product.id] || getProductVariants(product)[0]?.size || '6 oz'
}

function selectCardSize(product, size) {
  selectedCardSizes.value = {
    ...selectedCardSizes.value,
    [product.id]: size,
  }
}

function getSelectedCardPrice(product) {
  return getVariantPrice(product, getSelectedCardSize(product))
}

function getSelectedCardVariant(product) {
  return getProductVariants(product).find(
    (variant) => variant.size === getSelectedCardSize(product)
  )
}


function getSelectedStockLabel(product) {
  return getStockLabel(product, getSelectedCardVariant(product))
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
      @open-cart="isCartOpen = true"
    />

    <HeroSection />

    <main class="space-y-8 pb-12">
      <ProductSpotlightSection
        :featured-product="featuredProduct"
        @add-to-cart="addToCart"
      />


      <section id="catalog" class="section-panel mx-auto max-w-7xl px-5 py-9 md:px-6">
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

        <div v-else-if="!activeProducts.length" class="mt-8 rounded-2xl border border-stone-800 bg-white p-6 text-stone-300">
          No active products are available yet. Add or activate products from the admin dashboard.
        </div>

        <div v-else class="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <article
            v-for="product in activeProducts"
            :key="product.id"
            class="tile-strong flex h-full min-h-[500px] cursor-pointer flex-col overflow-hidden rounded-2xl transition hover:-translate-y-1 hover:shadow-2xl"
            @click="openQuickView(product)"
          >
            <img
              class="h-44 w-full flex-shrink-0 object-cover"
              :src="product.image"
              :alt="product.name"
            />

            <div class="flex flex-1 flex-col p-4">
              <div>
                <p class="text-xs font-bold uppercase tracking-[0.16em] text-emerald-400">
                  {{ product.category }}
                </p>
                <h3 class="mt-2 text-xl font-semibold">{{ product.name }}</h3>
              </div>

              <div class="mt-3 flex min-h-[28px] flex-wrap gap-2">
                <span
                  v-for="tag in getDisplayTags(product).slice(0, 2)"
                  :key="tag"
                  class="rounded-full bg-[color-mix(in_srgb,var(--brand-2)_88%,white)] px-3 py-1 text-[11px] font-extrabold text-[var(--brand-4)] shadow-sm"
                >
                  {{ tag }}
                </span>
              </div>

              <p class="mt-3 min-h-[52px] text-sm text-stone-300">
                {{ product.shortDescription }}
              </p>
              <p class="text-xs font-semibold uppercase tracking-[0.14em] text-stone-400">
                {{ product.protein }}<span v-if="product.cut"> • {{ product.cut }}</span>
              </p>

              <div class="mt-3 border-t border-[color-mix(in_srgb,var(--brand-3)_30%,white)] pt-3">
                <div class="flex items-center gap-2">
                  <button
                    v-for="variant in getProductVariants(product)"
                    :key="variant.size"
                    class="rounded-full px-3 py-1 text-xs font-extrabold border transition"
                    :class="getSelectedCardSize(product) === variant.size
                      ? 'bg-emerald-400 text-[var(--brand-4)] border-emerald-400'
                      : 'bg-white text-stone-700 border-stone-700 hover:border-emerald-400'"
                    @click.stop="selectCardSize(product, variant.size)"
                  >
                    {{ variant.size }}
                  </button>
                </div>

                <div class="mt-3 flex items-end justify-between gap-3">
                  <p class="text-lg font-extrabold text-[var(--brand-4)]">
                    {{ formatPrice(getSelectedCardPrice(product)) }}
                  </p>
                  <p
                    class="text-xs font-bold uppercase tracking-[0.12em]"
                  :class="isPurchasable(product, getSelectedCardVariant(product))
                    ? 'text-[color:var(--success-1)]'
                    : 'text-amber-700'"
                  >
                    {{ getSelectedStockLabel(product) }}
                  </p>
                </div>
              </div>

              <div class="mt-auto flex items-center justify-between gap-2 pt-5">
                <button
                  v-if="isPurchasable(product, getSelectedCardVariant(product))"
                  class="focus-ring rounded-lg bg-emerald-400 px-4 py-2 font-semibold text-[var(--brand-4)] hover:bg-emerald-300"
                  @click.stop="addToCart(product)"
                >
                  Add to Cart
                </button>

                <button
                  v-else
                  class="focus-ring rounded-lg bg-emerald-400 px-4 py-2 font-semibold text-[var(--brand-4)] hover:bg-emerald-300"
                  @click.stop="openQuickView(product)"
                >
                  Notify Me
                </button>
              </div>
            </div>
          </article>
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
          <article
            v-for="product in comingSoonProducts"
            :key="product.id"
            class="tile-strong flex h-full min-h-[450px] cursor-pointer flex-col overflow-hidden rounded-2xl transition hover:-translate-y-1 hover:shadow-2xl"
            @click="openQuickView(product)"
          >
            <img
              class="h-44 w-full flex-shrink-0 object-cover"
              :src="product.image"
              :alt="product.name"
            />

            <div class="flex flex-1 flex-col p-4">
              <div>
                <p class="text-xs font-bold uppercase tracking-[0.16em] text-emerald-400">
                  {{ product.category }}
                </p>
                <h3 class="mt-2 text-xl font-semibold">{{ product.name }}</h3>
              </div>

              <div class="mt-3 flex min-h-[28px] flex-wrap gap-2">
                <span
                  v-for="tag in getDisplayTags(product).slice(0, 2)"
                  :key="tag"
                  class="rounded-full bg-[color-mix(in_srgb,var(--brand-2)_88%,white)] px-3 py-1 text-[11px] font-extrabold text-[var(--brand-4)] shadow-sm"
                >
                  {{ tag }}
                </span>
              </div>

              <p class="mt-3 min-h-[48px] text-sm text-stone-300">
                {{ product.shortDescription }}
              </p>

              <p class="text-xs font-semibold uppercase tracking-[0.14em] text-stone-400">
                {{ product.protein }}<span v-if="product.cut"> • {{ product.cut }}</span>
              </p>

              <div class="mt-4 rounded-2xl border border-[color-mix(in_srgb,var(--brand-3)_35%,white)] bg-[color-mix(in_srgb,var(--brand-5)_62%,white)] p-3">
                <p class="text-xs font-extrabold uppercase tracking-[0.22em] text-emerald-400">
                  Coming Soon
                </p>
                <h4 class="mt-1 text-base font-extrabold text-[var(--brand-4)]">
                  This product is not available yet
                </h4>
                <p class="mt-1 text-sm leading-relaxed text-stone-300">
                  Pricing, sizes, and launch details will be announced when this treat goes live.
                </p>
              </div>

              <div class="mt-auto flex items-center justify-between gap-2 pt-5">
                <button
                  class="rounded-lg border border-emerald-400 px-3 py-2 text-sm font-semibold text-emerald-400 hover:bg-stone-900"
                  @click.stop="openQuickView(product)"
                >
                  Preview
                </button>

                <button
                  class="focus-ring rounded-lg bg-emerald-400 px-4 py-2 font-semibold text-[var(--brand-4)] hover:bg-emerald-300"
                  @click.stop="openQuickView(product)"
                >
                  Notify Me
                </button>
              </div>
            </div>
          </article>
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
