<script setup>
import { sectionSettings } from '@storefront-content/sectionCatalog.js'
defineProps({ id: { type: String, default: 'faq' }, settings: { type: Object, default: () => sectionSettings('help') } })
</script>
<template>
  <section :id="id" class="store-section bg-[#f8faf8]">
    <div class="store-inner">
      <p class="store-eyebrow">{{ settings.eyebrow }}</p>
      <h2 class="mt-3 text-3xl font-bold">{{ settings.title }}</h2>
      <div class="mt-6 grid gap-6 md:grid-cols-3">
        <div v-for="(item, index) in settings.items" :key="index">
          <h3 class="font-bold">{{ item.title }}</h3>
          <p class="store-muted mt-3 text-sm leading-relaxed">{{ item.text }}</p>
        </div>
      </div>
    </div>
  </section>
</template>
