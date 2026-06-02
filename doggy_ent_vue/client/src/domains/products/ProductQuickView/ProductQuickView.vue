<script setup>
import { computed, ref, watch } from 'vue'
import { useProductVariants } from '@products/composables/useProductVariants'
import {
  canIgnoreInventory,
  isInventoryLimited,
} from '@shared/constants/sellingMode'
import { formatCurrency } from '@shared/utils/currency'
import ProductQuickViewGallery from './ProductQuickViewGallery.vue'
import ProductQuickViewHeader from './ProductQuickViewHeader.vue'
import ProductQuickViewSizeSelector from './ProductQuickViewSizeSelector.vue'
import ProductQuickViewQuantity from './ProductQuickViewQuantity.vue'
import ProductQuickViewActions from './ProductQuickViewActions.vue'
import ProductQuickViewInfoGrid from './ProductQuickViewInfoGrid.vue'
import ProductQuickViewNotIncluded from './ProductQuickViewNotIncluded.vue'
import ProductQuickViewAnalysis from './ProductQuickViewAnalysis.vue'
import ProductQuickViewStorage from './ProductQuickViewStorage.vue'

const props = defineProps({
  product: {
    type: Object,
    default: null,
  },
  isOpen: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['close', 'add-to-cart'])


const {
  getProductVariants,
  getDefaultVariant,
  getVariantBySize,
  getSellingMode,
  isPurchasable: isProductPurchasable,
  getAvailableQuantity,
  getSelectedStockLabel,
} = useProductVariants()

const selectedSize = ref('6 oz')
const quantity = ref(1)

const variants = computed(() => {
  const productVariants = getProductVariants(props.product)

  if (productVariants.length) {
    return productVariants
  }

  return [getDefaultVariant(props.product)]
})

const selectedVariant = computed(() =>
  getVariantBySize(props.product, selectedSize.value)
)

const unitPrice = computed(() => Number(selectedVariant.value?.price || 0))
const totalPrice = computed(() => unitPrice.value * quantity.value)

const hasGuaranteedAnalysis = computed(() => {
  if (!props.product?.showGuaranteedAnalysis) return false

  const analysis = props.product?.guaranteedAnalysis
  if (!analysis) return false

  return Boolean(
    analysis.crudeProteinMin ||
    analysis.crudeFatMin ||
    analysis.crudeFiberMax ||
    analysis.moistureMax
  )
})


const notIncludedItems = computed(() => {
  if (Array.isArray(props.product?.notIncluded) && props.product.notIncluded.length) {
    return props.product.notIncluded
  }

  return ['No salt', 'No sugar', 'No glycerin', 'No preservatives']
})


const isPurchasable = computed(() => isProductPurchasable(props.product, selectedVariant.value))

const selectedStockLabel = computed(() =>
  getSelectedStockLabel(props.product, selectedVariant.value)
)

watch(
  () => props.isOpen,
  (isOpen) => {
    if (isOpen) {
      const hasSixOz = variants.value.some((variant) => variant.size === '6 oz')
      selectedSize.value = hasSixOz ? '6 oz' : variants.value[0]?.size || '6 oz'
      quantity.value = 1
    }
  }
)

watch(
  () => selectedSize.value,
  () => {
    quantity.value = 1
  }
)


function increaseQuantity() {
  if (canIgnoreInventory(props.product)) {
    quantity.value += 1
    return
  }

  const availableQuantity = getAvailableQuantity(props.product, selectedVariant.value)

  if (availableQuantity && quantity.value < availableQuantity) {
    quantity.value += 1
  }
}

function decreaseQuantity() {
  if (quantity.value > 1) {
    quantity.value -= 1
  }
}

function getVariantDescription(size) {
  if (size === '6 oz') return 'Regular size'
  if (size === '18 oz') return 'Best value for bigger dogs'
  return 'Product option'
}

function getDisplayTags(product) {
  if (Array.isArray(product?.tags) && product.tags.length) {
    return product.tags
  }

  return []
}

function addProductToCart() {
  if (!props.product || !selectedVariant.value || !isPurchasable.value) return

  emit('add-to-cart', {
    ...props.product,
    size: selectedVariant.value.size,
    price: unitPrice.value,
    sku: selectedVariant.value.sku,
    quantity: quantity.value,
    availableQuantity: getAvailableQuantity(props.product, selectedVariant.value),
    sellingMode: getSellingMode(props.product),
  })
}

</script>

<template>
  <Teleport to="body">
    <div
      v-if="isOpen && product"
      class="fixed inset-0 z-[140] flex items-center justify-center px-4 py-6"
    >
      <div
        class="absolute inset-0 bg-black/50 backdrop-blur-sm"
        @click="emit('close')"
      ></div>

      <section class="relative z-[150] max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
        <button
          class="absolute right-4 top-4 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full border border-stone-700 bg-white text-stone-400 hover:border-emerald-400"
          aria-label="Close quick view"
          @click="emit('close')"
        >
          <i class="fa-solid fa-xmark"></i>
        </button>

        <div class="grid gap-0 md:grid-cols-2">
          <ProductQuickViewGallery
            :product="product"
          />

          <div class="p-6 md:p-8">
            <ProductQuickViewHeader
              :product="product"
              :tags="getDisplayTags(product)"
            />

            <ProductQuickViewSizeSelector
              v-if="product.status === 'active'"
              :variants="variants"
              :selected-size="selectedSize"
              :selected-stock-label="selectedStockLabel"
              :unit-price="unitPrice"
              :product="product"
              :format-currency="formatCurrency"
              :get-variant-description="getVariantDescription"
              :is-inventory-limited="isInventoryLimited"
              @update-size="selectedSize = $event"
            />

            <div v-else class="mt-6 rounded-2xl border border-stone-800 bg-[color-mix(in_srgb,var(--brand-5)_48%,white)] p-4">
              <p class="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-400">
                Coming Soon
              </p>
              <h3 class="mt-2 font-extrabold text-[var(--brand-4)]">
                This product is not available yet
              </h3>
              <p class="mt-2 text-sm text-stone-300">
                Pricing, sizes, and launch details will be announced when this treat goes live.
              </p>
            </div>

            <ProductQuickViewQuantity
              v-if="product.status === 'active' && isPurchasable"
              :quantity="quantity"
              :total-price="totalPrice"
              :format-currency="formatCurrency"
              @increase="increaseQuantity"
              @decrease="decreaseQuantity"
            />

            <div v-if="product.status === 'active' && isInventoryLimited(product) && !isPurchasable" class="mt-6 rounded-2xl border border-stone-800 bg-[color-mix(in_srgb,var(--brand-5)_55%,white)] p-4">
              <p class="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-400">
                {{ selectedStockLabel }}
              </p>
              <h3 class="mt-2 font-extrabold text-[var(--brand-4)]">
                This size is not available right now
              </h3>
              <p class="mt-2 text-sm text-stone-300">
                Choose another size if available, or request a notification when this size is restocked.
              </p>
            </div>

            <ProductQuickViewActions
              :is-purchasable="isPurchasable"
              :quantity="quantity"
              @add-to-cart="addProductToCart"
              @notify="emit('close')"
            />

            <ProductQuickViewInfoGrid
              :product="product"
            />

            <ProductQuickViewNotIncluded
              :items="notIncludedItems"
            />

            <ProductQuickViewAnalysis
              v-if="hasGuaranteedAnalysis"
              :analysis="product.guaranteedAnalysis"
            />

            <ProductQuickViewStorage
              :storage-feeding="product.storageFeeding"
            />
          </div>
        </div>
      </section>
    </div>
  </Teleport>
</template>
