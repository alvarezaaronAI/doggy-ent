<template>
  <section id="hero" class="relative">
    <div class="absolute inset-0">
      <img
        src="https://images.unsplash.com/photo-1534361960057-19889db9621e?q=80&w=1600&auto=format&fit=crop"
        alt="Happy labrador looking at dog treats"
        class="w-full h-[72vh] md:h-[78vh] object-cover brightness-[.70]"
      />
      <div class="absolute inset-0 bg-gradient-to-t from-[rgba(243,232,210,0.85)] via-[rgba(243,232,210,0.35)] to-transparent"></div>
    </div>

    <div class="relative max-w-7xl mx-auto px-4 h-[72vh] md:h-[78vh] flex items-end">
      <div class="mb-16 max-w-2xl bg-white/80 backdrop-blur rounded-2xl p-6 md:p-8 border border-[color-mix(in_srgb,var(--brand-3)_35%,white)]">
        <div class="mb-3 flex flex-wrap gap-2 text-[11px]">
          <span class="px-2 py-1 rounded-full bg-emerald-400 text-stone-900 font-bold">Human-grade*</span>
          <span class="px-2 py-1 rounded-full bg-emerald-400 text-stone-900 font-bold">Single-ingredient</span>
          <span class="px-2 py-1 rounded-full bg-emerald-400 text-stone-900 font-bold">No preservatives</span>
        </div>

        <h1 class="text-4xl md:text-5xl font-extrabold leading-tight">
          Small-Batch Dog Treats They’ll Sit For
        </h1>

        <p class="mt-3 text-stone-300">
          Hand-dehydrated chicken breast jerky. Nothing else. Made with love by Chase &amp; Evie Co.
        </p>

        <div class="mt-6 flex flex-wrap gap-3">
          <a href="#spotlight" class="inline-flex items-center gap-2 bg-emerald-400 text-[var(--brand-4)] font-semibold px-5 py-3 rounded-lg hover:bg-emerald-300 focus-ring">
            <i class="fa-solid fa-bone"></i>
            Shop Chicken Jerky
          </a>

          <a href="#ingredients" class="inline-flex items-center gap-2 border border-emerald-400 text-emerald-400 px-5 py-3 rounded-lg hover:bg-stone-900">
            <i class="fa-solid fa-clipboard-check"></i>
            See Ingredients &amp; Analysis
          </a>

          <a href="#about" class="inline-flex items-center gap-2 text-stone-300 hover:text-white">
            Meet Chase &amp; Evie
            <i class="fa-solid fa-arrow-right"></i>
          </a>
        </div>

        <div class="mt-6 grid grid-cols-3 gap-4 text-xs text-stone-300">
          <span class="inline-flex items-center gap-2">
            <i class="fa-solid fa-truck-fast text-emerald-400"></i>
            Fast Shipping
          </span>
          <span class="inline-flex items-center gap-2">
            <i class="fa-solid fa-shield-dog text-emerald-400"></i>
            30-Day Promise
          </span>
          <span class="inline-flex items-center gap-2">
            <i class="fa-solid fa-leaf text-emerald-400"></i>
            Grain-Free
          </span>
        </div>
      </div>
    </div>
  </section>
</template>
