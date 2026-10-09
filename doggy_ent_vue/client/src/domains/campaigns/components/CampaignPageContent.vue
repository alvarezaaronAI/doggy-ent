<script setup>
import { computed, ref, watch } from 'vue'
import { ArrowRight, HeartHandshake, ArrowUpRight } from '@lucide/vue'
import CampaignPageSection from './CampaignPageSection.vue'
import ProductCard from '@products/ProductCard/ProductCard.vue'
import { useProductVariants } from '@products/composables/useProductVariants.js'
import {
  getCampaignContributionLabel,
  safeCampaignLink,
} from '../utils/campaignPresentation.js'
import { formatCurrency } from '@shared/utils/currency.js'
import '@storefront/styles/storefront.css'
const props = defineProps({
  campaign: { type: Object, required: true },
  products: { type: Array, default: () => [] },
  editable: Boolean,
  activeSection: String,
})
const emit = defineEmits(['select-section', 'add-to-cart', 'quick-view'])
const variants = useProductVariants()
const imageFailed = ref(false)
watch(
  () => props.campaign.image,
  () => {
    imageFailed.value = false
  },
)
const image = computed(() =>
  imageFailed.value ? '' : safeCampaignLink(props.campaign.image),
)
const beneficiaryUrl = computed(() =>
  safeCampaignLink(props.campaign.beneficiaryUrl),
)
const eligibleProducts = computed(() =>
  props.products.filter(
    (product) =>
      props.campaign.productIds?.includes(String(product.id)) &&
      product.status === 'active',
  ),
)
const story = computed(() =>
  String(props.campaign.story || '')
    .split(/\n\s*\n/)
    .filter((text) => text.trim()),
)
const active = computed(() => props.campaign.isActive === true)
const period = computed(() => {
  const format = (value) =>
    value && Number.isFinite(Date.parse(value))
      ? new Date(value).toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })
      : ''
  const start = format(props.campaign.startsAt)
  const end = format(props.campaign.endsAt)
  return [start ? 'From ' + start : '', end ? 'Through ' + end : '']
    .filter(Boolean)
    .join(' · ')
})
function select(section) {
  emit('select-section', section)
}
function goToProducts(event) {
  if (props.editable) {
    event.preventDefault()
    select('products')
    return
  }
  event.preventDefault()
  event.currentTarget
    .closest('.campaign-page')
    .querySelector('[data-campaign-products]')
    ?.scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 'auto'
        : 'smooth',
    })
}
</script>
<template>
  <div class="campaign-page storefront-ui">
    <CampaignPageSection
      section-key="hero"
      label="Introduction & image"
      :editable="editable"
      :selected="activeSection === 'hero'"
      @select="select"
    >
      <div class="campaign-hero" :class="{ 'campaign-hero-image': image }">
        <img
          v-if="image"
          :src="image"
          :alt="campaign.imageAlt || campaign.name"
          @error="imageFailed = true"
        />
        <div v-if="image" class="campaign-hero-shade"></div>
        <div class="store-inner relative">
          <p class="store-eyebrow">A little treat. A little good.</p>
          <h1>{{ campaign.name || (editable ? 'Your campaign name' : '') }}</h1>
          <p class="campaign-introduction">
            {{
              campaign.description ||
              (editable ? 'Add a short introduction to the campaign.' : '')
            }}
          </p>
          <a
            v-if="active || editable"
            href="#campaign-products"
            class="store-button store-button-primary mt-6"
            @click="goToProducts"
            >Shop treats that give back <ArrowRight :size="17"
          /></a>
          <p v-else class="mt-6 text-sm font-semibold">
            {{
              campaign.status === 'PAUSED'
                ? 'Giving is currently paused.'
                : campaign.status === 'ACTIVE'
                  ? 'Giving is not currently in its scheduled window.'
                  : 'This campaign has ended.'
            }}
          </p>
        </div>
      </div>
    </CampaignPageSection>
    <CampaignPageSection
      section-key="partner"
      label="Who it supports"
      :editable="editable"
      :selected="activeSection === 'partner'"
      @select="select"
    >
      <div class="store-inner campaign-partner">
        <div>
          <p class="store-eyebrow">Who you're supporting</p>
          <h2>
            {{
              campaign.donationTarget ||
              (editable ? 'Your beneficiary' : 'Our giving partner')
            }}
          </h2>
        </div>
        <a
          v-if="beneficiaryUrl"
          :href="beneficiaryUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="store-button"
          :tabindex="editable ? -1 : 0"
          @click="editable && $event.preventDefault()"
          >Meet our partner <ArrowUpRight :size="17"
        /></a>
      </div>
    </CampaignPageSection>
    <CampaignPageSection
      v-if="story.length || editable"
      section-key="story"
      label="The story"
      :editable="editable"
      :selected="activeSection === 'story'"
      @select="select"
    >
      <div class="store-inner campaign-story">
        <p class="store-eyebrow">The story behind the giving</p>
        <h2>Good things happen together.</h2>
        <p
          v-for="(paragraph, index) in story"
          :key="index"
          class="store-muted whitespace-pre-line leading-relaxed mt-5"
        >
          {{ paragraph }}
        </p>
        <p v-if="!story.length && editable" class="store-muted mt-5">
          Add the story and the work your partner does.
        </p>
      </div>
    </CampaignPageSection>
    <CampaignPageSection
      section-key="giving"
      label="Giving & schedule"
      :editable="editable"
      :selected="activeSection === 'giving'"
      @select="select"
    >
      <div class="store-inner campaign-giving">
        <HeartHandshake :size="34" class="text-[#17634c]" aria-hidden="true" />
        <div>
          <p class="store-eyebrow">How your purchase helps</p>
          <h2>{{ getCampaignContributionLabel(campaign) }}</h2>
          <p class="store-muted mt-4 leading-relaxed">
            {{ active ? 'We contribute' : 'This campaign contributes' }} from
            eligible purchases to
            {{ campaign.donationTarget || 'the beneficiary' }}. There's no extra
            donation added to your checkout total.
          </p>
          <p v-if="period" class="store-muted mt-3 text-sm">{{ period }}</p>
          <p
            v-if="Number(campaign.donationGenerated) > 0"
            class="mt-5 font-semibold"
          >
            {{ formatCurrency(campaign.donationGenerated) }} generated from
            eligible orders.
          </p>
          <p
            v-if="Number(campaign.donationGenerated) > 0"
            class="store-muted mt-1 text-xs"
          >
            Generated contributions are not a confirmation of funds paid out.
          </p>
        </div>
      </div>
    </CampaignPageSection>
    <CampaignPageSection
      section-key="products"
      label="Eligible treats"
      :editable="editable"
      :selected="activeSection === 'products'"
      @select="select"
    >
      <div id="campaign-products" data-campaign-products class="store-inner">
        <p class="store-eyebrow">Treats with a little more purpose</p>
        <h2>
          {{
            active || editable
              ? 'Pick a treat. Share some good.'
              : 'The treats behind this campaign.'
          }}
        </h2>
        <p v-if="!active && !editable" class="store-muted mt-4 text-sm">
          These treats can still be purchased, but purchases do not currently
          contribute to this campaign.
        </p>
        <div
          v-if="eligibleProducts.length"
          class="store-product-grid mt-7"
          :inert="editable"
        >
          <ProductCard
            v-for="product in eligibleProducts"
            :key="product.id"
            :product="product"
            :campaigns="
              active || editable ? [{ ...campaign, pageAvailable: false }] : []
            "
            :format-price="formatCurrency"
            :get-display-tags="(p) => p.tags || []"
            :get-product-variants="variants.getProductVariants"
            :get-selected-card-size="variants.getSelectedCardSize"
            :select-card-size="variants.selectCardSize"
            :get-selected-card-price="variants.getSelectedCardPrice"
            :get-selected-card-variant="variants.getSelectedCardVariant"
            :get-selected-stock-label="variants.getSelectedStockLabel"
            :is-purchasable="variants.isPurchasable"
            @add-to-cart="
              emit('add-to-cart', $event, variants.getSelectedCardSize($event))
            "
            @quick-view="
              emit('quick-view', {
                ...$event,
                selectedSize: variants.getSelectedCardSize($event),
              })
            "
          />
        </div>
        <p v-else class="store-muted mt-5">
          {{
            editable
              ? 'Select active products to include in this campaign.'
              : 'Eligible treats are not currently available.'
          }}
        </p>
        <RouterLink
          v-if="!editable"
          :to="{ path: '/', hash: '#shop' }"
          class="store-button mt-7"
          >Explore all treats <ArrowRight :size="16"
        /></RouterLink>
      </div>
    </CampaignPageSection>
  </div>
</template>
<style scoped src="../styles/campaignPage.css"></style>
