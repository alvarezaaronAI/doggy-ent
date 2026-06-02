

<script setup>
const props = defineProps({
  storageFeeding: {
    type: String,
    default: '',
  },
})
</script>

<template>
  <div class="mt-4 rounded-2xl border border-stone-800 bg-[color-mix(in_srgb,var(--brand-5)_55%,white)] p-4">
    <h3 class="font-extrabold">Storage & Feeding</h3>
    <p class="mt-2 text-sm text-stone-300">
      {{ storageFeeding || 'Keep sealed in a cool, dry place. Refrigerate after opening for max freshness. Treats are intended for intermittent or supplemental feeding only. Always supervise and provide fresh water.' }}
    </p>
  </div>
</template>