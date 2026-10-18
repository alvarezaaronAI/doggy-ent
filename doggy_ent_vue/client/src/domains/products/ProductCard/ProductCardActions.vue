<script setup>
import { Eye, ShoppingBag } from '@lucide/vue'
import { computed, inject } from 'vue'
import { pagePresentation } from '@storefront-content/pagePresentation.js'
import { useStorefrontContent } from '@storefront/composables/useStorefrontContent.js'
const { content } = useStorefrontContent()
const presentation = inject('storefrontPresentation', null)
const labels = computed(() => pagePresentation(presentation?.value || content.value).cards)
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
      <Eye :size="16" aria-hidden="true" /> {{ labels.quickViewLabel }}
    </button>

    <button
      v-if="props.isPurchasable"
      type="button"
      class="store-button store-button-primary flex-wrap px-2 text-sm"
      @click.stop="emit('add-to-cart', props.product)"
    >
      <ShoppingBag :size="16" aria-hidden="true" /> {{ labels.addLabel }}
    </button>

    <button v-else type="button" class="store-button" disabled>
      Unavailable
    </button>
  </div>
</template>
