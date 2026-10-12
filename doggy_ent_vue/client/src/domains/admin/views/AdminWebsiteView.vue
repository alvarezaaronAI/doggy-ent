<script setup>
import { computed, onMounted, ref, watch, nextTick } from 'vue'
import { ArrowUp, ArrowDown, Eye, EyeOff, Plus, Save, Upload, RotateCcw, Trash2 } from '@lucide/vue'
import AdminPageHeader from '../components/AdminPageHeader.vue'
import AdminWebsiteCanvas from '../components/AdminWebsiteCanvas.vue'
import AdminWebsiteFields from '../components/AdminWebsiteFields.vue'
import AdminCommerceCanvas from '../components/AdminCommerceCanvas.vue'
import AdminCommerceFields from '../components/AdminCommerceFields.vue'
import { useAdminWebsite } from '../composables/useAdminWebsite.js'
import { SECTION_CATALOG } from '@storefront-content/sectionCatalog.js'
import { useProducts } from '@products/composables/useProducts.js'
import { useProductVariants } from '@products/composables/useProductVariants.js'
import { useStorefrontCampaigns } from '@campaigns/composables/useStorefrontCampaigns.js'
const { draft, selected, selectedBlock, changedSections, revision, loading, busy, error, success, dirty, hasUnpublishedChanges, publishedAt, published, availableTypes, load, save, cancel, restorePublished, addSection, moveSection, removeSection } = useAdminWebsite()
const catalog = useProducts(), variants = useProductVariants(), campaigns = useStorefrontCampaigns()
const newType = ref('banner'), canvas = ref(null)
const page = ref('home')
function choosePage(value) { page.value = value; selected.value = value === 'home' ? 'hero' : value }
const shellSections = [['announcement', 'Announcement'], ['header', 'Header & navigation'], ['theme', 'Seasonal appearance'], ['footer', 'Footer & links']]
const context = computed(() => ({ ...variants,
  products: catalog.storefrontProducts.value, activeProducts: catalog.storefrontProducts.value.filter(p => p.status === 'active'),
  comingSoonProducts: catalog.comingSoonProducts.value, availableCategories: catalog.availableCategories.value,
  availableProteins: catalog.availableProteins.value, isLoading: catalog.isLoading.value, errorMessage: catalog.errorMessage.value,
  selectedCategory: 'all', selectedProtein: 'all', selectedSort: 'featured',
  campaignsForProduct: campaigns.campaignsForProduct, campaignError: campaigns.error.value,
  loadProducts: catalog.loadProducts, loadCampaigns: campaigns.loadCampaigns,
  getDisplayTags: product => product.tags || [],
}))
watch(selected, async id => { await nextTick(); canvas.value?.scrollToSection(id) })
onMounted(async () => { await catalog.loadProducts(); await campaigns.loadCampaigns() })
</script>
<template>
  <section class="admin-page">
    <AdminPageHeader title="Website" eyebrow="Storefront editor">
      <button type="button" class="admin-button" :disabled="busy || loading" @click="load"><RotateCcw :size="16" />Reload</button>
    </AdminPageHeader>
    <p v-if="error" class="admin-alert admin-alert-error" role="alert">{{ error }}</p>
    <p v-if="success" class="admin-alert admin-alert-success" role="status">{{ success }}</p>
    <p v-if="loading" class="admin-state" role="status">Loading website editor...</p>
    <template v-else-if="draft">
      <div class="website-publishbar">
        <div><strong>{{ dirty ? 'Unsaved changes' : revision === 0 ? 'Original storefront' : hasUnpublishedChanges ? 'Draft saved' : 'Published website' }}</strong><p class="admin-muted mt-1 text-xs">{{ publishedAt ? 'Last published ' + new Date(publishedAt).toLocaleString() : 'Original storefront is live. No website changes published yet.' }}</p></div>
        <div class="flex flex-wrap gap-2">
          <button type="button" class="admin-button" :disabled="busy || !dirty" @click="cancel">Cancel changes</button>
          <button type="button" class="admin-button" :disabled="busy || !dirty" @click="save(false)"><Save :size="16" />{{ busy ? 'Saving...' : 'Save draft' }}</button>
          <button type="button" class="admin-button admin-primary" :disabled="busy || !hasUnpublishedChanges" @click="save(true)"><Upload :size="16" />Publish website</button>
        </div>
      </div>
      <div class="website-editor-grid">
        <aside class="website-sections" aria-label="Website sections">
          <fieldset :disabled="busy">
            <label class="admin-field mb-4">Page to edit<select :value="page" @change="choosePage($event.target.value)"><option value="home">Homepage &amp; footer</option><option value="checkout">Checkout</option><option value="confirmation">Order confirmation</option></select></label>
            <nav v-if="page !== 'home'" class="space-y-2" aria-label="Commerce page sections"><button v-for="[key, label] in page === 'checkout' ? [['checkout', 'Heading & wallets']] : [['confirmation', 'Welcome & background'], ['confirmation-next', 'Next steps'], ['confirmation-help', 'Help & links']]" :key="key" class="website-section-choice" :aria-pressed="selected === key" @click="selected = key">{{ label }}<small v-if="changedSections.includes(key)" class="mt-1 block text-amber-800">Edited · not saved</small></button></nav>
            <template v-if="page === 'home'">
            <nav class="space-y-1" aria-label="Site settings"><button v-for="[key, label] in shellSections" :key="key" type="button" class="website-section-choice" :aria-pressed="selected === key" @click="selected = key">{{ label }}<small v-if="changedSections.includes(key)" class="mt-1 block text-amber-800">Edited · not saved</small></button></nav>
            <h2 class="mb-3 mt-6 text-sm">Homepage sections</h2>
            <div v-for="(block, index) in draft.sections" :key="block.id" class="website-section-row">
              <button type="button" class="website-section-choice" :aria-pressed="selected === block.id" @click="selected = block.id">{{ block.settings.title || SECTION_CATALOG[block.type].label }}<small v-if="changedSections.includes(block.id)" class="mt-1 block text-amber-800">Edited · not saved</small></button>
              <div class="flex gap-1">
                <button type="button" class="website-section-icon" :aria-label="(block.visible ? 'Hide ' : 'Show ') + SECTION_CATALOG[block.type].label" :title="block.visible ? 'Hide section' : 'Show section'" :aria-pressed="block.visible" @click="block.visible = !block.visible"><Eye v-if="block.visible" :size="15" /><EyeOff v-else :size="15" /></button>
                <button type="button" class="website-section-icon" :disabled="index === 0" :aria-label="'Move ' + SECTION_CATALOG[block.type].label + ' up'" title="Move up" @click="moveSection(block.id, -1)"><ArrowUp :size="15" /></button>
                <button type="button" class="website-section-icon" :disabled="index === draft.sections.length - 1" :aria-label="'Move ' + SECTION_CATALOG[block.type].label + ' down'" title="Move down" @click="moveSection(block.id, 1)"><ArrowDown :size="15" /></button>
              </div>
            </div>
            <div class="mt-5 space-y-3 border-t border-[var(--admin-line)] pt-4">
              <label class="admin-field">New section<select v-model="newType"><option v-for="[key, definition] in availableTypes" :key="key" :value="key">{{ definition.label }}</option></select></label>
              <button type="button" class="admin-button w-full" :disabled="draft.sections.length >= 24" @click="addSection(newType)"><Plus :size="16" />Add section</button>
            </div>
            </template>
          </fieldset>
        </aside>
        <AdminWebsiteCanvas v-if="page === 'home'" ref="canvas" :draft="draft" :context="context" :selected="selected" :changed-sections="changedSections" @select="selected = $event" />
        <AdminCommerceCanvas v-else ref="canvas" :draft="draft" :page="page" :selected="selected" @select="selected = $event" />
        <aside class="website-inspector" aria-label="Website editing controls">
          <fieldset :disabled="busy"><AdminWebsiteFields v-if="page === 'home'" :draft="draft" :selected="selected" :block="selectedBlock" :products="catalog.storefrontProducts.value" /><AdminCommerceFields v-else :draft="draft" :selected="selected" /></fieldset>
          <div class="mt-6 space-y-3 border-t border-[var(--admin-line)] pt-4">
            <button v-if="selectedBlock && !SECTION_CATALOG[selectedBlock.type].singleton && selectedBlock.id !== 'shop'" type="button" class="admin-button" :disabled="busy" @click="removeSection(selectedBlock.id)"><Trash2 :size="16" />Remove section</button>
            <button v-if="published" type="button" class="admin-button" :disabled="busy" @click="restorePublished"><RotateCcw :size="16" />Use published version</button>
          </div>
        </aside>
      </div>
    </template>
    <button v-else type="button" class="admin-button" @click="load">Try again</button>
  </section>
