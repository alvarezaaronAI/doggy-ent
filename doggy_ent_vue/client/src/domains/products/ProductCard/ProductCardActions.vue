<script setup>
import { Eye, ShoppingBag } from '@lucide/vue'
const props = defineProps({
  product: {
    type: Object,
    required: true,
  },
  isPurchasable: {
    type: Boolean,
    required: true,
  },
})

const emit = defineEmits(['quick-view', 'add-to-cart'])
</script>

<template>
  <div class="grid grid-cols-2 gap-2 pt-5">
    <button
      type="button"
      class="store-button flex-wrap px-2 text-sm"
      @click.stop="emit('quick-view', props.product)"
    >
      <Eye :size="16" aria-hidden="true" /> Quick View
    </button>

    <button
      v-if="props.isPurchasable"
      type="button"
      class="store-button store-button-primary flex-wrap px-2 text-sm"
      @click.stop="emit('add-to-cart', props.product)"
    >
      <ShoppingBag :size="16" aria-hidden="true" /> Add to Cart
    </button>

    <button v-else type="button" class="store-button" disabled>
      Unavailable
    </button>
  </div>
</template>
