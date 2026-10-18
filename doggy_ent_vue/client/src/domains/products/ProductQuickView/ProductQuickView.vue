<script setup>
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
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
import { pagePresentation, PRESENTATION_COLORS } from '@storefront-content/pagePresentation.js'
import { useStorefrontContent } from '@storefront/composables/useStorefrontContent.js'

const props = defineProps({
  preview: Boolean,
  content: Object,
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
const { content: publishedContent } = useStorefrontContent()
const labels = computed(() => pagePresentation(props.content || publishedContent.value).quick)
const infoTab = ref('details')

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
const dialog = ref(null)
let previousFocus
function handleDialogKeys(event) {
  if (!props.isOpen) return
  if (event.key === 'Escape') emit('close')
  if (event.key !== 'Tab') return
  const elements = [
    ...(dialog.value?.querySelectorAll(
      'button:not(:disabled), a[href], input, select, textarea, [tabindex="0"]',
    ) || []),
  ].filter((el) => el.getClientRects().length)
  const first = elements[0]
  const last = elements.at(-1)
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault()
    last?.focus()
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first?.focus()
  }
}
onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleDialogKeys)
})

const variants = computed(() => {
  const productVariants = getProductVariants(props.product)

  if (productVariants.length) {
    return productVariants
  }

  return [getDefaultVariant(props.product)]
})

const selectedVariant = computed(() =>
  getVariantBySize(props.product, selectedSize.value),
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
    analysis.moistureMax,
  )
})

const notIncludedItems = computed(() => {
  if (
    Array.isArray(props.product?.notIncluded) &&
    props.product.notIncluded.length
  ) {
    return props.product.notIncluded
  }

  return []
})

const isPurchasable = computed(() =>
  isProductPurchasable(props.product, selectedVariant.value),
)

const selectedStockLabel = computed(() =>
  getSelectedStockLabel(props.product, selectedVariant.value),
)

watch(
  () => props.isOpen,
  async (isOpen) => {
    if (isOpen) {
      selectedSize.value = variants.value.some(
        (variant) => variant.size === props.product?.selectedSize,
      )
        ? props.product.selectedSize
        : variants.value[0]?.size || ''
      quantity.value = 1
      if (props.preview) return
      previousFocus = document.activeElement
      document.addEventListener('keydown', handleDialogKeys)
      await nextTick()
      dialog.value?.querySelector('button')?.focus()
    } else {
      document.removeEventListener('keydown', handleDialogKeys)
      previousFocus?.focus?.()
    }
  },
)

watch(
  () => selectedSize.value,
  () => {
    quantity.value = 1
  },
)

function increaseQuantity() {
  if (canIgnoreInventory(props.product)) {
    quantity.value += 1
    return
  }

  const availableQuantity = getAvailableQuantity(
    props.product,
    selectedVariant.value,
  )

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
  if (props.preview || !props.product || !selectedVariant.value || !isPurchasable.value) return

  emit('add-to-cart', {
    ...props.product,
    size: selectedVariant.value.size,
    price: unitPrice.value,
    sku: selectedVariant.value.sku,
    quantity: quantity.value,
    availableQuantity: getAvailableQuantity(
      props.product,
      selectedVariant.value,
    ),
    sellingMode: getSellingMode(props.product),
  })
  emit('close')
}
</script>

