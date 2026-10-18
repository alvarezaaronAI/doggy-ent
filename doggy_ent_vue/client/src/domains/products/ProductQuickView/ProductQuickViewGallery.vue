

<script setup>
import { mediaImageSource } from '@shared/utils/mediaImage.js'
import { computed, ref, watch } from 'vue'
import { Image } from '@lucide/vue'
import { productGallery } from '../utils/productGallery.js'
const props = defineProps({
  product: {
    type: Object,
    required: true,
  },
})
const images = computed(() => productGallery(props.product))
const selected = ref(0), failed = ref(false)
const current = computed(() => images.value[selected.value])
watch(images, () => { selected.value = 0; failed.value = false })
watch(selected, () => { failed.value = false })
</script>

<template>
  <div class="product-detail-gallery">
    <div v-if="images.length > 1" class="product-detail-thumbnails" role="group" aria-label="Product photographs">
      <button v-for="(item, index) in images" :key="item.image" type="button" :aria-pressed="selected === index" :aria-label="'View photograph ' + (index + 1) + ': ' + item.alt" @click="selected = index"><img :src="mediaImageSource(item.image)" alt="" loading="lazy" /></button>
    </div>
    <figure class="product-detail-main">
      <img v-if="current && !failed" :src="mediaImageSource(current.image)" :alt="current.alt" @error="failed = true" />
      <Image v-else :size="40" aria-label="Photograph unavailable" />
      <figcaption v-if="product.isTestProduct">Testing product · illustrative product photography · not for sale</figcaption>
    </figure>
  </div>
</template>
<style scoped>
.product-detail-gallery { display: grid; grid-template-columns: 64px minmax(0,1fr); gap: 12px; padding: 24px; align-content: start; background: #f8f5ee; }
.product-detail-gallery:not(:has(.product-detail-thumbnails)) { grid-template-columns: minmax(0,1fr); }
.product-detail-thumbnails { display: flex; flex-direction: column; gap: 8px; }
.product-detail-thumbnails button { width: 64px; height: 64px; padding: 3px; background: white; border: 1px solid #d4c4af; border-radius: 6px; }
.product-detail-thumbnails button[aria-pressed=true] { border: 2px solid var(--brand-1); }
.product-detail-thumbnails img { width: 100%; height: 100%; object-fit: cover; border-radius: 3px; }
.product-detail-main { min-width: 0; display: grid; place-items: center; align-content: start; }
.product-detail-main > img { width: 100%; aspect-ratio: 1; object-fit: cover; border-radius: 6px; box-shadow: 0 8px 24px #34210e12; }
figcaption { margin-top: 12px; color: #625b52; font-size: 11px; line-height: 1.6; }
@media(max-width:640px) { .product-detail-gallery { grid-template-columns: minmax(0,1fr); padding: 16px; } .product-detail-thumbnails { order: 1; flex-direction: row; flex-wrap: wrap; } .product-detail-thumbnails button { width: 52px; height: 52px; } }
</style>
