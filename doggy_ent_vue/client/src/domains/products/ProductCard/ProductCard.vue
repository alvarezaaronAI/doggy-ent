<script setup>
import ProductCardImage from './ProductCardImage.vue'
import ProductCardInfo from './ProductCardInfo.vue'
import ProductCardVariantSelector from './ProductCardVariantSelector.vue'
import ProductCardPriceStatus from './ProductCardPriceStatus.vue'
import ProductCardActions from './ProductCardActions.vue'
import ProductCampaignBadge from './ProductCampaignBadge.vue'
import WishlistButton from '@domains/account/components/WishlistButton.vue'
import { Pencil } from '@lucide/vue'
import CommerceCardSurface from '@shared/components/CommerceCardSurface.vue'
import { computed, inject } from 'vue'
import { pagePresentation, PRESENTATION_COLORS } from '@storefront-content/pagePresentation.js'
import { useStorefrontContent } from '@storefront/composables/useStorefrontContent.js'
const { content } = useStorefrontContent()
const presentation = inject('storefrontPresentation', null)
const appearance = computed(() => pagePresentation(presentation?.value || content.value).cards)
const props = defineProps({
  editable: Boolean,
  browseOnly: Boolean,
  campaigns: { type: Array, default: () => [] },
  product: {
    type: Object,
    required: true,
  },
  formatPrice: {
    type: Function,
    required: true,
  },
  getDisplayTags: {
    type: Function,
    required: true,
  },
  getProductVariants: {
    type: Function,
    required: true,
  },
  getSelectedCardSize: {
    type: Function,
    required: true,
  },
  selectCardSize: {
    type: Function,
    required: true,
  },
  getSelectedCardPrice: {
    type: Function,
    required: true,
  },
  getSelectedCardVariant: {
    type: Function,
    required: true,
  },
  getSelectedStockLabel: {
    type: Function,
    required: true,
  },
  isPurchasable: {
    type: Function,
    required: true,
  },
})

const emit = defineEmits(['quick-view', 'add-to-cart', 'select-section', 'browse'])
</script>

<template>
  <CommerceCardSurface
    :giving="campaigns.length > 0"
    class="store-product store-product-card relative flex h-full flex-col"
    :class="{ 'store-product-giving': campaigns.length }"
    :style="campaigns.length ? undefined : { backgroundColor: PRESENTATION_COLORS[appearance.background] }"
  >
    <WishlistButton v-if="!editable && !browseOnly" :product="props.product" class="absolute right-3 top-3 z-10" />
    <button v-if="editable" type="button" class="product-edit-handle" @click="emit('select-section', 'details')"><Pencil :size="14" /> Edit image</button>
    <ProductCardImage
      :inert="browseOnly || undefined"
      :product="props.product"
      @quick-view="editable ? emit('select-section', 'details') : emit('quick-view', props.product)"
    />

    <div class="product-card-content flex flex-1 flex-col p-3.5">
      <button v-if="editable" type="button" class="product-edit-handle mb-3" @click="emit('select-section', 'details')"><Pencil :size="14" /> Edit product details</button>
      <ProductCardInfo
        :product="props.product"
        :tags="props.getDisplayTags(props.product)"
      />

      <button v-if="editable" type="button" class="product-edit-handle mt-3" @click="emit('select-section', 'content')"><Pencil :size="14" /> Edit tags &amp; more</button>

      <div class="mt-auto pt-3">
        <div class="border-t border-[#d6ddd4] pt-3">
          <button v-if="editable" type="button" class="product-edit-handle mb-3" @click="emit('select-section', 'variants')"><Pencil :size="14" /> Edit prices &amp; stock</button>
          <ProductCardVariantSelector
            :product="props.product"
            :variants="props.getProductVariants(props.product)"
            :selected-size="props.getSelectedCardSize(props.product)"
            @select-size="props.selectCardSize(props.product, $event)"
          />

          <ProductCardPriceStatus
            :product="props.product"
            :price="props.getSelectedCardPrice(props.product)"
            :stock-label="props.getSelectedStockLabel(props.product)"
            :is-purchasable="
              props.isPurchasable(
                props.product,
                props.getSelectedCardVariant(props.product),
              )
            "
            :format-price="props.formatPrice"
          />
        </div>
      </div>

      <ProductCardActions
        v-if="!browseOnly"
        class="product-card-actions"
        :inert="editable || undefined"
        :product="props.product"
        :is-purchasable="
          props.isPurchasable(
            props.product,
            props.getSelectedCardVariant(props.product),
          )
        "
        @quick-view="!editable && emit('quick-view', $event)"
        @add-to-cart="!editable && emit('add-to-cart', $event)"
      />
      <RouterLink v-else to="/#shop" class="store-button mt-5" @click="emit('browse')">Shop this treat</RouterLink>
    </div>
    <ProductCampaignBadge compact :campaigns="campaigns" :inert="editable || undefined" />
  </CommerceCardSurface>
</template>
<style scoped>
.product-card-actions { padding-top:12px; }
.product-card-content :deep(.product-card-tags), .product-card-content :deep(.product-card-description), .product-card-content :deep(.product-card-facts) { margin-top:8px; }
.product-card-content :deep(.store-eyebrow) { margin-bottom:4px; }
.product-card-content :deep(.product-card-title) { margin-top:0; }
.product-edit-handle { display: inline-flex; gap: 6px; align-items: center; min-height: 36px; padding: 6px 10px; background: #edf3ef; color: #17634c; border: 1px solid #b8cbc0; border-radius: 4px; font-size: 12px; font-weight: 600; }
.product-edit-handle:focus-visible { outline: 2px solid #2f57b7; outline-offset: 2px; }
</style>
