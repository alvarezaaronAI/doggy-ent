<script setup>
import { mediaImageSource } from "@shared/utils/mediaImage.js";
defineProps({
  title: String,
  text: String,
  image: String,
  alt: String,
  caption: String,
  giving: Boolean,
});
</script>
<template>
  <component
    :is="image ? 'figure' : 'article'"
    class="story-card"
    :class="{ 'story-card-giving': giving }"
  >
    <template v-if="image"
      ><img :src="mediaImageSource(image)" :alt="alt" loading="lazy" />
      <figcaption v-if="caption">{{ caption }}</figcaption></template
    >
    <div v-else class="story-card-copy">
      <h3 v-if="title">{{ title }}</h3>
      <p v-if="text">{{ text }}</p>
      <slot />
    </div>
  </component>
</template>
<style>
.story-card {
  min-width: 0;
  overflow: hidden;
  border: 1px solid #dccdbb;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 5px 18px #6a3c2b10;
}
.story-card-giving {
  background: #edf6f0;
  border-color: #bdd5c7;
}
.story-card-copy {
  padding: 22px;
}
.story-card h3 {
  font-size: 18px;
  line-height: 1.4;
  font-weight: 650;
  color: var(--storefront-brand-4);
}
.story-card p {
  margin-top: 10px;
  color: var(--store-muted, #59655e);
  line-height: 1.7;
  font-size: 14px;
}
.story-card > img {
  display: block;
  width: 100%;
  aspect-ratio: 4/3;
  object-fit: cover;
}
.story-card figcaption {
  padding: 10px 14px;
  font-size: 12px;
  line-height: 1.5;
  color: var(--store-muted, #59655e);
}
.story-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
  align-items: stretch;
}
.story-grid-three {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}
.story-chapter {
  padding-top: 28px;
  margin-top: 36px;
  border-top: 1px solid #d9cbb9;
  min-width: 0;
}
@media (max-width: 620px) {
  .story-grid,
  .story-grid-three {
    grid-template-columns: minmax(0, 1fr);
  }
}
@container website-preview (max-width:620px) {
  .story-grid,
  .story-grid-three {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
