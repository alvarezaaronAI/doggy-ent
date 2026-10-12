<script setup>
import { ArrowRight, Package } from '@lucide/vue'
import ComingSoonCard from '@products/ProductCard/ComingSoonCard.vue'
import ContentLink from '@storefront/components/ContentLink.vue'
import { sectionSettings } from '@storefront-content/sectionCatalog.js'
defineProps({
  products: { type: Array, default: () => [] },
  getDisplayTags: { type: Function, required: true },
  loading: { type: Boolean, default: false },
  error: { type: String, default: '' },
  id: { type: String, default: 'coming-soon' },
  settings: { type: Object, default: () => sectionSettings('drops') },
})
defineEmits(['preview', 'retry'])
</script>
<template>
  <section :id="id" class="store-section">
    <div class="store-inner home-next-drops">
      <div class="home-drop-intro">
        <p class="store-eyebrow">{{ settings.eyebrow }}</p>
        <h2 class="mt-3 text-3xl font-bold">{{ settings.title }}</h2>
        <p class="store-muted mt-5 leading-relaxed">
          {{ settings.text }}
        </p>
        <ContentLink :href="settings.buttonUrl" class="store-button mt-6"
          >{{ settings.buttonLabel }} <ArrowRight :size="18"
        /></ContentLink>
      </div>
      <div v-if="loading" class="store-muted" role="status">
        Loading upcoming treats...
      </div>
      <div v-else-if="error" role="alert">
        <p>{{ error }}</p>
        <button type="button" class="store-button mt-4" @click="$emit('retry')">
          Try again
        </button>
      </div>
      <div v-else-if="products.length" class="home-drop-grid">
        <ComingSoonCard
          v-for="product in products"
          :key="product.id"
          :product="product"
          :get-display-tags="getDisplayTags"
          @preview="$emit('preview', $event)"
        />
      </div>
      <div v-else class="home-drop-empty">
        <Package :size="30" aria-hidden="true" />
        <h3 class="mt-4 text-xl font-semibold">
          More good things are on the way.
        </h3>
        <p class="store-muted mt-3">
          Check back for our next drop. In the meantime, explore the treats
          available today.
        </p>
      </div>
    </div>
  </section>
</template>
