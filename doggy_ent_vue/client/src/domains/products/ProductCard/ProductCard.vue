<script setup>
import ProductCardImage from './ProductCardImage.vue'
import ProductCardInfo from './ProductCardInfo.vue'
import ProductCardVariantSelector from './ProductCardVariantSelector.vue'
import ProductCardPriceStatus from './ProductCardPriceStatus.vue'
import ProductCardActions from './ProductCardActions.vue'
import ProductCampaignBadge from './ProductCampaignBadge.vue'
import { Pencil } from '@lucide/vue'
import CommerceCardSurface from '@shared/components/CommerceCardSurface.vue'
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
    class="store-product flex h-full flex-col"
    :class="{ 'store-product-giving': campaigns.length }"
  >
    <button v-if="editable" type="button" class="product-edit-handle" @click="emit('select-section', 'details')"><Pencil :size="14" /> Edit image</button>
    <ProductCardImage
      :inert="browseOnly || undefined"
      :product="props.product"
      @quick-view="editable ? emit('select-section', 'details') : emit('quick-view', props.product)"
    />

    <div class="flex flex-1 flex-col p-5">
      <button v-if="editable" type="button" class="product-edit-handle mb-3" @click="emit('select-section', 'details')"><Pencil :size="14" /> Edit product details</button>
      <ProductCardInfo
        :product="props.product"
        :tags="props.getDisplayTags(props.product)"
      />

      <button v-if="editable" type="button" class="product-edit-handle mt-3" @click="emit('select-section', 'content')"><Pencil :size="14" /> Edit tags &amp; more</button>

      <ProductCampaignBadge :campaigns="campaigns" :inert="editable || undefined" />

      <div class="mt-auto pt-5">
        <div class="border-t border-[#d6ddd4] pt-4">
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
  </CommerceCardSurface>
</template>
<style scoped>
.product-edit-handle { display: inline-flex; gap: 6px; align-items: center; min-height: 36px; padding: 6px 10px; background: #edf3ef; color: #17634c; border: 1px solid #b8cbc0; border-radius: 4px; font-size: 12px; font-weight: 600; }
.product-edit-handle:focus-visible { outline: 2px solid #2f57b7; outline-offset: 2px; }
</style>
