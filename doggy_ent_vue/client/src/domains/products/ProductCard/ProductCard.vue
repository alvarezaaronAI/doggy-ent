<script setup>
import ProductCardImage from './ProductCardImage.vue'
import ProductCardInfo from './ProductCardInfo.vue'
import ProductCardVariantSelector from './ProductCardVariantSelector.vue'
import ProductCardPriceStatus from './ProductCardPriceStatus.vue'
import ProductCardActions from './ProductCardActions.vue'
import ProductCampaignBadge from './ProductCampaignBadge.vue'
const props = defineProps({
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

const emit = defineEmits(['quick-view', 'add-to-cart'])
</script>

<template>
  <article
    class="store-product flex h-full flex-col"
    :class="{ 'store-product-giving': campaigns.length }"
  >
    <ProductCardImage
      :product="props.product"
      @quick-view="emit('quick-view', props.product)"
    />

    <div class="flex flex-1 flex-col p-5">
      <ProductCardInfo
        :product="props.product"
        :tags="props.getDisplayTags(props.product)"
      />

      <ProductCampaignBadge :campaigns="campaigns" />

      <div class="mt-auto pt-5">
        <div class="border-t border-[#d6ddd4] pt-4">
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
        :product="props.product"
        :is-purchasable="
          props.isPurchasable(
            props.product,
            props.getSelectedCardVariant(props.product),
          )
        "
        @quick-view="emit('quick-view', $event)"
        @add-to-cart="emit('add-to-cart', $event)"
      />
    </div>
  </article>
</template>
