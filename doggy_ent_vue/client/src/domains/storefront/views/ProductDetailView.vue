<script setup>
import { RouterLink } from 'vue-router'
</script>

<template>
  <section class="shop-collections-section">
    <div class="max-w-7xl mx-auto px-6">
      <div class="grid grid-cols-2 gap-6 md:grid-cols-4">
      <RouterLink
        class="group relative overflow-hidden rounded-2xl tile-strong tile-blue transition hover:border-emerald-400 hover:scale-[1.01]"
        to="/products/chicken-breast-jerky"
      >
        <img
          class="h-44 w-full object-cover opacity-80 transition group-hover:opacity-100"
          src="https://images.unsplash.com/photo-1517423440428-a5a00ad493e8?q=80&w=1200&auto=format&fit=crop"
          alt="Single-ingredient jerky"
        />
        <div class="absolute inset-0 tile-label-gradient"></div>
        <div class="absolute bottom-3 left-3 text-lg font-semibold text-white drop-shadow">
          Single-Ingredient Jerky
        </div>
      </RouterLink>

      <a class="group relative overflow-hidden rounded-2xl tile-strong tile-blue" href="#shop">
        <img
          class="h-44 w-full object-cover opacity-80 group-hover:opacity-100 transition"
          src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1200&auto=format&fit=crop"
          alt="Freeze-dried"
        />
        <div class="absolute inset-0 tile-label-gradient"></div>
        <div class="absolute bottom-3 left-3 text-lg font-semibold text-white drop-shadow">
          Freeze-Dried
        </div>
      </a>

      <RouterLink
        class="group relative overflow-hidden rounded-2xl tile-strong tile-blue transition hover:scale-[1.01]"
        to="/products/seasonal-drop"
      >
        <img
          class="h-44 w-full object-cover"
          src="https://images.unsplash.com/photo-1587300003388-59208cc962cb?q=80&w=1200&auto=format&fit=crop"
          alt="Seasonal drops"
        />
        <div class="absolute inset-0 tile-label-gradient"></div>
        <div class="absolute bottom-3 left-3 text-lg font-semibold text-white drop-shadow">
          Seasonal Drops
        </div>
      </RouterLink>

      <RouterLink
        class="group relative overflow-hidden rounded-2xl tile-strong tile-blue transition hover:scale-[1.01]"
        to="/products/lamb-jerky"
      >
        <img
          class="h-44 w-full object-cover"
          src="https://images.unsplash.com/photo-1517849845537-4d257902454a?q=80&w=1200&auto=format&fit=crop"
          alt="Bundles"
        />
        <div class="absolute inset-0 tile-label-gradient"></div>
        <div class="absolute bottom-3 left-3 text-lg font-semibold text-white drop-shadow">
          Variety Packs &amp; Bundles
        </div>
      </RouterLink>
    </div>
    </div>
  </section>
</template>
