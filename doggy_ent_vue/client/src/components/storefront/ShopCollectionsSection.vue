<template>
  <section id="shop" class="max-w-7xl mx-auto px-4 py-14 section-panel">
    <div class="mb-8 flex items-end justify-between">
      <h2 class="text-3xl font-bold u-underline-blue">Shop Treats</h2>
      <a href="#catalog" class="text-emerald-400 hover:underline">View All →</a>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <a class="group relative overflow-hidden rounded-2xl tile-strong tile-blue hover:border-emerald-400" href="#catalog">
        <img
          class="h-44 w-full object-cover opacity-80 group-hover:opacity-100 transition"
          src="https://images.unsplash.com/photo-1517423440428-a5a00ad493e8?q=80&w=1200&auto=format&fit=crop"
          alt="Single-ingredient jerky"
        />
        <div class="absolute inset-0 tile-label-gradient"></div>
        <div class="absolute bottom-3 left-3 text-lg font-semibold text-white drop-shadow">
          Single-Ingredient Jerky
        </div>
      </a>

      <div class="relative overflow-hidden rounded-2xl tile-strong tile-blue">
        <img
          class="h-44 w-full object-cover opacity-75"
          src="https://images.unsplash.com/photo-1548199973-03cce0bbc87b?q=80&w=1200&auto=format&fit=crop"
          alt="Training treats"
        />
        <div class="absolute inset-0 tile-label-gradient"></div>
        <div class="absolute bottom-3 left-3 right-3">
          <div class="text-lg font-semibold text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.65)]">
            Training Bites
          </div>
          <div class="mt-1 inline-flex rounded-full bg-white/90 px-2 py-1 text-[11px] font-semibold text-[var(--brand-4)] shadow-sm">
            Coming Soon
          </div>
        </div>
      </div>

      <a class="group relative overflow-hidden rounded-2xl tile-strong tile-blue" href="#catalog">
        <img
          class="h-44 w-full object-cover"
          src="https://images.unsplash.com/photo-1587300003388-59208cc962cb?q=80&w=1200&auto=format&fit=crop"
          alt="Seasonal drops"
        />
        <div class="absolute inset-0 tile-label-gradient"></div>
        <div class="absolute bottom-3 left-3 text-lg font-semibold text-white drop-shadow">
          Seasonal Drops
        </div>
      </a>

      <a class="group relative overflow-hidden rounded-2xl tile-strong tile-blue" href="#bundles">
        <img
          class="h-44 w-full object-cover"
          src="https://images.unsplash.com/photo-1517849845537-4d257902454a?q=80&w=1200&auto=format&fit=crop"
          alt="Bundles"
        />
        <div class="absolute inset-0 tile-label-gradient"></div>
        <div class="absolute bottom-3 left-3 text-lg font-semibold text-white drop-shadow">
          Variety Packs &amp; Bundles
        </div>
      </a>
    </div>
  </section>
</template>
