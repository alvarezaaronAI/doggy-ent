<script setup>
import { onMounted, ref } from 'vue'

const healthData = ref(null)
const products = ref([])
const isLoadingHealth = ref(true)
const isLoadingProducts = ref(true)
const errorMessage = ref('')

async function loadHealth() {
  isLoadingHealth.value = true

  try {
    const response = await fetch('/api/health')

    if (!response.ok) {
      throw new Error(`Health request failed with status ${response.status}`)
    }

    healthData.value = await response.json()
  } catch (error) {
    errorMessage.value = error.message || 'Unable to reach the backend server.'
  } finally {
    isLoadingHealth.value = false
  }
}

async function loadProducts() {
  isLoadingProducts.value = true

  try {
    const response = await fetch('/api/products')

    if (!response.ok) {
      throw new Error(`Products request failed with status ${response.status}`)
    }

    products.value = await response.json()
  } catch (error) {
    errorMessage.value = error.message || 'Unable to load products.'
  } finally {
    isLoadingProducts.value = false
  }
}

onMounted(() => {
  loadHealth()
  loadProducts()
})
</script>

<template>
  <main class="min-h-screen bg-[var(--brand-5)] text-slate-900">
    <section class="mx-auto max-w-7xl px-6 py-10 md:py-14">
      <div class="section-panel p-8 md:p-10">
        <p class="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-400">
          Doggy Ent storefront
        </p>

        <h1 class="mt-3 text-4xl font-extrabold tracking-tight">
          Storefront is now powered by the backend
        </h1>

        <p class="mt-4 max-w-3xl text-stone-300">
          This page is now loading real mock products from your Express API instead of only showing a health check.
        </p>

        <div class="mt-6 grid gap-4 md:grid-cols-2">
          <div class="tile rounded-2xl p-5">
            <h2 class="text-xl font-extrabold">Backend health</h2>
            <p v-if="isLoadingHealth" class="mt-3 text-sm text-stone-300">Checking backend...</p>
            <pre v-else class="mt-3 rounded-xl bg-[var(--brand-4)] p-4 text-sm text-white">{{ JSON.stringify(healthData, null, 2) }}</pre>
          </div>

          <div class="tile rounded-2xl p-5">
            <h2 class="text-xl font-extrabold">Products API</h2>
            <p class="mt-3 text-sm text-stone-300">
              Endpoint: <code>/api/products</code>
            </p>
            <p class="mt-2 text-sm text-stone-300">
              Loaded products: <strong>{{ products.length }}</strong>
            </p>
          </div>
        </div>

        <div v-if="errorMessage" class="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
          {{ errorMessage }}
        </div>
      </div>
    </section>

    <section class="mx-auto max-w-7xl px-6 pb-10 md:pb-14">
      <div class="section-panel p-8 md:p-10">
        <div class="flex items-end justify-between gap-4">
          <div>
            <p class="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-400">
              Product feed
            </p>
            <h2 class="mt-2 text-3xl font-extrabold">Featured products</h2>
          </div>

          <RouterLink
            to="/admin/products"
            class="rounded-lg border border-stone-700 px-4 py-2 text-sm font-semibold text-stone-700 transition hover:bg-white"
          >
            Open product CMS
          </RouterLink>
        </div>

        <div v-if="isLoadingProducts" class="mt-6 text-stone-300">
          Loading products...
        </div>

        <div v-else class="mt-8 grid gap-5 md:grid-cols-3">
          <article
            v-for="product in products"
            :key="product.id"
            class="tile-strong overflow-hidden rounded-3xl"
          >
            <img
              :src="product.image"
              :alt="product.name"
              class="h-52 w-full object-cover"
            />

            <div class="p-5">
              <div class="flex items-start justify-between gap-3">
                <div>
                  <p class="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-400">
                    {{ product.category }}
                  </p>
                  <h3 class="mt-2 text-2xl font-extrabold">{{ product.name }}</h3>
                </div>

                <span
                  class="rounded-full px-3 py-1 text-xs font-semibold"
                  :class="
                    product.status === 'active'
                      ? 'bg-[color:var(--success-1)]/15 text-[color:var(--success-1)]'
                      : 'bg-stone-200 text-stone-700'
                  "
                >
                  {{ product.status }}
                </span>
              </div>

              <p class="mt-3 text-sm text-stone-300">
                {{ product.shortDescription }}
              </p>

              <div class="mt-5 flex items-center justify-between">
                <span class="text-lg font-extrabold text-[var(--brand-4)]">
                  ${{ product.price.toFixed(2) }}
                </span>

                <button class="focus-ring rounded-lg bg-emerald-400 px-4 py-2 font-semibold text-[var(--brand-4)] transition hover:bg-emerald-300">
                  Add to Cart
                </button>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  </main>
</template>
