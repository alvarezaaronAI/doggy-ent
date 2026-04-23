<script setup>
import { onMounted, ref } from 'vue'

const products = ref([])
const isLoading = ref(true)
const errorMessage = ref('')

async function loadProducts() {
  isLoading.value = true
  errorMessage.value = ''

  try {
    const response = await fetch('/api/products')

    if (!response.ok) {
      throw new Error(`Products request failed with status ${response.status}`)
    }

    products.value = await response.json()
  } catch (error) {
    errorMessage.value = error.message || 'Unable to load products.'
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  loadProducts()
})
</script>

<template>
  <main class="min-h-screen bg-[var(--brand-5)] text-slate-900">
    <section class="mx-auto max-w-7xl px-6 py-10 md:py-14">
      <div class="section-panel p-8 md:p-10">
        <div class="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p class="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-400">Admin / Catalog</p>
            <h1 class="mt-2 text-4xl font-extrabold">Products</h1>
            <p class="mt-3 max-w-3xl text-stone-300">
              This CMS page now reads from the same backend products API as the storefront.
            </p>
          </div>

          <button class="focus-ring rounded-lg bg-emerald-400 px-5 py-3 font-semibold text-[var(--brand-4)] transition hover:bg-emerald-300">
            Add Product
          </button>
        </div>

        <div v-if="errorMessage" class="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
          {{ errorMessage }}
        </div>

        <div v-if="isLoading" class="mt-6 text-stone-300">
          Loading products...
        </div>

        <div v-else class="mt-8 overflow-hidden rounded-3xl border border-stone-800 bg-white">
          <div class="grid grid-cols-5 gap-4 border-b border-stone-800 bg-[color:var(--brand-5)]/65 px-5 py-4 text-sm font-semibold text-[var(--brand-4)]">
            <div>Name</div>
            <div>Category</div>
            <div>Price</div>
            <div>Status</div>
            <div>Actions</div>
          </div>

          <div
            v-for="product in products"
            :key="product.id"
            class="grid grid-cols-5 items-center gap-4 border-b border-stone-800/50 px-5 py-5 text-sm text-stone-700 last:border-b-0"
          >
            <div>
              <p class="font-semibold text-[var(--brand-4)]">{{ product.name }}</p>
              <p class="mt-1 text-xs text-stone-400">{{ product.id }}</p>
            </div>

            <div>{{ product.category }}</div>

            <div>${{ product.price.toFixed(2) }}</div>

            <div>
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

            <div class="flex flex-wrap gap-2">
              <button class="rounded-lg border border-stone-700 px-3 py-2 font-semibold text-stone-700 transition hover:bg-[color:var(--brand-5)]/55">
                Edit
              </button>
              <button class="rounded-lg border border-stone-700 px-3 py-2 font-semibold text-stone-700 transition hover:bg-[color:var(--brand-5)]/55">
                Delete
              </button>
            </div>
          </div>
        </div>

        <div class="mt-8 flex flex-wrap gap-3">
          <RouterLink
            to="/admin"
            class="rounded-lg border border-stone-700 px-4 py-2 text-sm font-semibold text-stone-700 transition hover:bg-white"
          >
            Back to Dashboard
          </RouterLink>

          <RouterLink
            to="/"
            class="rounded-lg border border-stone-700 px-4 py-2 text-sm font-semibold text-stone-700 transition hover:bg-white"
          >
            Back to Storefront
          </RouterLink>
        </div>
      </div>
    </section>
  </main>
</template>
