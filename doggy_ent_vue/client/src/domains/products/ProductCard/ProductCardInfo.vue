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
    <p class="store-eyebrow">
      {{ props.product.category }}
    </p>

    <h3 class="mt-2 text-xl font-semibold break-words">
      {{ props.product.name }}
    </h3>
  </div>

  <div class="mt-3 flex flex-wrap gap-2">
    <span
      v-for="tag in props.tags.slice(0, 2)"
      :key="tag"
      class="store-product-tag"
    >
      {{ tag }}
    </span>
  </div>

  <p class="mt-3 text-sm store-muted">
    {{ props.product.shortDescription }}
  </p>

  <p class="mt-3 text-xs store-muted">
    {{ props.product.protein }}
    <span v-if="props.product.cut"> • {{ props.product.cut }}</span>
  </p>
</template>
