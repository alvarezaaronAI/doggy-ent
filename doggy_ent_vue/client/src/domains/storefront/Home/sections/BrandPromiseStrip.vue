<script setup>
import { Leaf, Flame, Heart, ArrowRight } from '@lucide/vue'
import { sectionSettings } from '@storefront-content/sectionCatalog.js'
import ContentLink from '@storefront/components/ContentLink.vue'
defineProps({ id: { type: String, default: 'promise' }, settings: { type: Object, default: () => sectionSettings('promise') } })
const icons = [Leaf, Flame, Heart]
</script>
<template>
  <nav :id="id" class="home-promise-strip" aria-label="Our approach">
    <div class="store-inner grid gap-4 sm:grid-cols-3">
      <ContentLink v-for="(value, index) in settings.items" :key="index" :href="value.href">
        <component :is="icons[index % icons.length]" :size="22" aria-hidden="true" />
        <span>{{ value.title }}</span
        ><ArrowRight :size="16" aria-hidden="true" />
      </ContentLink>
    </div>
  </nav>
</template>
