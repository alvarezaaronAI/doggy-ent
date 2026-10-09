<script setup>
import { ref } from 'vue'
import { ArrowRight, Leaf, Flame, Heart, PawPrint } from '@lucide/vue'
import {
  BRAND_STORY,
  BRAND_VALUES,
} from '@storefront/constants/brandContent.js'
const icons = { leaf: Leaf, flame: Flame, heart: Heart }
const failedPortraits = ref({})
</script>

<template>
  <section class="store-section brand-origin">
    <div class="store-inner grid gap-8 md:grid-cols-2 md:gap-16">
      <div>
        <p class="store-eyebrow">Our beginning</p>
        <h2 class="brand-heading">Two dogs. A simple idea.</h2>
      </div>
      <div class="brand-story-copy">
        <p v-for="paragraph in BRAND_STORY.paragraphs" :key="paragraph">
          {{ paragraph }}
        </p>
      </div>
    </div>
  </section>

  <section id="brand-pair" class="store-section brand-pair">
    <div class="store-inner">
      <p class="store-eyebrow">The inspiration</p>
      <h2 class="brand-heading">Meet the pair behind the name.</h2>
      <div class="mt-8 grid gap-8 sm:grid-cols-2">
        <figure v-for="portrait in BRAND_STORY.portraits" :key="portrait.name">
          <div class="brand-portrait">
            <img
              v-if="!failedPortraits[portrait.name]"
              :src="portrait.image"
              :alt="portrait.alt"
              loading="lazy"
              @error="failedPortraits[portrait.name] = true"
            />
            <PawPrint v-else :size="48" aria-hidden="true" />
          </div>
          <figcaption
            class="mt-5 flex flex-wrap items-center justify-between gap-3"
          >
            <h3 class="text-2xl font-bold">{{ portrait.name }}</h3>
            <span class="brand-photo-label">Illustrative photo</span>
          </figcaption>
        </figure>
      </div>
      <p class="store-muted mt-6 text-sm">
        Template photography for now. Real portraits of Chase and Evie will
        follow.
      </p>
    </div>
  </section>

  <section class="store-section brand-values">
    <div class="store-inner">
      <p class="store-eyebrow">What matters to us</p>
      <h2 class="brand-heading">Keep the good things simple.</h2>
      <div class="mt-8 grid gap-8 md:grid-cols-3">
        <div v-for="value in BRAND_VALUES" :key="value.id" class="brand-value">
          <component :is="icons[value.icon]" :size="28" aria-hidden="true" />
          <h3 class="mt-5 text-xl font-bold">{{ value.title }}</h3>
          <p class="store-muted mt-3 leading-relaxed">{{ value.text }}</p>
        </div>
      </div>
    </div>
  </section>

  <section class="brand-invitation">
    <div class="store-inner flex flex-wrap items-center justify-between gap-8">
      <div>
        <p class="store-eyebrow">For you and your pup</p>
        <h2 class="brand-heading">Good treats. Good company.</h2>
      </div>
      <div class="flex flex-wrap gap-3">
        <RouterLink
          :to="{ path: '/', hash: '#shop' }"
          class="store-button store-button-primary"
          >Explore the treats <ArrowRight :size="18"
        /></RouterLink>
        <RouterLink
          :to="{ path: '/', hash: '#ingredients' }"
          class="store-button"
          >Our ingredient promise</RouterLink
        >
      </div>
    </div>
  </section>
</template>
