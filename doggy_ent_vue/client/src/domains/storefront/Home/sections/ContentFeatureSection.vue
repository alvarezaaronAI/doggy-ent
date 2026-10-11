<script setup>
import { mediaImageSource } from '@shared/utils/mediaImage.js'
import ContentLink from '@storefront/components/ContentLink.vue'
defineProps({ settings: { type: Object, required: true }, id: String, type: String })
</script>
<template>
  <section :id="id" class="store-section">
    <div class="store-inner" :class="{ 'grid gap-8 md:grid-cols-2 md:items-center': type === 'story' && settings.image }">
      <img v-if="settings.image" :src="mediaImageSource(settings.image)" :alt="settings.imageAlt" class="home-photo aspect-[4/3] w-full rounded-lg object-cover" loading="lazy" />
      <div class="min-w-0">
        <p v-if="settings.eyebrow" class="store-eyebrow">{{ settings.eyebrow }}</p>
        <h2 class="mt-3 text-3xl font-bold">{{ settings.title }}</h2>
        <p v-if="settings.text" class="store-muted mt-4 whitespace-pre-line leading-relaxed">{{ settings.text }}</p>
        <ContentLink v-if="settings.buttonLabel && settings.buttonUrl" :href="settings.buttonUrl" class="store-button store-button-primary mt-6">{{ settings.buttonLabel }}</ContentLink>
      </div>
    </div>
  </section>
</template>
