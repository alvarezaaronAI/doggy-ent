<script setup>
import { computed } from 'vue'
import { ArrowRight, ArrowUpRight } from '@lucide/vue'
import CampaignPageSection from './CampaignPageSection.vue'
import CampaignGivingSummary from './CampaignGivingSummary.vue'
import CampaignExampleSections from './CampaignExampleSections.vue'
import ProductCard from '@products/ProductCard/ProductCard.vue'
import { useProductVariants } from '@products/composables/useProductVariants.js'
import { safeCampaignLink } from '../utils/campaignPresentation.js'
import { formatCurrency } from '@shared/utils/currency.js'
import { getMediaAssetId } from '@storefront-content/mediaRules.js'
import { pagePresentation, PRESENTATION_COLORS } from '@storefront-content/pagePresentation.js'
import { useStorefrontContent } from '@storefront/composables/useStorefrontContent.js'
import { BRAND_IMAGES } from '@storefront/constants/brandContent.js'
import StorefrontPhoto from '@storefront/components/StorefrontPhoto.vue'
import StorefrontHero from '@storefront/components/StorefrontHero.vue'
import '@storefront/styles/storefront.css'

const props = defineProps({
  campaign: { type: Object, required: true }, content: Object,
  products: { type: Array, default: () => [] }, editable: Boolean, quickView: Boolean, activeSection: String,
})
const emit = defineEmits(['select-section', 'add-to-cart', 'quick-view', 'browse'])
const variants = useProductVariants()
const { content: publishedContent } = useStorefrontContent()
const labels = computed(() => pagePresentation(props.content || publishedContent.value).campaign)
const image = computed(() => getMediaAssetId(props.campaign.image) ? props.campaign.image : safeCampaignLink(props.campaign.image))
const beneficiaryUrl = computed(() => safeCampaignLink(props.campaign.beneficiaryUrl))
const eligibleProducts = computed(() => props.products.filter(product => props.campaign.productIds?.includes(String(product.id)) && ['active', 'out-of-stock', 'coming-soon'].includes(product.status))
  .sort((a, b) => props.campaign.productIds.indexOf(String(a.id)) - props.campaign.productIds.indexOf(String(b.id))))
const story = computed(() => String(props.campaign.story || '').split(/\n\s*\n/).filter(text => text.trim()))
const example = computed(() => props.campaign.name?.startsWith('[TEST]'))
const active = computed(() => props.campaign.isActive === true)
function goToProducts(event) {
  event.preventDefault()
  if (props.editable) { emit('select-section', 'products'); return }
  event.currentTarget.closest('.campaign-page')?.querySelector('[data-campaign-products]')?.scrollIntoView({
    behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
  })
}
</script>