</template>
<style scoped>
.website-publishbar { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 16px; padding: 16px 0; border-block: 1px solid var(--admin-line); margin-bottom: 20px; }
.website-editor-grid { display: grid; grid-template-columns: 160px minmax(0,1fr) 290px; gap: 16px; align-items: start; }
.website-sections, .website-inspector { min-width: 0; }
.website-inspector { background: white; border: 1px solid var(--admin-line); border-radius: 6px; padding: 16px; max-height: 84svh; overflow: auto; overscroll-behavior: contain; }
.website-section-choice { display: block; width: 100%; padding: 10px 8px; min-height: 44px; text-align: left; font-size: 12px; border: 1px solid #d6ddd7; border-radius: 4px; background: #eff1ef; overflow-wrap: anywhere; }
.website-section-choice[aria-pressed='true'] { background: #edf6f0; color: #17634c; border-color: #17634c; font-weight: 650; }
.website-section-row { margin-bottom: 12px; }
.website-section-icon { display: grid; place-items: center; width: 36px; height: 36px; margin-top: 3px; border: 1px solid #d6ddd7; border-radius: 3px; background: #eff1ef; }
.website-section-icon:disabled { opacity: .4; }
.website-section-choice:focus-visible, .website-section-icon:focus-visible { outline: 2px solid #17634c; outline-offset: 2px; }
@media (max-width: 1099px) { .website-editor-grid { grid-template-columns: minmax(0,1fr) 290px; } .website-sections { grid-column: 1/-1; } .website-sections fieldset { display: grid; grid-template-columns: repeat(3,minmax(0,1fr)); gap: 8px; } .website-sections nav, .website-sections h2, .website-sections fieldset > div:last-child { grid-column: 1/-1; } .website-sections nav { display: flex; flex-wrap: wrap; } .website-sections nav button { width: auto; } }
@media (max-width: 799px) { .website-editor-grid { grid-template-columns: minmax(0,1fr); } .website-inspector { order: -1; max-height: 60svh; } .website-sections { order: -2; } .website-sections fieldset { grid-template-columns: repeat(2,minmax(0,1fr)); } }
</style>
