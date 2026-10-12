<script setup>
import { Leaf, Flame, Package } from '@lucide/vue'
import { sectionSettings } from '@storefront-content/sectionCatalog.js'
defineProps({ id: { type: String, default: 'process' }, settings: { type: Object, default: () => sectionSettings('process') } })
const icons = [Leaf, Flame, Package]
</script>
<template>
  <section :id="id" class="store-section">
    <div class="store-inner">
      <p class="store-eyebrow">{{ settings.eyebrow }}</p>
      <h2 class="mt-3 text-3xl font-bold">{{ settings.title }}</h2>
      <p class="store-muted mt-3">
        {{ settings.text }}
      </p>
      <div class="mt-8 grid gap-8 md:grid-cols-3">
        <div
          v-for="(step, index) in settings.items"
          :key="index"
          class="home-process-step"
        >
          <component
            :is="icons[index % icons.length]"
            :size="28"
            class="text-[#17664d]"
            aria-hidden="true"
          />
          <p class="store-muted mt-4 text-xs">0{{ index + 1 }}</p>
          <h3 class="mt-2 text-lg font-bold">{{ step.title }}</h3>
          <p class="store-muted mt-3 leading-relaxed">{{ step.text }}</p>
        </div>
      </div>
    </div>
  </section>
</template>
