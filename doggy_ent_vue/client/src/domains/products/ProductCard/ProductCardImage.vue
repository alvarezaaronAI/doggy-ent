

<script setup>
const props = defineProps({
  product: {
    type: Object,
    required: true,
  },
})
</script>

<template>
  <img
    class="h-44 w-full flex-shrink-0 object-cover transition hover:opacity-90"
    :src="props.product.image"
    :alt="props.product.name"
  />
</template>