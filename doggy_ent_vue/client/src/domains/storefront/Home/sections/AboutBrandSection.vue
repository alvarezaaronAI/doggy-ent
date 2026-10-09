<script setup>
import { ArrowRight } from '@lucide/vue'
import {
  BRAND_STORY,
  BRAND_STORY_PATH,
} from '@storefront/constants/brandContent.js'
</script>
<template>
  <section id="about" class="store-section">
    <div class="store-inner grid gap-8 md:grid-cols-2 md:items-center">
      <figure>
        <img
          class="home-photo aspect-[4/3] w-full rounded-lg object-cover"
          :src="BRAND_STORY.teaserImage"
          alt="An illustrative dog enjoying the outdoors"
          loading="lazy"
        />
        <figcaption class="store-muted mt-3 text-xs">
          Illustrative photo
        </figcaption>
      </figure>
      <div>
        <p class="store-eyebrow">Meet the brand</p>
        <h2 class="mt-3 text-3xl font-bold">Built from real life.</h2>
        <p
          v-for="paragraph in BRAND_STORY.paragraphs"
          :key="paragraph"
          class="store-muted mt-4 leading-relaxed"
        >
          {{ paragraph }}
        </p>
        <RouterLink :to="BRAND_STORY_PATH" class="store-button mt-6"
          >More about Chase &amp; Evie <ArrowRight :size="18"
        /></RouterLink>
      </div>
    </div>
  </section>
</template>
