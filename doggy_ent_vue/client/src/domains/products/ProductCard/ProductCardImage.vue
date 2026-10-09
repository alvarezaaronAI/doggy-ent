<script setup>
import { Package } from '@lucide/vue'
import { ref, watch } from 'vue'
const props = defineProps({
  product: {
    type: Object,
    required: true,
  },
})
const emit = defineEmits(['quick-view'])
const failed = ref(false)
watch(
  () => props.product.image,
  () => {
    failed.value = false
  },
)
</script>

<template>
  <button
    type="button"
    class="block w-full shrink-0 text-left"
    :aria-label="`View ${product.name}`"
    @click="emit('quick-view')"
  >
    <img
      v-if="product.image && !failed"
      class="store-product-media"
      :src="product.image"
      :alt="product.name"
      loading="lazy"
      decoding="async"
      @error="failed = true"
    />
    <span
      v-else
      class="store-product-media flex items-center justify-center bg-[#f4f2ec]"
      ><Package :size="36" aria-hidden="true" /><span class="sr-only"
        >Product image unavailable</span
      ></span
    >
  </button>
</template>
