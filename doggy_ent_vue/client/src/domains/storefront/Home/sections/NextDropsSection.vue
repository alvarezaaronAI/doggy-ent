<script setup>
import { ArrowRight, Package } from '@lucide/vue'
import ComingSoonCard from '@products/ProductCard/ComingSoonCard.vue'
defineProps({
  products: { type: Array, default: () => [] },
  getDisplayTags: { type: Function, required: true },
  loading: { type: Boolean, default: false },
  error: { type: String, default: '' },
})
defineEmits(['preview', 'retry'])
</script>
<template>
  <section id="coming-soon" class="store-section">
    <div class="store-inner home-next-drops">
      <div class="home-drop-intro">
        <p class="store-eyebrow">Something to look forward to</p>
        <h2 class="mt-3 text-3xl font-bold">Next Drops</h2>
        <p class="store-muted mt-5 leading-relaxed">
          A look at what we're working on. Availability and launch details will
          appear here when they're ready.
        </p>
        <a href="#shop" class="store-button mt-6"
          >Shop today's treats <ArrowRight :size="18"
        /></a>
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
