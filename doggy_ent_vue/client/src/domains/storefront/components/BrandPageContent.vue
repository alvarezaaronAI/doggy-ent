<script setup>
import { computed } from 'vue'
import { ArrowRight, Heart, Leaf, PackageCheck } from '@lucide/vue'
import { pagePresentation, PRESENTATION_COLORS } from '@storefront-content/pagePresentation.js'
import { useStorefrontContent } from '../composables/useStorefrontContent.js'
import { BRAND_IMAGES, BRAND_VALUES } from '../constants/brandContent.js'
import StorefrontHero from './StorefrontHero.vue'
import StorefrontPhoto from './StorefrontPhoto.vue'
import BrandPortraitPanel from './BrandPortraitPanel.vue'

const props = defineProps({ content: Object, preview: Boolean })
const { content: published } = useStorefrontContent()
const settings = computed(() => pagePresentation(props.content || published.value).brand)
const paragraphs = computed(() => settings.value.story.split(/\n\s*\n/).filter(text => text.trim()))
const icons = { ingredients: Leaf, process: PackageCheck, about: Heart }
const background = computed(() => settings.value.background === 'white' ? '#fbf9f3' : PRESENTATION_COLORS[settings.value.background])
</script>

<template>
  <div class="store-brand brand-page-content storybook-brand store-pattern" :style="{ backgroundColor: background }">
    <StorefrontHero class="storybook-hero" :title="settings.title" eyebrow="The pair behind the name" :description="settings.introduction" :image="settings.heroImage || BRAND_IMAGES.adventure" :image-alt="settings.heroAlt">
      <a href="#brand-pair" class="store-button store-button-primary" :inert="preview">Meet the pair <ArrowRight :size="17" /></a>
    </StorefrontHero>
    <section class="store-inner storybook-origin">
      <header><p class="storybook-eyebrow">Before the brand</p><h2>{{ settings.storyTitle }}</h2></header>
      <div class="storybook-copy"><p v-for="(paragraph, index) in paragraphs" :key="index">{{ paragraph }}</p></div>
    </section>
    <BrandPortraitPanel :portraits="settings.portraits" :title="settings.pairTitle" />
    <section class="store-inner">
      <header class="storybook-heading-row"><div><p class="storybook-eyebrow">Our beginning</p><h2>{{ settings.journeyTitle }}</h2></div><p>Short chapters for the moments that brought the brand to life.</p></header>
      <ol class="storybook-path grid gap-6 sm:grid-cols-3">
        <li v-for="(chapter, index) in settings.journey" :key="index"><span>{{ String(index + 1).padStart(2, '0') }}</span><h3>{{ chapter.title }}</h3><p>{{ chapter.text }}</p></li>
      </ol>
      <p class="storybook-note">Suggested story prompt, not a verified milestone. Replace these chapters with your real story.</p>
    </section>
    <section class="store-inner storybook-moments">
      <StorefrontPhoto :image="BRAND_IMAGES.adventure" alt="Illustrative black and yellow Labradors on a woodland walk" caption="Everyday moments · illustrative photo, not the real Chase & Evie" />
      <div><p class="storybook-eyebrow">Away from the treat bag</p><h2>{{ settings.galleryTitle }}</h2><p class="storybook-copy">Room for the muddy walks, quiet afternoons, and ordinary moments that make them themselves.</p><p class="storybook-note">A space for your real photos and memories.</p></div>
    </section>
    <section class="storybook-values">
      <div class="store-inner storybook-values-layout">
        <header><p class="storybook-eyebrow">Our approach</p><h2>{{ settings.valuesTitle }}</h2><p class="storybook-copy">Thoughtful ingredients, small batches, and good company.</p></header>
        <div class="grid gap-6"><div v-for="value in BRAND_VALUES" :key="value.id" class="storybook-value"><component :is="icons[value.id]" :size="22" aria-hidden="true" /><div><h3>{{ value.title }}</h3><p>{{ value.text }}</p></div></div></div>
      </div>
    </section>
    <section class="store-inner storybook-closing"><div><p class="storybook-eyebrow">Good treats. Good company.</p><h2>{{ settings.closingTitle }}</h2></div><RouterLink to="/#shop" class="store-button store-button-primary" :inert="preview">Explore the treats <ArrowRight :size="17" /></RouterLink></section>
  </div>
</template>

<style scoped src="../styles/brandPage.css"></style>
