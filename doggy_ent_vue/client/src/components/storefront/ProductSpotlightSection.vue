<script setup>
defineProps({
  featuredProduct: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['add-to-cart'])

function formatPrice(value) {
  return `$${Number(value).toFixed(2)}`
}
</script>

<template>
  <section id="spotlight" class="max-w-7xl mx-auto px-4 py-14">
    <div class="grid md:grid-cols-2 gap-8 md:items-stretch items-start bg-white border border-[color-mix(in_srgb,var(--brand-3)_35%,white)] rounded-3xl overflow-hidden">
      <div class="h-full min-h-[320px] md:min-h-[100%] overflow-hidden">
        <img
          :src="featuredProduct?.image || 'https://images.unsplash.com/photo-1568640347023-a616a30bc3bd?q=80&w=1200&auto=format&fit=crop'"
          :alt="featuredProduct?.name || 'Chicken breast jerky in craft pouch'"
          class="media-cover"
        />
      </div>

      <div class="p-6 md:p-8 flex flex-col justify-center">
        <h2 class="text-2xl md:text-3xl font-bold">
          {{ featuredProduct?.name || 'Chicken Breast Jerky' }}
        </h2>

        <p class="mt-2 text-stone-300">
          {{ featuredProduct?.shortDescription || 'Lean, hand-sliced chicken breast, dehydrated low & slow. That’s the whole ingredient list.' }}
        </p>

        <ul class="mt-4 text-sm text-stone-300 space-y-1">
          <li class="flex items-center gap-2">
            <i class="fa-regular fa-circle-check text-emerald-400"></i>
            Single ingredient
          </li>
          <li class="flex items-center gap-2">
            <i class="fa-regular fa-circle-check text-emerald-400"></i>
            Low-temp dehydrated
          </li>
          <li class="flex items-center gap-2">
            <i class="fa-regular fa-circle-check text-emerald-400"></i>
            Made in USA*
          </li>
        </ul>

        <div class="mt-5 flex flex-wrap items-center gap-3">
          <label class="text-sm text-stone-300">Size:</label>
          <div class="flex gap-2">
            <button class="px-3 py-2 rounded-lg border border-stone-700 hover:border-emerald-400">3 oz</button>
            <button class="px-3 py-2 rounded-lg border border-stone-700 hover:border-emerald-400">6 oz</button>
            <button class="px-3 py-2 rounded-lg border border-stone-700 hover:border-emerald-400">12 oz</button>
          </div>
        </div>

        <div class="mt-5 flex items-center gap-3">
          <div class="text-lg font-semibold">
            {{ formatPrice(featuredProduct?.price || 12.99) }}
          </div>
          <label class="flex items-center gap-2 text-sm">
            <input type="checkbox" class="accent-emerald-400" />
            Subscribe &amp; Save 10%
          </label>
        </div>

        <div class="mt-6 flex flex-wrap gap-3">
          <button
            class="inline-flex items-center gap-2 bg-emerald-400 text-[var(--brand-4)] font-semibold px-5 py-3 rounded-lg hover:bg-emerald-300 focus-ring"
            @click="featuredProduct && emit('add-to-cart', featuredProduct)"
          >
            <i class="fa-solid fa-bag-shopping"></i>
            Add to Cart
          </button>

          <a href="#catalog" class="inline-flex items-center gap-2 text-emerald-400 hover:underline">
            Learn More
            <i class="fa-solid fa-arrow-right"></i>
          </a>
        </div>
      </div>
    </div>
  </section>
</template>
