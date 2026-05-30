<script setup>
import ProductCardImage from './ProductCardImage.vue'
import ProductCardInfo from './ProductCardInfo.vue'
import ProductCardVariantSelector from './ProductCardVariantSelector.vue'
import ProductCardPriceStatus from './ProductCardPriceStatus.vue'
import ProductCardActions from './ProductCardActions.vue'
const props = defineProps({
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
    class="tile-strong group flex h-full min-h-[500px] cursor-pointer flex-col overflow-hidden rounded-2xl transition hover:-translate-y-1 hover:shadow-2xl"
    role="button"
    tabindex="0"
    @click="emit('quick-view', props.product)"
    @keydown.enter="emit('quick-view', props.product)"
    @keydown.space.prevent="emit('quick-view', props.product)"
  >
    <ProductCardImage
      :product="props.product"
    />

    <div class="flex flex-1 flex-col p-4">
      <ProductCardInfo
        :product="props.product"
        :tags="props.getDisplayTags(props.product)"
      />

      <div class="mt-3 border-t border-[color-mix(in_srgb,var(--brand-3)_30%,white)] pt-3">
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
          :is-purchasable="props.isPurchasable(props.product, props.getSelectedCardVariant(props.product))"
          :format-price="props.formatPrice"
        />
      </div>

      <ProductCardActions
        :product="props.product"
        :is-purchasable="props.isPurchasable(props.product, props.getSelectedCardVariant(props.product))"
        @quick-view="emit('quick-view', $event)"
        @add-to-cart="emit('add-to-cart', $event)"
      />
    </div>
  </article>
</template>