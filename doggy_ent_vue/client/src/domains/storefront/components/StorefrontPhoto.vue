<script setup>
import { ref, watch } from 'vue'
import { ImageOff } from '@lucide/vue'
import { mediaImageSource } from '@shared/utils/mediaImage.js'

const props = defineProps({ image: String, alt: String, caption: String })
const failed = ref(false)
watch(() => props.image, () => { failed.value = false })
</script>

<template>
  <figure class="storefront-photo">
    <img v-if="image && !failed" :src="mediaImageSource(image)" :alt="alt" loading="lazy" decoding="async" @error="failed = true" />
    <div v-else class="storefront-photo-fallback" role="img" :aria-label="alt || 'Photo unavailable'">
      <ImageOff :size="24" aria-hidden="true" /><span>Photo unavailable</span>
    </div>
    <figcaption v-if="caption">{{ caption }}</figcaption>
  </figure>
</template>

<style scoped>
.storefront-photo { min-width: 0; margin: 0; overflow: hidden; border-radius: 8px; background: #fff; box-shadow: 0 8px 24px #293b3410; }
.storefront-photo img, .storefront-photo-fallback { display: block; width: 100%; aspect-ratio: var(--store-photo-ratio, 1.2); object-fit: cover; object-position: var(--store-photo-position, center); }
.storefront-photo-fallback { display: flex; align-items: center; justify-content: center; gap: 10px; background: #eef0e9; color: #59655e; font-size: 14px; }
.storefront-photo figcaption { padding: 10px 14px; color: #59655e; font-size: 12px; line-height: 1.5; overflow-wrap: anywhere; }
</style>
