<script setup>
import { mediaImageSource } from '@shared/utils/mediaImage.js'
import { ArrowRight } from '@lucide/vue'
import { sectionSettings } from '@storefront-content/sectionCatalog.js'
import ContentLink from '@storefront/components/ContentLink.vue'
import {
  BRAND_STORY,
} from '@storefront/constants/brandContent.js'
defineProps({ id: { type: String, default: 'about' }, settings: { type: Object, default: () => sectionSettings('brand') } })
</script>
<template>
  <section :id="id" class="store-section">
    <div class="store-inner grid gap-8 md:grid-cols-2 md:items-center">
      <figure>
        <img
          class="home-photo aspect-[4/3] w-full rounded-lg object-cover"
          :src="mediaImageSource(settings.image || BRAND_STORY.teaserImage)"
          :alt="settings.imageAlt"
          loading="lazy"
        />
        <figcaption class="store-muted mt-3 text-xs">
          {{ settings.caption }}
        </figcaption>
      </figure>
      <div>
        <p class="store-eyebrow">{{ settings.eyebrow }}</p>
        <h2 class="mt-3 text-3xl font-bold">{{ settings.title }}</h2>
        <p
          v-for="paragraph in settings.text.split(/\n\s*\n/)"
          :key="paragraph"
          class="store-muted mt-4 leading-relaxed"
        >
          {{ paragraph }}
        </p>
        <ContentLink :href="settings.buttonUrl" class="store-button mt-6"
          >{{ settings.buttonLabel }} <ArrowRight :size="18"
        /></ContentLink>
      </div>
    </div>
  </section>
</template>
