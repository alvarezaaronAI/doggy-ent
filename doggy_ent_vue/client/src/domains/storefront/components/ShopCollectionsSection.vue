<script setup>
import { RouterLink } from 'vue-router'

const props = defineProps({
  products: {
    type: Array,
    default: () => [],
  },
})

function getProductImage(product) {
  return (
    product.image ||
    'https://images.unsplash.com/photo-1517423440428-a5a00ad493e8?q=80&w=1200&auto=format&fit=crop'
  )
}
</script>

<template>
  <section id="shop" class="max-w-7xl mx-auto px-4 py-14 section-panel">
    <div class="mb-8 flex items-end justify-between">
      <div>
        <p class="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-400">
          Product Collections
        </p>
        <h2 class="u-underline-blue mt-2 text-3xl font-bold">
          Browse Treat Collections
        </h2>
      </div>

      <a href="#shop" class="text-emerald-400 hover:underline">
        View All →
      </a>
    </div>

    <div
      v-if="!products.length"
      class="rounded-2xl border border-stone-800 bg-white p-6 text-stone-400"
    >
      No collection products available yet.
    </div>

    <div
      v-else
      class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
    >
      <RouterLink
        v-for="product in products.slice(0, 4)"
        :key="product.id"
        :to="`/products/${product.slug}`"
        class="group relative overflow-hidden rounded-2xl tile-strong tile-blue transition hover:border-emerald-400 hover:scale-[1.01]"
      >
        <img
          class="h-44 w-full object-cover opacity-80 transition group-hover:opacity-100"
          :src="getProductImage(product)"
          :alt="product.name"
        />

        <div class="absolute inset-0 tile-label-gradient"></div>

        <div class="absolute bottom-3 left-3 right-3">
          <div class="text-lg font-semibold text-white drop-shadow">
            {{ product.name }}
          </div>

          <div class="mt-1 flex flex-wrap gap-2">
            <span
              class="inline-flex rounded-full bg-white/90 px-2 py-1 text-[11px] font-semibold text-[var(--brand-4)] shadow-sm"
            >
              {{ product.category }}
            </span>

            <span
              v-if="product.status === 'coming-soon'"
              class="inline-flex rounded-full bg-amber-100 px-2 py-1 text-[11px] font-semibold text-amber-700 shadow-sm"
            >
              Coming Soon
            </span>
          </div>
        </div>
      </RouterLink>
    </div>
  </section>
</template>