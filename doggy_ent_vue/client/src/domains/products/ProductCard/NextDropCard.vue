<script setup>
import { mediaImageSource } from "@shared/utils/mediaImage.js";
defineProps({ product: { type: Object, required: true } });
defineEmits(["preview"]);
</script>
<template>
  <article class="story-card next-drop-card">
    <img
      :src="mediaImageSource(product.image)"
      :alt="product.name"
      loading="lazy"
    />
    <div class="story-card-copy">
      <p class="store-eyebrow">Coming soon · sample concept</p>
      <h3>{{ product.name }}</h3>
      <p>{{ product.shortDescription }}</p>
      <p class="text-xs">No release date or subscription is promised.</p>
      <div class="mt-5 flex flex-wrap gap-2">
        <button
          type="button"
          class="store-button"
          @click="$emit('preview', product)"
        >
          Preview this drop</button
        ><button
          type="button"
          class="store-button"
          disabled
          title="Notifications are a future phase"
        >
          Notify me
        </button>
      </div>
    </div>
  </article>
</template>
<style scoped>
.next-drop-card > img {
  aspect-ratio: 1.8;
}
.next-drop-card .store-eyebrow {
  margin: 0 0 8px;
}
</style>
