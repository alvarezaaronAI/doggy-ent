<script setup>
import { BRAND_GALLERY } from '@storefront/constants/brandContent.js'
</script>
<template>
  <section id="reviews" class="store-section">
    <div class="store-inner">
      <p class="store-eyebrow">Everyday adventures</p>
      <h2 class="mt-3 text-3xl font-bold">Happy Pups</h2>
      <p class="store-muted mt-3">Good treats. Even better company.</p>
      <div class="mt-7 grid gap-5 sm:grid-cols-2">
        <figure v-for="pup in BRAND_GALLERY" :key="pup.image">
          <img
            :src="pup.image"
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
        Illustrative gallery. Customer stories and verified reviews are coming
        in a future phase.
      </p>
    </div>
  </section>
</template>
