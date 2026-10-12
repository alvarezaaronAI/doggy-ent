<script setup>
import { computed, inject } from 'vue'
import {
  ArrowRight,
  Bone,
  ClipboardCheck,
  Leaf,
  Package,
  ShoppingBag,
} from '@lucide/vue'
import StorefrontHero from '@storefront/components/StorefrontHero.vue'
import ContentLink from '@storefront/components/ContentLink.vue'
import { sectionSettings } from '@storefront-content/sectionCatalog.js'
import {
  BRAND_STORY,
} from '@storefront/constants/brandContent.js'
const props = defineProps({ product: { type: Object, default: null }, id: { type: String, default: 'hero' }, settings: { type: Object, default: () => sectionSettings('hero') } })
const sections = inject('storefrontSections', null)
const primaryDestination = computed(() => {
  if (props.settings.buttonUrl) return props.settings.buttonUrl
  if (!sections) return props.product ? '/#spotlight' : '/#shop'
  const target = (props.product && sections.value.find(block => block.visible && block.type === 'spotlight')) || sections.value.find(block => block.visible && block.type === 'collection')
  return target ? '/#' + target.id : ''
})
const tags = computed(() => props.settings.tags.length ? props.settings.tags : [
  'Small-batch',
  ...(Array.isArray(props.product?.tags)
    ? props.product.tags.filter((tag) => typeof tag === 'string').slice(0, 2)
    : ['Simple ingredients']),
])
</script>
<template>
  <StorefrontHero
    :id="id"
    :title="settings.title"
    :lead="settings.lead"
    :eyebrow="settings.eyebrow"
    :description="
      settings.text || product?.shortDescription ||
      'Good treats. Good company. Simple ingredients for the everyday moments you share.'
    "
    :image="settings.image || BRAND_STORY.heroImage"
    :image-alt="settings.imageAlt"
  >
    <template #eyebrow>
      <p v-if="settings.eyebrow" class="store-hero-eyebrow mb-2">{{ settings.eyebrow }}</p>
      <div class="home-hero-tags flex flex-wrap gap-2">
        <span v-for="(tag, index) in tags" :key="index">{{ tag }}</span>
      </div>
    </template>
    <ContentLink v-if="primaryDestination"
      :href="primaryDestination"
      class="store-button store-button-primary"
      ><Bone :size="20" />
      {{ settings.buttonLabel || (product ? 'Shop ' + product.name : 'Shop all treats') }}
      <ArrowRight :size="18"
    /></ContentLink>
    <ContentLink :href="settings.secondaryUrl" class="store-button home-hero-secondary"
      ><ClipboardCheck :size="18" /> {{ settings.secondaryLabel }}</ContentLink
    >
    <ContentLink v-if="settings.storyLabel" :href="settings.storyUrl" class="home-hero-story"
      >{{ settings.storyLabel }} <ArrowRight :size="18"
    /></ContentLink>
    <template #supporting>
      <nav
        class="home-hero-support grid grid-cols-3 gap-3"
        aria-label="Shopping essentials"
      >
        <ContentLink v-for="(item, index) in settings.items" :key="index" :href="item.href">
          <component :is="[ShoppingBag, Package, Leaf][index % 3]" :size="20" aria-hidden="true" /><span>{{ item.title }}</span>
        </ContentLink>
      </nav>
    </template>
  </StorefrontHero>
</template>
