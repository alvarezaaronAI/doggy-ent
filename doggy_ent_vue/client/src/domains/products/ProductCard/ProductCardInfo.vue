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
  <div>
    <p class="text-xs font-bold uppercase tracking-[0.16em] text-emerald-400">
      {{ props.product.category }}
    </p>

    <h3 class="mt-2 text-xl font-semibold transition group-hover:text-emerald-400">
      {{ props.product.name }}
    </h3>
  </div>

  <div class="mt-3 flex min-h-[28px] flex-wrap gap-2">
    <span
      v-for="tag in props.tags.slice(0, 2)"
      :key="tag"
      class="rounded-full bg-[color-mix(in_srgb,var(--brand-2)_88%,white)] px-3 py-1 text-[11px] font-extrabold text-[var(--brand-4)] shadow-sm"
    >
      {{ tag }}
    </span>
  </div>

  <p class="mt-3 min-h-[52px] text-sm text-stone-300">
    {{ props.product.shortDescription }}
  </p>

  <p class="text-xs font-semibold uppercase tracking-[0.14em] text-stone-400">
    {{ props.product.protein }}
    <span v-if="props.product.cut"> • {{ props.product.cut }}</span>
  </p>
</template>
