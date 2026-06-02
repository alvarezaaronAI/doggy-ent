<script setup>
const emit = defineEmits([
  'continue-shopping',
])
</script>

<template>
  <div class="flex flex-1 flex-col items-center justify-center px-6 text-center">
    <div class="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--brand-2)_50%,white)] text-2xl text-[var(--brand-4)] shadow-sm">
      🛍️
    </div>

    <h3 class="text-xl font-bold">Your cart is empty</h3>

    <p class="mt-2 max-w-xs text-sm text-stone-300">
      Add a treat to see your order slide in from the right side.
    </p>

    <button
      class="focus-ring mt-5 inline-flex items-center gap-2 rounded-lg bg-emerald-400 px-5 py-3 font-semibold text-[var(--brand-4)] hover:bg-emerald-300"
      @click="emit('continue-shopping')"
    >
      Shop Treats
    </button>
  </div>
</template>