<template>
  <div class="campaign-page campaign-impact-first storefront-ui store-pattern" :style="{ '--campaign-panel-surface': PRESENTATION_COLORS[labels.background] }">
    <CampaignPageSection section-key="hero" label="Introduction & image" :editable="editable" :selected="activeSection === 'hero'" @select="emit('select-section', $event)">
      <StorefrontHero class="campaign-boutique-hero" :title="campaign.name" :eyebrow="example ? 'Example giving campaign' : 'A little good, together'" :description="campaign.description" :image="image || ''" :image-alt="campaign.imageAlt || campaign.name">
        <a v-if="active || editable" href="#campaign-products" class="store-button store-button-primary" @click="goToProducts">Shop eligible treats <ArrowRight :size="17" /></a>
      </StorefrontHero>
    </CampaignPageSection>
    <CampaignPageSection class="campaign-impact-band" section-key="giving" label="Giving & schedule" :editable="editable" :selected="activeSection === 'giving'" @select="emit('select-section', $event)">
      <CampaignGivingSummary :campaign="campaign" :title="labels.givingTitle" :example="example" />
    </CampaignPageSection>
    <CampaignPageSection section-key="partner" label="Partner & story" :editable="editable" :selected="['partner', 'story'].includes(activeSection)" @select="emit('select-section', $event)">
      <div class="store-inner campaign-partner-layout" :class="{ 'campaign-partner-text-only': !example }">
        <StorefrontPhoto v-if="example" :image="BRAND_IMAGES.partner" alt="Illustrative yellow Labrador in a comfortable care room" caption="Partner story · fictional example, not an actual beneficiary" />
        <div class="min-w-0"><p class="campaign-eyebrow">{{ labels.partnerLabel }}</p><h2>{{ campaign.donationTarget || labels.storyTitle }}</h2>
          <h3 v-if="labels.storyTitle" class="campaign-partner-heading">{{ labels.storyTitle }}</h3>
          <p v-for="(paragraph, index) in story" :key="index" class="campaign-copy">{{ paragraph }}</p>
          <p v-if="!story.length && editable" class="campaign-copy">Add the story and the work your partner does.</p>
          <a v-if="beneficiaryUrl" :href="beneficiaryUrl" target="_blank" rel="noopener noreferrer" class="store-button mt-5" @click="editable && $event.preventDefault()">Meet the partner <ArrowUpRight :size="16" /></a>
        </div>
      </div>
    </CampaignPageSection>
    <CampaignExampleSections v-if="example" :labels="labels" />
    <section class="store-inner">
      <header class="campaign-heading-row"><div><p class="campaign-eyebrow">Nothing extra at checkout</p><h2>From your bag to a little good.</h2></div><p>The contribution comes from the business, not an extra charge to you.</p></header>
      <ol class="campaign-steps grid gap-6 sm:grid-cols-3">
        <li><span>01</span><h3>Choose an eligible treat.</h3><p>Look for the soft emerald campaign marker when giving is active.</p></li>
        <li><span>02</span><h3>Checkout as usual.</h3><p>No added donation, extra form, or opt-in needed.</p></li>
        <li><span>03</span><h3>We record the contribution.</h3><p>The campaign rule applies only while giving is active and the order is eligible.</p></li>
      </ol>
    </section>
    <CampaignPageSection section-key="products" label="Eligible treats" :editable="editable" :selected="activeSection === 'products'" @select="emit('select-section', $event)">
      <div id="campaign-products" data-campaign-products class="store-inner">
        <header class="campaign-heading-row"><div><p class="campaign-eyebrow">A little more purpose</p><h2>{{ labels.productsTitle }}</h2></div><p v-if="!active && !editable">Purchases do not currently contribute to this campaign.</p><p v-else-if="example">Example products · test products are not for sale.</p></header>
        <div v-if="eligibleProducts.length" class="store-product-grid" :inert="editable">
          <ProductCard v-for="product in eligibleProducts" :key="product.id" :product="product" :browse-only="quickView" :campaigns="active || editable ? [{ ...campaign, pageAvailable: false }] : []" :format-price="formatCurrency"
            :get-display-tags="p => p.tags || []" :get-product-variants="variants.getProductVariants" :get-selected-card-size="variants.getSelectedCardSize" :select-card-size="variants.selectCardSize" :get-selected-card-price="variants.getSelectedCardPrice" :get-selected-card-variant="variants.getSelectedCardVariant" :get-selected-stock-label="variants.getSelectedStockLabel" :is-purchasable="variants.isPurchasable"
            @browse="emit('browse')" @add-to-cart="emit('add-to-cart', $event, variants.getSelectedCardSize($event))" @quick-view="emit('quick-view', { ...$event, selectedSize: variants.getSelectedCardSize($event) })" />
        </div>
        <p v-else class="store-muted">Eligible treats are not currently available.</p>
        <RouterLink v-if="!editable" to="/#shop" class="store-button mt-6" @click="quickView && emit('browse')">Explore all treats <ArrowRight :size="16" /></RouterLink>
      </div>
    </CampaignPageSection>
  </div>
</template>

<style scoped src="../styles/campaignPage.css"></style>
