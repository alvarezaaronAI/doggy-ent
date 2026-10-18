<script setup>
import { computed, provide, ref } from 'vue'
import { Pencil, Monitor, Smartphone } from '@lucide/vue'
import SiteHeader from '@app/layouts/SiteHeader.vue'
import SiteFooter from '@app/layouts/SiteFooter.vue'
import PromoStrip from '@app/layouts/PromoStrip.vue'
import HomePageContent from '@storefront/Home/HomePageContent.vue'
import BrandPageContent from '@storefront/components/BrandPageContent.vue'
import CampaignPageContent from '@campaigns/components/CampaignPageContent.vue'
import ProductQuickView from '@products/ProductQuickView/ProductQuickView.vue'
import ProductCard from '@products/ProductCard/ProductCard.vue'
import { formatCurrency } from '@shared/utils/currency.js'
import AdminWebsiteAppearance from './AdminWebsiteAppearance.vue'
import '@storefront/styles/storefront.css'
import '@storefront/styles/home.css'
const props = defineProps({ draft: { type: Object, required: true }, context: { type: Object, required: true }, page: { type: String, default: 'home' }, product: Object, campaign: Object, selected: String, changedSections: { type: Array, default: () => [] } })
provide('storefrontSections', computed(() => props.draft.sections))
provide('storefrontPresentation', computed(() => props.draft))
defineEmits(['select'])
const phone = ref(false)
const canvas = ref(null)
const cardBindings = computed(() => Object.fromEntries(['getDisplayTags','getProductVariants','getSelectedCardSize','selectCardSize','getSelectedCardPrice','getSelectedCardVariant','getSelectedStockLabel','isPurchasable'].map(key => [key, props.context[key]])))
function scrollToSection(id) {
  if (id === 'theme') { canvas.value?.scrollTo({ top: 0, behavior: 'instant' }); return }
  const target = canvas.value?.querySelector(`[data-edit-section="${CSS.escape(id)}"]`) || canvas.value?.querySelector('#' + CSS.escape(id))
  if (target) canvas.value.scrollTo({ top: canvas.value.scrollTop + target.getBoundingClientRect().top - canvas.value.getBoundingClientRect().top, behavior: 'instant' })
}
defineExpose({ scrollToSection })
</script>
<template>
  <div class="website-canvas-tool">
    <div class="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--admin-line)] bg-white p-3">
      <span class="text-xs text-[var(--admin-muted)]">{{ page }} · presentation draft · shopping disabled</span>
      <div class="flex gap-2" role="group" aria-label="Preview width">
        <button type="button" class="admin-button" :aria-pressed="!phone" aria-label="Wide preview" title="Wide preview" @click="phone = false"><Monitor :size="16" /></button>
        <button type="button" class="admin-button" :aria-pressed="phone" aria-label="Phone preview" title="Phone preview" @click="phone = true"><Smartphone :size="16" /></button>
      </div>
    </div>
    <AdminWebsiteAppearance :draft="draft" :selected="selected" :changed="changedSections.includes(selected)" />
    <div ref="canvas" class="website-canvas-scroll">
      <div class="website-preview storefront-ui store-home" :class="{ 'website-preview-phone': phone }">
        <div data-edit-section="announcement" class="website-shell-block">
          <button type="button" class="website-shell-edit" :aria-pressed="selected === 'announcement'" @click="$emit('select', 'announcement')"><Pencil :size="14" />Announcement{{ !draft.announcement.visible ? ' · Hidden' : '' }}</button>
          <div inert><PromoStrip :content="draft" preview /></div>
        </div>
        <div data-edit-section="header" class="website-shell-block">
          <button type="button" class="website-shell-edit" :aria-pressed="selected === 'header'" @click="$emit('select', 'header')"><Pencil :size="14" />Header &amp; links</button>
          <div inert><SiteHeader :content="draft" preview /></div>
        </div>
        <HomePageContent v-if="['home','shell'].includes(page)" :content="draft" :context="context" editable :active-section="selected" :changed-sections="changedSections" @select-section="$emit('select', $event)" />
        <div v-else :inert="page !== 'brand'" class="p-4">
          <BrandPageContent v-if="page === 'brand'" :content="draft" preview />
          <CampaignPageContent v-else-if="page === 'campaign' && campaign" :content="draft" :campaign="campaign" :products="context.products" />
          <ProductQuickView v-else-if="page === 'quick' && product" :product="product" :content="draft" is-open preview />
          <div v-else-if="page === 'cards' && product" class="mx-auto max-w-[270px]"><ProductCard :product="product" v-bind="cardBindings" :format-price="formatCurrency" :campaigns="context.campaignsForProduct(product)" /></div>
          <p v-else class="p-8 store-muted">No public record available for this preview. Create it in Catalog first.</p>
        </div>
        <div data-edit-section="footer" class="website-shell-block">
          <button type="button" class="website-shell-edit" :aria-pressed="selected === 'footer'" @click="$emit('select', 'footer')"><Pencil :size="14" />Footer &amp; links{{ !draft.footer.visible ? ' · Hidden' : '' }}</button>
          <div inert><SiteFooter :content="draft" preview /></div>
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped>
.website-canvas-tool { min-width: 0; border: 1px solid var(--admin-line); border-radius: 6px; background: #e9eeea; overflow: clip; }
.website-canvas-scroll { max-height: 78svh; overflow: auto; overscroll-behavior: contain; }
.website-preview { min-width: 0; width: 100%; background: white; container-type: inline-size; container-name: website-preview; }
.website-preview-phone { max-width: 390px; margin: auto; }
.website-shell-block { position: relative; }
.website-shell-edit { display: flex; align-items: center; gap: 6px; margin: 6px; padding: 8px 12px; min-height: 36px; border: 1px solid #b8cbc0; border-radius: 4px; background: white; color: #17634c; font: 600 12px/1.4 sans-serif; }
.website-shell-edit[aria-pressed='true'] { background: #edf6f0; border-color: #17634c; }
.website-shell-edit:focus-visible { outline: 2px solid #2f57b7; outline-offset: 2px; }
.website-preview :deep(.site-header) { position: static; }
.website-preview :deep(.site-header-top) { flex-wrap: wrap; gap: 12px; padding: 16px; }
.website-preview :deep(.site-search-desktop) { display: none; }
.website-preview :deep(.site-brand) { font-size: 20px; }
.website-preview :deep(.site-desktop-nav) { flex-wrap: wrap; padding-inline: 16px; }
.website-preview :deep(.store-hero) { min-height: auto; padding-block: 36px; }
.website-preview :deep(.store-hero h1) { font-size: 32px; }
@container website-preview (max-width: 700px) {
  .website-preview :deep(.store-product-grid), .website-preview :deep(.home-drop-grid) { grid-template-columns: minmax(0,1fr); }
  .website-preview :deep(.md\:grid-cols-2), .website-preview :deep(.md\:grid-cols-3), .website-preview :deep(.sm\:grid-cols-2), .website-preview :deep(.sm\:grid-cols-3) { grid-template-columns: minmax(0,1fr); }
  .website-preview :deep(.site-footer-inner) { grid-template-columns: minmax(0,1fr); padding: 24px 16px; }
  .website-preview :deep(.site-footer-bottom) { flex-direction: column; }
  .website-preview :deep(.store-section > .store-inner) { padding: 32px 16px; }
  .website-preview :deep(.site-desktop-nav) { display: none; }
}
</style>
