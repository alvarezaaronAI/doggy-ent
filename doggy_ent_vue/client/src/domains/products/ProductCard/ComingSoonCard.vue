<script setup>
import ProductCardImage from './ProductCardImage.vue'
import ProductCardInfo from './ProductCardInfo.vue'
import { Eye, Bell } from '@lucide/vue'
const props = defineProps({
  product: { type: Object, required: true },
  getDisplayTags: { type: Function, default: () => [] },
})
const emit = defineEmits(['preview'])
</script>
<template>
  <article class="store-product store-upcoming flex h-full flex-col">
    <ProductCardImage
      :product="product"
      @quick-view="emit('preview', product)"
    />
    <div class="flex flex-1 flex-col p-5">
      <ProductCardInfo
        :product="product"
        :tags="props.getDisplayTags(product)"
      />
      <div class="upcoming-notice mt-5">
        <p class="store-eyebrow">Coming Soon</p>
        <h4 class="mt-2 font-bold">This product is not available yet</h4>
        <p class="store-muted mt-2 text-sm leading-relaxed">
          Pricing, sizes, and launch details will be announced when this treat
          goes live.
        </p>
      </div>
      <div
        class="mt-auto flex flex-wrap items-center justify-between gap-3 pt-5"
      >
        <button
          type="button"
          class="store-button upcoming-preview"
          :aria-label="'View upcoming treat: ' + product.name"
          @click="emit('preview', product)"
        >
          <Eye :size="18" /> Preview
        </button>
        <button
          type="button"
          class="store-button store-button-primary"
          disabled
          :aria-describedby="'notify-help-' + product.id"
        >
          <Bell :size="18" /> Notify Me
        </button>
      </div>
      <p :id="'notify-help-' + product.id" class="store-muted mt-3 text-xs">
        Launch notifications: coming in a future phase.
      </p>
    </div>
  </article>
</template>

<style scoped>
.store-upcoming {
  border-color: #d8c6ab;
  box-shadow: 0 10px 28px rgba(67, 46, 27, 0.11);
}
.store-upcoming :deep(.store-eyebrow) {
  font-weight: 700;
  text-transform: uppercase;
}
.store-upcoming :deep(.store-product-tag) {
  border-radius: 999px;
  padding: 5px 12px;
  background: var(--brand-2);
  font-size: 12px;
  font-weight: 700;
}
.upcoming-notice {
  margin-inline: -20px;
  padding: 18px 20px;
  border-block: 1px solid #e6d9c3;
  background: #fbf5e6;
}
.upcoming-preview {
  border-color: var(--brand-1);
  color: var(--brand-1);
  background: white;
}
</style>
