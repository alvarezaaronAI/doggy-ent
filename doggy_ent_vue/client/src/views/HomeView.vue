<script setup>
import { computed, onMounted, ref } from 'vue'
import CartDrawer from '../components/cart/CartDrawer.vue'
import PromoStrip from '../components/layout/PromoStrip.vue'
import SiteHeader from '../components/layout/SiteHeader.vue'
import SiteFooter from '../components/layout/SiteFooter.vue'
import HeroSection from '../components/storefront/HeroSection.vue'

const products = ref([])
const cart = ref([])
const isCartOpen = ref(false)
const isLoading = ref(true)

async function loadProducts() {
  isLoading.value = true

  try {
    const res = await fetch('/api/products')
    products.value = await res.json()
  } finally {
    isLoading.value = false
  }
}

onMounted(loadProducts)

function addToCart(product) {
  const size = product.category === 'Bundle' ? 'Bundle' : 'Default'
  const existing = cart.value.find((item) => item.id === product.id && item.size === size)

  if (existing) {
    existing.quantity += 1
  } else {
    cart.value.push({
      ...product,
      size,
      quantity: 1,
    })
  }

  isCartOpen.value = true
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

        <div v-else class="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <article
            v-for="product in products"
            :key="product.id"
            class="tile-strong overflow-hidden rounded-2xl"
          >
            <img
              class="h-56 w-full object-cover"
              :src="product.image"
              :alt="product.name"
            />

            <div class="p-5">
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

              <p class="mt-3 text-sm text-stone-300">
                {{ product.shortDescription }}
              </p>

              <div class="mt-4 flex items-center justify-between gap-3">
                <p class="font-semibold text-[var(--brand-4)]">
                  {{ formatPrice(product.price) }}
                </p>

                <button
                  class="focus-ring rounded-lg bg-emerald-400 px-4 py-2 font-semibold text-[var(--brand-4)] hover:bg-emerald-300"
                  @click="addToCart(product)"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          </article>
        </div>
      </section>

      <section id="process" class="section-panel mx-auto max-w-7xl px-4 py-14">
        <h2 class="u-underline-blue text-3xl font-bold">How We Make Them</h2>

        <div class="mt-8 grid gap-6 sm:grid-cols-3">
          <div class="tile rounded-2xl p-6">
            <div class="mb-2 text-2xl text-emerald-400">🌱</div>
            <h3 class="mb-1 font-semibold">Source</h3>
            <p class="text-sm text-stone-300">Lean chicken breast from trusted suppliers.</p>
          </div>

          <div class="tile rounded-2xl p-6">
            <div class="mb-2 text-2xl text-emerald-400">🔥</div>
            <h3 class="mb-1 font-semibold">Prepare</h3>
            <p class="text-sm text-stone-300">Trim, slice, and dehydrate low & slow for max flavor.</p>
          </div>

          <div class="tile rounded-2xl p-6">
            <div class="mb-2 text-2xl text-emerald-400">📦</div>
            <h3 class="mb-1 font-semibold">Pack</h3>
            <p class="text-sm text-stone-300">Hand-bagged in craft pouches. That’s it.</p>
          </div>
        </div>
      </section>

      <section id="ingredients" class="section-panel mx-auto max-w-7xl px-4 py-14">
        <div class="grid gap-8 md:grid-cols-2">
          <div class="rounded-3xl border border-stone-800 bg-white p-8">
            <div class="mb-2 text-sm font-bold text-emerald-400">ONE INGREDIENT</div>
            <h2 class="text-3xl font-extrabold">Chicken Breast</h2>
            <p class="mt-2 text-stone-300">
              No salt, no sugar, no glycerin, no preservatives. No wheat, corn, or soy.
            </p>
          </div>

          <div class="rounded-3xl border border-stone-800 bg-white p-8">
            <h3 class="mb-4 text-xl font-bold">Guaranteed Analysis</h3>
            <dl class="grid grid-cols-2 gap-y-2 text-sm">
              <dt class="text-stone-400">Crude Protein (min)</dt><dd class="text-right">70%</dd>
              <dt class="text-stone-400">Crude Fat (min)</dt><dd class="text-right">4.5%</dd>
              <dt class="text-stone-400">Crude Fiber (max)</dt><dd class="text-right">0.5%</dd>
              <dt class="text-stone-400">Moisture (max)</dt><dd class="text-right">20%</dd>
            </dl>
          </div>
        </div>
      </section>
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
