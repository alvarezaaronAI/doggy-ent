<script setup>
import { ArrowUpRight } from "@lucide/vue";
import { sectionSettings } from "@storefront-content/sectionCatalog.js";
import ContentLink from "@storefront/components/ContentLink.vue";
import { BRAND_IMAGES } from "@storefront/constants/brandContent.js";
import { mediaImageSource } from "@shared/utils/mediaImage.js";
defineProps({
  id: { type: String, default: "about" },
  settings: { type: Object, default: () => sectionSettings("brand") },
});
</script>
<template>
  <section :id="id" class="store-section home-brand-section">
    <div class="store-inner home-brand-layout">
      <figure class="home-brand-photo">
        <img :src="mediaImageSource(settings.image || BRAND_IMAGES.adventure)" :alt="settings.imageAlt" loading="lazy" />
        <figcaption v-if="settings.caption">{{ settings.caption }}</figcaption>
      </figure>
      <div class="home-brand-copy">
      <header class="story-heading home-boutique-heading">
        <p class="store-eyebrow">{{ settings.eyebrow || 'The pair behind the name' }}</p>
        <h2>{{ settings.title }}</h2>
        <p
          v-for="paragraph in settings.text.split(/\n\s*\n/)"
          :key="paragraph"
        >
          {{ paragraph }}
        </p>
      </header>
      <ContentLink :href="settings.buttonUrl" class="home-boutique-link">{{ settings.buttonLabel }} <ArrowUpRight :size="17" aria-hidden="true" /></ContentLink>
      </div>
    </div>
  </section>
</template>
