<script setup>
import { computed } from 'vue'
import {
  ArrowRight,
  Bone,
  ClipboardCheck,
  Leaf,
  Package,
  ShoppingBag,
} from '@lucide/vue'
import StorefrontHero from '@storefront/components/StorefrontHero.vue'
import {
  BRAND_STORY,
  BRAND_STORY_PATH,
} from '@storefront/constants/brandContent.js'
const props = defineProps({ product: { type: Object, default: null } })
const tags = computed(() => [
  'Small-batch',
  ...(Array.isArray(props.product?.tags)
    ? props.product.tags.filter((tag) => typeof tag === 'string').slice(0, 2)
    : ['Simple ingredients']),
])
</script>
<template>
  <StorefrontHero
    id="hero"
    title="Small-Batch Dog Treats"
    lead="Good treats. Good company."
    eyebrow="Small-batch dog treats"
    :description="
      product?.shortDescription ||
      'Good treats. Good company. Simple ingredients for the everyday moments you share.'
    "
    :image="BRAND_STORY.heroImage"
    image-alt="An illustrative dog enjoying the outdoors"
  >
    <template #eyebrow>
      <div class="home-hero-tags flex flex-wrap gap-2">
        <span v-for="tag in tags" :key="tag">{{ tag }}</span>
      </div>
    </template>
    <a
      :href="product ? '#spotlight' : '#shop'"
      class="store-button store-button-primary"
      ><Bone :size="20" />
      {{ product ? 'Shop ' + product.name : 'Shop all treats' }}
      <ArrowRight :size="18"
    /></a>
    <a href="#ingredients" class="store-button home-hero-secondary"
      ><ClipboardCheck :size="18" /> See ingredients</a
    >
    <RouterLink :to="BRAND_STORY_PATH" class="home-hero-story"
      >Meet Chase &amp; Evie <ArrowRight :size="18"
    /></RouterLink>
    <template #supporting>
      <nav
        class="home-hero-support grid grid-cols-3 gap-3"
        aria-label="Shopping essentials"
      >
        <a href="#shop"
          ><ShoppingBag :size="20" aria-hidden="true" /><span
            >Guest checkout</span
          ></a
        >
        <a href="#process"
          ><Package :size="20" aria-hidden="true" /><span
            >Made with care</span
          ></a
        >
        <a href="#ingredients"
          ><Leaf :size="20" aria-hidden="true" /><span
            >Ingredient details</span
          ></a
        >
      </nav>
    </template>
  </StorefrontHero>
</template>
