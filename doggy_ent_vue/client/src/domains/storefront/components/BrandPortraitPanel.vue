<script setup>
import { computed, ref, watch } from 'vue'
import { Camera } from '@lucide/vue'
import { PAGE_PRESENTATION } from '@storefront-content/pagePresentation.js'
import { BRAND_STORY } from '../constants/brandContent.js'
import StorefrontPhoto from './StorefrontPhoto.vue'

const props = defineProps({ portraits: { type: Array, required: true }, title: String })
const selectedIndex = ref(0)
watch(() => props.portraits.length, length => { if (selectedIndex.value >= length) selectedIndex.value = 0 })
const portrait = computed(() => props.portraits[selectedIndex.value])
const image = computed(() => portrait.value?.image || BRAND_STORY.portraits[selectedIndex.value]?.image)
const sampleCopy = computed(() => PAGE_PRESENTATION.brand.portraits.some(item => item.text === portrait.value?.text))
</script>

<template>
  <section v-if="portrait" id="brand-pair" class="store-inner storybook-portraits">
    <StorefrontPhoto :image="image" :alt="portrait.alt" :caption="portrait.image ? portrait.name : 'Portrait templates · real Chase & Evie photos to follow'" />
    <div class="min-w-0">
      <h2 class="storybook-eyebrow">{{ title }}</h2>
      <div class="portrait-choices" role="group" aria-label="Choose a portrait">
        <button v-for="(item, index) in portraits" :key="index" type="button" class="store-button" :aria-pressed="selectedIndex === index" @click="selectedIndex = index">{{ item.name }}</button>
      </div>
      <div aria-live="polite" aria-atomic="true">
        <h3>{{ portrait.name }}</h3>
        <p class="portrait-tagline">{{ portrait.tagline }}</p>
        <p class="storybook-copy">{{ portrait.text }}</p>
      </div>
      <div class="portrait-detail"><Camera :size="19" aria-hidden="true" /><p><strong>The little things worth remembering.</strong>A favourite walk, a familiar habit, a personality all their own.</p></div>
      <p v-if="sampleCopy" class="storybook-note">Suggested personality copy, not a verified biography.</p>
    </div>
  </section>
</template>

<style scoped>
.storybook-portraits { display: grid; grid-template-columns: minmax(0, 1.05fr) minmax(0, 1fr); align-items: center; gap: 34px; --store-photo-ratio: 1.13; --store-photo-position: 50% 35%; }
.portrait-choices { display: flex; gap: 8px; flex-wrap: wrap; margin: 0 0 24px; }
.portrait-choices button { min-width: 90px; }
.portrait-choices button[aria-pressed='true'] { background: var(--brand-2); color: var(--brand-4); border-color: var(--brand-1); }
h3 { color: var(--brand-4); font-size: 26px; line-height: 1.3; font-weight: 650; overflow-wrap: anywhere; }
.portrait-tagline { margin-top: 9px; color: var(--brand-1); font-weight: 600; }
.portrait-detail { display: flex; align-items: flex-start; gap: 10px; margin-top: 20px; padding-top: 18px; border-top: 1px solid var(--store-line); font-size: 14px; color: var(--store-muted); }
.portrait-detail svg { flex-shrink: 0; }
.portrait-detail strong { display: block; color: var(--store-ink); margin-bottom: 4px; }
@media (max-width: 700px) { .storybook-portraits { grid-template-columns: minmax(0, 1fr); gap: 24px; --store-photo-ratio: 1.25; } }
@container website-preview (max-width:700px) { .storybook-portraits { grid-template-columns: minmax(0, 1fr); gap: 24px; --store-photo-ratio: 1.25; } }
</style>