<template>
  <Teleport to="body" :disabled="preview">
    <div
      v-if="isOpen && product"
      :class="preview ? 'product-quick-preview' : 'fixed inset-0 z-[140] flex items-center justify-center px-4 py-6'"
    >
      <div
        v-if="!preview" class="absolute inset-0 bg-black/50 backdrop-blur-sm"
        @click="emit('close')"
      ></div>

      <section
        ref="dialog"
        :role="preview ? 'region' : 'dialog'"
        :aria-modal="preview ? undefined : true"
        :aria-label="product.name + ' quick view'"
        class="product-quick-panel relative w-full max-w-5xl overflow-y-auto rounded-lg bg-white shadow-2xl"
        :class="preview ? '' : 'z-[150] max-h-[92vh]'"
        :style="{ backgroundColor: PRESENTATION_COLORS[labels.background] }"
      >
        <button
          v-if="!preview" class="absolute right-4 top-4 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full border border-stone-300 bg-white text-stone-700 hover:border-blue-700"
          aria-label="Close quick view"
          @click="emit('close')"
        >
          <i class="fa-solid fa-xmark"></i>
        </button>

        <div class="product-quick-layout grid gap-0 md:grid-cols-2">
          <ProductQuickViewGallery :product="product" />

          <div class="p-6 md:p-8">
            <p class="store-eyebrow">{{ labels.title }}</p>
            <p class="store-muted mt-2 text-sm">{{ labels.introduction }}</p>
            <ProductQuickViewHeader
              :product="product"
              :tags="getDisplayTags(product)"
            />

            <ProductQuickViewSizeSelector
              v-if="variants.length"
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

            <p v-if="product.status === 'coming-soon'" class="mt-4 text-sm store-muted">Coming soon. This product is not available yet.</p>

            <ProductQuickViewQuantity
              v-if="product.status === 'active' && isPurchasable"
              :quantity="quantity"
              :total-price="totalPrice"
              :format-currency="formatCurrency"
              @increase="increaseQuantity"
              @decrease="decreaseQuantity"
            />

            <p v-if="product.isTestProduct" class="mt-4 text-sm store-muted">Testing product · illustrative content · not for sale.</p>

            <ProductQuickViewActions
              :is-purchasable="isPurchasable"
              :quantity="quantity"
              @add-to-cart="addProductToCart"
            />

            <div class="mt-7 flex flex-wrap gap-2 border-b border-stone-200 pb-3" role="group" aria-label="Product information">
              <button type="button" class="store-button text-xs" :aria-pressed="infoTab === 'details'" @click="infoTab = 'details'">{{ labels.detailsLabel }}</button>
              <button type="button" class="store-button text-xs" :aria-pressed="infoTab === 'care'" @click="infoTab = 'care'">{{ labels.careLabel }}</button>
            </div>
            <div v-show="infoTab === 'details'">
            <ProductQuickViewInfoGrid :product="product" />

            <ProductQuickViewNotIncluded
              v-if="notIncludedItems.length"
              :items="notIncludedItems"
            />

            <ProductQuickViewAnalysis
              v-if="hasGuaranteedAnalysis"
              :analysis="product.guaranteedAnalysis"
            />
            </div>

            <ProductQuickViewStorage
              v-show="infoTab === 'care'"
              :storage-feeding="product.storageFeeding"
            />
          </div>
        </div>
      </section>
    </div>
  </Teleport>
</template>
<style scoped>
.product-quick-panel { color: #443d36; }
.product-quick-panel { max-width:940px; padding:24px; }
.product-quick-layout { gap:24px; }
.product-quick-layout > div { padding:0; }
.product-quick-panel :deep(.product-detail-gallery) { padding:0; background:transparent; grid-template-columns:56px minmax(0,1fr); gap:10px; }
.product-quick-panel :deep(.product-detail-thumbnails button) { width:56px; height:56px; }
.product-quick-panel :deep(.product-detail-main > img) { box-shadow:none; border:1px solid #dbe2dd; }
@media(max-width:640px) { .product-quick-panel { padding:18px; } .product-quick-panel :deep(.product-detail-gallery) { grid-template-columns:minmax(0,1fr); } .product-quick-panel :deep(.product-detail-thumbnails button) { width:44px; height:44px; } }
.product-quick-panel :deep(.text-stone-300), .product-quick-panel :deep(.text-stone-400) { color: #625b52; }
.product-quick-panel :deep(.border-stone-800), .product-quick-panel :deep(.border-stone-700) { border-color: #e1d3c2; }
.product-quick-panel :deep(.rounded-2xl) { border-radius: 8px; }
.product-quick-panel :deep(.text-emerald-400) { color: var(--brand-1); }
.product-quick-panel :deep(.bg-emerald-400) { background: var(--brand-2); border-color: var(--brand-1); }
.product-quick-panel :deep(.text-lg) { font-size: 28px; line-height: 1.3; }
@container website-preview (max-width:700px) { .product-quick-layout { grid-template-columns: minmax(0,1fr); } }
</style>
