

<script setup>
const props = defineProps({
  product: {
    type: Object,
    required: true,
  },
})
</script>

<template>
  <div class="min-h-[360px] bg-[var(--brand-5)]">
    <img
      class="h-full min-h-[360px] w-full object-cover"
      :src="props.product.image"
      :alt="props.product.name"
    />
  </div>
</template>