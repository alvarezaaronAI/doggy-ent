<script setup>
import { mediaImageSource } from '@shared/utils/mediaImage.js'
import { BRAND_GALLERY } from '@storefront/constants/brandContent.js'
import { sectionSettings } from '@storefront-content/sectionCatalog.js'
import { computed } from 'vue'
const props = defineProps({ id: { type: String, default: 'reviews' }, settings: { type: Object, default: () => sectionSettings('gallery') } })
const gallery = computed(() => props.settings.items.length ? props.settings.items.map(item => ({ image: item.image, alt: item.alt, caption: item.text })) : BRAND_GALLERY)
</script>
<template>
  <section :id="id" class="store-section">
    <div class="store-inner">
      <p class="store-eyebrow">{{ settings.eyebrow }}</p>
      <h2 class="mt-3 text-3xl font-bold">{{ settings.title }}</h2>
      <p class="store-muted mt-3">{{ settings.text }}</p>
      <div class="mt-7 grid gap-5 sm:grid-cols-2">
        <figure v-for="(pup, index) in gallery" :key="index">
          <img
            :src="mediaImageSource(pup.image)"
            :alt="pup.alt"
            class="home-photo aspect-[4/3] w-full rounded-lg object-cover"
            loading="lazy"
          />
          <figcaption class="store-muted mt-3 text-sm">
            {{ pup.caption }}
          </figcaption>
        </figure>
      </div>
      <p class="store-muted mt-6 text-sm">
        {{ settings.caption }}
      </p>
    </div>
  </section>
</template>
