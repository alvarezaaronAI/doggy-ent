<script setup>
import { computed, onMounted, ref, watch, nextTick } from 'vue'
import { ArrowUp, ArrowDown, Plus, Save, Upload, RotateCcw, Trash2 } from '@lucide/vue'
import AdminPageHeader from '../components/AdminPageHeader.vue'
import AdminWebsiteCanvas from '../components/AdminWebsiteCanvas.vue'
import AdminWebsiteFields from '../components/AdminWebsiteFields.vue'
import AdminPresentationFields from '../components/AdminPresentationFields.vue'
import AdminCommerceCanvas from '../components/AdminCommerceCanvas.vue'
import AdminCommerceFields from '../components/AdminCommerceFields.vue'
import { useAdminWebsite } from '../composables/useAdminWebsite.js'
import { SECTION_CATALOG } from '@storefront-content/sectionCatalog.js'
import { WEBSITE_PAGES, websiteSections } from '../constants/websiteEditor.constants.js'
import { useProducts } from '@products/composables/useProducts.js'
import { useProductVariants } from '@products/composables/useProductVariants.js'
import { useStorefrontCampaigns } from '@campaigns/composables/useStorefrontCampaigns.js'
import { useWebsiteCampaignPreview } from '../composables/useWebsiteCampaignPreview.js'
const { draft, selected, selectedBlock, changedSections, revision, loading, busy, error, success, dirty, hasUnpublishedChanges, publishedAt, published, availableTypes, load, save, cancel, restorePublished, addSection, moveSection, removeSection } = useAdminWebsite()
const catalog = useProducts(), variants = useProductVariants(), campaigns = useStorefrontCampaigns()
const newType = ref('banner'), canvas = ref(null), page = ref('home'), productId = ref(''), campaignId = ref('')
const sections = computed(() => draft.value ? websiteSections(page.value, draft.value) : [])
const product = computed(() => catalog.storefrontProducts.value.find(item => item.id === productId.value) || catalog.storefrontProducts.value[0])
const { campaign, campaignPreviewError } = useWebsiteCampaignPreview(campaigns.campaigns, campaignId)
const commerce = computed(() => ['checkout', 'confirmation'].includes(page.value))
const presentation = computed(() => ['cards','quick','campaign','brand'].includes(page.value))
const sectionIndex = computed(() => draft.value?.sections.findIndex(block => block.id === selected.value) ?? -1)
function choosePage(value) { page.value = value; selected.value = websiteSections(value, draft.value)[0]?.[0] }
const context = computed(() => ({ ...variants,
  products: catalog.storefrontProducts.value, activeProducts: catalog.storefrontProducts.value,
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
    <AdminPageHeader title="Website UI" eyebrow="Presentation workspace"><button type="button" class="admin-button" :disabled="busy || loading" @click="load"><RotateCcw :size="16" />Reload</button></AdminPageHeader>
    <p v-if="error" class="admin-alert admin-alert-error" role="alert">{{ error }}</p><p v-if="success" class="admin-alert admin-alert-success" role="status">{{ success }}</p>
    <p v-if="loading" class="admin-state" role="status">Loading website editor...</p>
    <template v-else-if="draft">
      <div class="website-publishbar"><div><strong>{{ dirty ? 'Unsaved changes' : revision === 0 ? 'Original storefront' : hasUnpublishedChanges ? 'Draft saved' : 'Published website' }}</strong><p class="admin-muted mt-1 text-xs">{{ publishedAt ? 'Last published ' + new Date(publishedAt).toLocaleString() : 'Save a draft, review, then explicitly publish.' }}</p></div><div class="flex flex-wrap gap-2"><button type="button" class="admin-button" :disabled="busy || !dirty" @click="cancel">Cancel changes</button><button type="button" class="admin-button" :disabled="busy || !dirty" @click="save(false)"><Save :size="16" />{{ busy ? 'Saving...' : 'Save draft' }}</button><button type="button" class="admin-button admin-primary" :disabled="busy || !hasUnpublishedChanges" @click="save(true)"><Upload :size="16" />Publish website</button></div></div>
      <fieldset :disabled="busy" class="website-location">
        <label class="admin-field">Page or shared component<select :value="page" @change="choosePage($event.target.value)"><optgroup v-for="group in WEBSITE_PAGES" :key="group.label" :label="group.label"><option v-for="[id,label] in group.items" :key="id" :value="id">{{ label }}</option></optgroup></select></label>
        <label class="admin-field">Section to edit<select v-model="selected"><option v-for="[id,label] in sections" :key="id" :value="id">{{ label }}{{ changedSections.includes(id) ? ' · Edited' : '' }}</option></select></label>
        <label v-if="['cards','quick'].includes(page)" class="admin-field">Read-only product for preview<select v-model="productId"><option value="">First available product</option><option v-for="item in catalog.storefrontProducts.value" :key="item.id" :value="item.id">{{ item.name }}</option></select></label>
        <label v-if="page === 'campaign'" class="admin-field">Read-only campaign for preview<select v-model="campaignId"><option value="">First available campaign</option><option v-for="item in campaigns.campaigns.value" :key="item.id" :value="item.id">{{ item.name }}</option></select></label>
      </fieldset>
      <p v-if="page === 'campaign' && campaignPreviewError" class="admin-alert" role="status">{{ campaignPreviewError }}</p>
      <div class="website-editor-grid">
        <AdminCommerceCanvas v-if="commerce" ref="canvas" :draft="draft" :page="page" :selected="selected" @select="selected = $event" />
        <AdminWebsiteCanvas v-else ref="canvas" :draft="draft" :context="context" :page="page" :product="product" :campaign="campaign" :selected="selected" :changed-sections="changedSections" @select="selected = $event; page = ['header','footer','theme','announcement'].includes($event) ? 'shell' : 'home'" />
        <aside class="website-inspector" aria-label="Static website editing controls">
          <fieldset :disabled="busy"><AdminCommerceFields v-if="commerce" :draft="draft" :selected="selected" /><AdminPresentationFields v-else-if="presentation" :draft="draft" :area="page" /><AdminWebsiteFields v-else :draft="draft" :selected="selected" :block="selectedBlock" :products="catalog.storefrontProducts.value" /></fieldset>
          <fieldset v-if="page === 'home'" :disabled="busy" class="mt-5 space-y-4 border-t border-[var(--admin-line)] pt-4">
            <div v-if="selectedBlock" class="flex flex-wrap gap-2"><button type="button" class="admin-button" title="Move section earlier" aria-label="Move section earlier" :disabled="sectionIndex === 0" @click="moveSection(selected, -1)"><ArrowUp :size="16" /></button><button type="button" class="admin-button" title="Move section later" aria-label="Move section later" :disabled="sectionIndex === draft.sections.length - 1" @click="moveSection(selected, 1)"><ArrowDown :size="16" /></button><button v-if="!SECTION_CATALOG[selectedBlock.type].singleton && selected !== 'shop'" type="button" class="admin-button" @click="removeSection(selected)"><Trash2 :size="16" />Remove section</button></div>
            <label class="admin-field">Add a homepage section<select v-model="newType"><option v-for="[key, definition] in availableTypes" :key="key" :value="key">{{ definition.label }}</option></select></label><button type="button" class="admin-button" :disabled="draft.sections.length >= 24" @click="addSection(newType)"><Plus :size="16" />Add section</button>
          </fieldset>
          <button v-if="published" type="button" class="admin-button mt-5" :disabled="busy" @click="restorePublished"><RotateCcw :size="16" />Use published version</button>
        </aside>
      </div>
    </template>
    <button v-else type="button" class="admin-button" @click="load">Try again</button>
  </section>
</template>
<style scoped>
.website-publishbar { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 16px; padding: 16px 0; border-block: 1px solid var(--admin-line); margin-bottom: 20px; }
.website-location { display: grid; grid-template-columns: repeat(auto-fit,minmax(210px,1fr)); gap: 12px; margin-bottom: 20px; }
.website-editor-grid { display: grid; grid-template-columns: minmax(0,1fr) 310px; gap: 18px; align-items: start; }
.website-inspector { min-width: 0; background: white; border: 1px solid var(--admin-line); border-radius: 6px; padding: 18px; max-height: 84svh; overflow: auto; overscroll-behavior: contain; }
@media(max-width:900px) { .website-editor-grid { grid-template-columns: minmax(0,1fr); } .website-inspector { max-height: none; } }
</style>
