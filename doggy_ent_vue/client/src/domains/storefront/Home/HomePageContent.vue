<script setup>
import { computed, provide } from 'vue'
import { Pencil } from '@lucide/vue'
import HeroSection from './sections/HeroSection.vue'
import BrandPromiseStrip from './sections/BrandPromiseStrip.vue'
import ProductSpotlightSection from './sections/ProductSpotlightSection.vue'
import ProductCollectionSection from './sections/ProductCollectionSection.vue'
import NextDropsSection from './sections/NextDropsSection.vue'
import ReviewsPreviewSection from './sections/ReviewsPreviewSection.vue'
import ProcessSection from './sections/ProcessSection.vue'
import IngredientsAnalysisSection from './sections/IngredientsAnalysisSection.vue'
import AboutBrandSection from './sections/AboutBrandSection.vue'
import ShopHelpSection from './sections/ShopHelpSection.vue'
import ContentFeatureSection from './sections/ContentFeatureSection.vue'
import GivingSpotlightSection from './sections/GivingSpotlightSection.vue'
import { SECTION_CATALOG } from '@storefront-content/sectionCatalog.js'
import { getHomeFeaturedProduct, resolveSectionSettings, sectionBackground } from '../utils/homeContent.js'
import { mediaImageSource } from '@shared/utils/mediaImage.js'
const props = defineProps({ content: { type: Object, required: true }, context: { type: Object, required: true }, editable: Boolean, activeSection: String, changedSections: { type: Array, default: () => [] } })
const emit = defineEmits(['select-section', 'quick-view', 'add-to-cart', 'category', 'protein', 'sort', 'select-size'])
provide('storefrontSections', computed(() => props.content.sections))
provide('storefrontPresentation', computed(() => props.content))
const featured = computed(() => getHomeFeaturedProduct(props.content, props.context.products))
const upcoming = computed(() => {
  const ids = props.content.sections.find(block => block.type === 'collection')?.settings.productIds || []
  const rank = id => ids.includes(id) ? ids.indexOf(id) : ids.length
  return [...(props.context.comingSoonProducts || [])].sort((a, b) => rank(a.id) - rank(b.id))
})
const blocks = computed(() => props.content.sections.filter(block => props.editable || block.visible).map(block => ({ ...block, settings: resolveSectionSettings(block) })))
</script>
<template>
  <main class="home-content" :class="{ 'home-content-background': content.theme.backgroundImage, 'store-pattern': content.theme.monogram !== false && !content.theme.backgroundImage }" :data-season="content.theme.season" :style="{ '--store-card-columns': content.theme.columns || '4', ...(content.theme.backgroundImage ? { backgroundImage: `url(${JSON.stringify(mediaImageSource(content.theme.backgroundImage))})`, backgroundSize: '100% auto', backgroundRepeat: 'repeat-y', backgroundPosition: 'center top' } : {}) }">
    <div v-for="block in blocks" :key="block.id" :data-edit-section="block.id" class="home-section-frame" :class="[{ 'home-section-editable': editable, 'home-section-selected': editable && activeSection === block.id, 'home-section-hidden': !block.visible }, 'home-block-' + block.type]">
      <button v-if="editable" type="button" class="home-edit-handle" :aria-pressed="activeSection === block.id" @click="emit('select-section', block.id)"><Pencil :size="14" />{{ SECTION_CATALOG[block.type].label }}{{ !block.visible ? ' · Hidden' : '' }}<span v-if="changedSections.includes(block.id)" class="text-amber-800"> · Edited</span></button>
      <div :inert="editable || undefined" class="home-section-body" :class="{ 'home-section-custom-background': block.settings.background !== 'default' || block.settings.backgroundImage }" :style="sectionBackground(block.settings)">
        <HeroSection v-if="block.type === 'hero'" :id="block.id" :settings="block.settings" :product="featured" />
        <BrandPromiseStrip v-else-if="block.type === 'promise'" :id="block.id" :settings="block.settings" />
        <ProductSpotlightSection v-else-if="block.type === 'spotlight'" :id="block.id" :settings="block.settings" :featured-product="featured" :selected-size="context.getSelectedCardSize(featured)" :campaigns="context.campaignsForProduct(featured)" @select-size="emit('select-size', featured, $event)" @add-to-cart="(product, size) => emit('add-to-cart', product, size)" @quick-view="emit('quick-view', $event)" />
        <ProductCollectionSection v-else-if="block.type === 'collection'" :id="block.id" :settings="block.settings" :context="context" @quick-view="emit('quick-view', $event)" @add-to-cart="(product, size) => emit('add-to-cart', product, size)" @category="emit('category', $event)" @protein="emit('protein', $event)" @sort="emit('sort', $event)" />
        <NextDropsSection v-else-if="block.type === 'drops'" :id="block.id" :settings="block.settings" :products="upcoming" :get-display-tags="context.getDisplayTags" :loading="context.isLoading" :error="context.errorMessage" @preview="emit('quick-view', $event)" @retry="context.loadProducts" />
        <ReviewsPreviewSection v-else-if="block.type === 'gallery'" :id="block.id" :settings="block.settings" :autoplay="!editable" />
        <GivingSpotlightSection v-else-if="block.type === 'giving'" :id="block.id" :settings="block.settings" />
        <ProcessSection v-else-if="block.type === 'process'" :id="block.id" :settings="block.settings" />
        <IngredientsAnalysisSection v-else-if="block.type === 'ingredients'" :id="block.id" :settings="block.settings" :product="featured" @quick-view="emit('quick-view', featured)" />
        <AboutBrandSection v-else-if="block.type === 'brand'" :id="block.id" :settings="block.settings" />
        <ShopHelpSection v-else-if="block.type === 'help'" :id="block.id" :settings="block.settings" />
        <ContentFeatureSection v-else :id="block.id" :settings="block.settings" :type="block.type" />
      </div>
    </div>
  </main>
</template>
<style scoped>
.home-section-frame { position: relative; min-width: 0; }
.home-section-editable { border: 2px solid transparent; }
.home-section-selected { border-color: #17634c; }
.home-section-hidden { opacity: .55; }
.home-edit-handle { position: sticky; top: 4px; z-index: 2; display: flex; align-items: center; gap: 6px; min-height: 36px; padding: 8px 12px; margin: 6px; border: 1px solid #bac8c1; border-radius: 4px; background: #fff; color: #17634c; font: 600 12px/1.4 sans-serif; box-shadow: 0 2px 8px #162b191a; }
.home-edit-handle:focus-visible { outline: 2px solid #2f57b7; outline-offset: 2px; }
.home-section-custom-background :deep(.store-section) { background: transparent !important; }
.home-content[data-season='autumn'] :deep(.store-section) { border-bottom-color: #cda87e; }
.home-content[data-season='winter'] :deep(.store-section) { border-bottom-color: #9ebdac; }
.home-content-background .home-section-body:not(.home-section-custom-background) :deep(.store-section) { background: rgba(255,255,255,.78) !important; }
</style>
