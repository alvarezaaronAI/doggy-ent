

<script setup>
const props = defineProps({
  product: {
    type: Object,
    required: true,
  },
})
</script>

<template>
  <div class="mt-6 grid gap-4 sm:grid-cols-2">
    <div class="rounded-2xl border border-stone-800 bg-white p-4">
      <div class="flex items-start gap-3">
        <i class="fa-solid fa-bowl-food mt-1 text-emerald-400"></i>
        <div>
          <h3 class="font-extrabold">Ingredients</h3>
          <p class="mt-2 text-sm text-stone-300">
            {{ product.ingredients || 'Single ingredient. No salt, no sugar, no glycerin, no preservatives.' }}
          </p>
        </div>
      </div>
    </div>

    <div class="rounded-2xl border border-stone-800 bg-white p-4">
      <div class="flex items-start gap-3">
        <i class="fa-solid fa-hand-sparkles mt-1 text-emerald-400"></i>
        <div>
          <h3 class="font-extrabold">Texture</h3>
          <p class="mt-2 text-sm text-stone-300">
            {{ product.texture || 'Firm jerky texture that can be broken into smaller pieces.' }}
          </p>
        </div>
      </div>
    </div>

    <div class="rounded-2xl border border-stone-800 bg-white p-4">
      <div class="flex items-start gap-3">
        <i class="fa-solid fa-bullseye mt-1 text-emerald-400"></i>
        <div>
          <h3 class="font-extrabold">Best For</h3>
          <p class="mt-2 text-sm text-stone-300">
            {{ product.bestFor || 'Training rewards, bigger dogs, picky pups, and simple-ingredient routines.' }}
          </p>
        </div>
      </div>
    </div>

    <div class="rounded-2xl border border-stone-800 bg-white p-4">
      <div class="flex items-start gap-3">
        <i class="fa-solid fa-clock mt-1 text-emerald-400"></i>
        <div>
          <h3 class="font-extrabold">Freshness</h3>
          <p class="mt-2 text-sm text-stone-300">
            {{ product.freshness || 'Best enjoyed within 14–21 days after opening. Keep sealed for freshness.' }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>