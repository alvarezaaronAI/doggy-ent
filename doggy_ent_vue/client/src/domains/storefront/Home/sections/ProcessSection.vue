<script setup>
import { ArrowUpRight, Heart } from '@lucide/vue'
import { sectionSettings } from '@storefront-content/sectionCatalog.js'
import { BRAND_IMAGES } from '../../constants/brandContent.js'
import { mediaImageSource } from '@shared/utils/mediaImage.js'
import ContentLink from '../../components/ContentLink.vue'
defineProps({ id: { type: String, default: 'process' }, settings: { type: Object, default: () => sectionSettings('process') } })
</script>
<template>
  <section :id="id" class="store-section home-care-section">
    <div class="store-inner home-care-layout">
      <figure class="home-care-photo">
        <div class="relative">
          <img :src="mediaImageSource(settings.image || BRAND_IMAGES.preparation)" :alt="settings.imageAlt" loading="lazy" />
          <span class="home-care-photo-label">Small batches. Thoughtful details.</span>
        </div>
        <figcaption v-if="!settings.image">Illustrative preparation photo, not the actual kitchen.</figcaption>
      </figure>
      <div class="home-care-copy">
        <header class="story-heading home-boutique-heading">
          <p v-if="settings.eyebrow" class="store-eyebrow flex items-center gap-2"><Heart :size="15" aria-hidden="true" />{{ settings.eyebrow }}</p>
          <h2>{{ settings.title }}</h2>
          <p>{{ settings.text }}</p>
        </header>
        <ol class="home-process-list">
          <li v-for="(step, index) in settings.items" :key="index" class="home-process-step">
            <span class="home-process-number" aria-hidden="true">{{ String(index + 1).padStart(2, '0') }}</span>
            <div><h3>{{ step.title }}</h3><p>{{ step.text }}</p></div>
          </li>
        </ol>
        <ContentLink href="/meet-chase-evie" class="home-boutique-link">Our process <ArrowUpRight :size="17" aria-hidden="true" /></ContentLink>
      </div>
    </div>
  </section>
</template>
