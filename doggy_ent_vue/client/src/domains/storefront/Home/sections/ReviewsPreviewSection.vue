<script setup>
import { mediaImageSource } from '@shared/utils/mediaImage.js'
import { BRAND_GALLERY } from '@storefront/constants/brandContent.js'
import { sectionSettings } from '@storefront-content/sectionCatalog.js'
import { computed, ref } from 'vue'
import { Star, MessageCircle, Pencil, ArrowLeft, ArrowRight, Pause, Play } from '@lucide/vue'
import { SAMPLE_REVIEWS } from '../../constants/sampleReviews.js'
import { useReviewCarousel } from '../../composables/useReviewCarousel.js'
import ContentLink from '../../components/ContentLink.vue'
const props = defineProps({ id: { type: String, default: 'reviews' }, settings: { type: Object, default: () => sectionSettings('gallery') }, autoplay: { type: Boolean, default: true } })
const gallery = computed(() => props.settings.items.length ? props.settings.items.map(item => ({ image: item.image, alt: item.alt, caption: item.text })) : BRAND_GALLERY)
const reviewPhotos = import.meta.glob('/src/assets/images/brand/galleries/*-texture-v1.webp', { eager: true, import: 'default' })
const reviewKeys = ['chicken', 'beef', 'training', 'salmon', 'bundle', 'pumpkin', 'turkey']
const track = ref(null)
const { paused, reduced, overflowing, rotating, start, end, hovering, pause, step, measure, focusIn, focusOut } = useReviewCarousel(
  track, computed(() => SAMPLE_REVIEWS.length), computed(() => props.autoplay && props.settings.sampleReviews),
)
</script>
<template>
  <section :id="id" class="store-section">
    <div class="store-inner">
      <header class="home-review-heading story-heading"><div class="story-heading-copy"><p v-if="settings.eyebrow" class="store-eyebrow">{{ settings.eyebrow }}</p>
      <h2 class="mt-3 text-3xl font-bold">{{ settings.title }}</h2>
      <p class="store-muted mt-3">{{ settings.text }}</p></div><button v-if="settings.sampleReviews" type="button" class="store-button" disabled title="Customer review submission is coming in a future phase"><Pencil :size="16" />Write a review</button></header>
      <div v-if="settings.sampleReviews" class="home-review-carousel" role="region" aria-roledescription="carousel" aria-label="Sample product reviews" @mouseenter="hovering = true" @mouseleave="hovering = false" @focusin="focusIn" @focusout="focusOut">
        <div class="home-review-toolbar">
          <p class="home-review-sample-note" role="note">Sample reviews · fictional examples, not customer submissions</p>
          <div v-if="overflowing" class="home-review-controls" role="group" aria-label="Review navigation">
            <button type="button" class="store-button home-review-control" aria-label="Previous reviews" title="Previous reviews" :aria-controls="id + '-review-track'" @click="step(-1)"><ArrowLeft :size="18" aria-hidden="true" /></button>
            <button type="button" class="store-button home-review-control" :aria-label="paused ? 'Start review rotation' : 'Pause review rotation'" :title="reduced ? 'Automatic rotation is off for reduced motion' : paused ? 'Start review rotation' : 'Pause review rotation'" :aria-pressed="paused" :disabled="reduced || !autoplay" @click="paused = !paused"><component :is="paused ? Play : Pause" :size="17" aria-hidden="true" /></button>
            <button type="button" class="store-button home-review-control" aria-label="Next reviews" title="Next reviews" :aria-controls="id + '-review-track'" @click="step(1)"><ArrowRight :size="18" aria-hidden="true" /></button>
          </div>
        </div>
        <div :id="id + '-review-track'" ref="track" class="home-reviews-track" role="list" aria-label="Fictional product review examples" :tabindex="overflowing ? 0 : undefined" @scroll.passive="measure" @pointerdown="pause">
          <article v-for="(review, index) in SAMPLE_REVIEWS" :key="review.name" class="home-review" role="listitem" :aria-label="'Sample review ' + (index + 1) + ' of ' + SAMPLE_REVIEWS.length">
            <div class="flex gap-1 text-[#976918]" role="img" :aria-label="review.rating + ' out of 5 stars, fictional rating'"><Star v-for="star in review.rating" :key="star" :size="17" class="fill-[var(--brand-2)]" /></div>
            <h3 class="mt-4 font-semibold">{{ review.title }}</h3><p class="mt-3">{{ review.text }}</p>
            <div class="home-review-author"><strong>{{ review.name }}</strong><time :datetime="review.date">{{ review.date }}</time></div>
            <div class="home-review-photo"><img :src="reviewPhotos['/src/assets/images/brand/galleries/' + reviewKeys[index] + '-texture-v1.webp']" :alt="review.product + ' illustrative texture template'" loading="lazy" /><div><p class="store-muted text-sm">{{ review.product }} · {{ review.size }}</p><p class="store-muted mt-1 text-xs">Fictional review · sample only</p></div></div>
          </article>
        </div>
        <p class="home-review-position store-muted" :aria-live="rotating ? 'off' : 'polite'">{{ start }}–{{ end }} of {{ SAMPLE_REVIEWS.length }} sample reviews</p>
        <aside class="home-review-future"><MessageCircle :size="22" aria-hidden="true" /><div><h3>Your next chapter</h3><p class="store-muted">A future place for honest customer experiences, product photos and helpful feedback.</p><p class="store-muted text-xs">Customer reviews · coming in future phase</p></div><ContentLink href="/#shop" class="store-button">Explore the treats</ContentLink></aside>
      </div>
      <div v-else class="mt-7 grid gap-5 sm:grid-cols-2">
        <figure v-for="(pup, index) in gallery" :key="index">
          <img
            :src="mediaImageSource(pup.image)"
            :alt="pup.alt"
            class="home-photo aspect-[4/3] w-full rounded-lg object-cover"
            loading="lazy"
          />
          <figcaption class="store-muted mt-3 text-sm">
            {{ pup.caption }}
          </figcaption>
        </figure>
      </div>
      <p class="store-muted mt-6 text-sm">
        {{ settings.caption }}
      </p>
    </div>
  </section>
</template>
