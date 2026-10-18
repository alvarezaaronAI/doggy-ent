<script setup>
import { ref, watch } from 'vue'
import { mediaImageSource } from '@shared/utils/mediaImage.js'

const props = defineProps({
  title: { type: String, required: true },
  eyebrow: { type: String, default: '' },
  lead: { type: String, default: '' },
  description: { type: String, default: '' },
  image: { type: String, required: true },
  imageAlt: { type: String, required: true },
})
const imageFailed = ref(false)
watch(
  () => props.image,
  () => {
    imageFailed.value = false
  },
)
</script>

<template>
  <section
    class="store-hero"
    :class="{
      'store-hero-fallback': imageFailed,
    }"
  >
    <img
      v-if="!imageFailed"
      :src="mediaImageSource(image)"
      :alt="imageAlt"
      fetchpriority="high"
      decoding="async"
      @error="imageFailed = true"
    />
    <div class="store-hero-shade" aria-hidden="true"></div>
    <div class="store-hero-body">
      <div class="store-inner relative">
        <div class="store-hero-content">
          <slot name="eyebrow"
            ><p v-if="eyebrow" class="store-hero-eyebrow">
              {{ eyebrow }}
            </p></slot
          >
          <h1>{{ title }}</h1>
          <p v-if="lead" class="store-hero-lead">{{ lead }}</p>
          <p v-if="description" class="store-hero-description">
            {{ description }}
          </p>
          <div class="store-hero-actions"><slot /></div>
          <div v-if="$slots.supporting" class="store-hero-supporting">
            <slot name="supporting" />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.store-hero {
  position: relative;
  isolation: isolate;
  display: flex;
  align-items: center;
  min-height: 320px;
  padding-block: 46px;
  background: #304639;
  color: white;
}
.store-hero > img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: 75% top;
  z-index: -2;
}
.store-hero-shade {
  position: absolute;
  inset: 0;
  background: rgba(37, 42, 43, 0.48);
  z-index: -1;
}
.store-hero-fallback .store-hero-shade {
  display: none;
}
.store-hero-body {
  width: 100%;
}
.store-hero .store-inner {
  width: 100%;
  padding-block: 0;
}
.store-hero-content {
  max-width: 630px;
}
.store-hero-eyebrow {
  color: white;
  font-size: 12px;
  font-weight: 700;
}
h1 {
  margin-top: 16px;
  color: white;
  font-size: 38px;
  font-weight: 700;
  line-height: 1.18;
  overflow-wrap: anywhere;
  text-shadow: 0 2px 12px rgba(0, 0, 0, 0.4);
}
.store-hero-description {
  max-width: 500px;
  margin-top: 14px;
  color: white;
  font-size: 16px;
  line-height: 1.6;
  text-shadow: 0 1px 6px rgba(0, 0, 0, 0.6);
}
.store-hero-lead {
  margin-top: 16px;
  font-size: 21px;
  font-weight: 600;
}
.store-hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 26px;
}
.store-hero-supporting {
  margin-top: 24px;
}
@media (min-width: 1400px) {
  .store-hero > img { object-position: 65% 18%; }
}
@media (max-width: 639px) {
  .store-hero {
    min-height: 320px;
    padding-block: 32px;
  }
  .store-hero > img {
    object-position: 60% center;
  }
  h1 {
    font-size: 32px;
  }
  .store-hero-description {
    font-size: 16px;
  }
  .store-hero-actions {
    gap: 10px;
    margin-top: 22px;
  }
}
@media (max-height: 650px) {
  .store-hero {
    padding-block: 32px;
  }
}
</style>
