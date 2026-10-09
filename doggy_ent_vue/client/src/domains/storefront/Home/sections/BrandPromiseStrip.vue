<script setup>
import { Leaf, Flame, Heart, ArrowRight } from '@lucide/vue'
import { BRAND_VALUES } from '@storefront/constants/brandContent.js'
const icons = { leaf: Leaf, flame: Flame, heart: Heart }
</script>
<template>
  <nav class="home-promise-strip" aria-label="Our approach">
    <div class="store-inner grid gap-4 sm:grid-cols-3">
      <a v-for="value in BRAND_VALUES" :key="value.id" :href="'#' + value.id">
        <component :is="icons[value.icon]" :size="22" aria-hidden="true" />
        <span>{{ value.title }}</span
        ><ArrowRight :size="16" aria-hidden="true" />
      </a>
    </div>
  </nav>
</template>
