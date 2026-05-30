

<script setup>
const props = defineProps({
  product: {
    type: Object,
    required: true,
  },
  tags: {
    type: Array,
    default: () => [],
  },
})
</script>

<template>
  <p class="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-400">
    Quick View
  </p>

  <h2 class="mt-2 text-3xl font-extrabold">
    {{ props.product.name }}
  </h2>

  <div class="mt-3 flex flex-wrap gap-2">
    <span
      v-for="tag in props.tags.slice(0, 3)"
      :key="tag"
      class="rounded-full bg-[color-mix(in_srgb,var(--brand-2)_88%,white)] px-3 py-1 text-[11px] font-extrabold text-[var(--brand-4)] shadow-sm"
    >
      {{ tag }}
    </span>
  </div>

  <p class="mt-1 text-sm font-semibold text-stone-400">
    {{ props.product.protein }} <span v-if="props.product.cut">• {{ props.product.cut }}</span>
  </p>

  <p class="mt-3 text-stone-300">
    {{ props.product.shortDescription }}
  </p>
</template>