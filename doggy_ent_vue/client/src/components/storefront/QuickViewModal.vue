<script setup>
import { computed, ref, watch } from 'vue'
import {
  getSellingMode,
  canIgnoreInventory,
  isInventoryLimited,
  isPurchasable as isProductPurchasable,
  getAvailableQuantity,
  getStockLabel,
} from '../../utils/sellingMode'

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

const selectedSize = ref('6 oz')
const quantity = ref(1)

const variants = computed(() => {
  if (Array.isArray(props.product?.variants) && props.product.variants.length) {
    return props.product.variants
  }

  return [
    {
      size: '6 oz',
      price: Number(props.product?.price || 0),
      sku: '',
      quantity: 0,
      stockStatus: 'out-of-stock',
      lowStockThreshold: 0,
    },
  ]
})

const selectedVariant = computed(() =>
  variants.value.find((variant) => variant.size === selectedSize.value) || variants.value[0]
)

const unitPrice = computed(() => Number(selectedVariant.value?.price || 0))
const totalPrice = computed(() => unitPrice.value * quantity.value)

const hasGuaranteedAnalysis = computed(() => {
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

const selectedStockLabel = computed(() => getStockLabel(props.product, selectedVariant.value))

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

function formatPrice(value) {
  return `$${Number(value).toFixed(2)}`
}

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

  return ['Small-batch', 'No fillers']
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
          <div class="min-h-[360px] bg-[var(--brand-5)]">
            <img
              class="h-full min-h-[360px] w-full object-cover"
              :src="product.image"
              :alt="product.name"
            />
          </div>

          <div class="p-6 md:p-8">
            <p class="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-400">
              Quick View
            </p>

            <h2 class="mt-2 text-3xl font-extrabold">
              {{ product.name }}
            </h2>

            <div class="mt-3 flex flex-wrap gap-2">
              <span
                v-for="tag in getDisplayTags(product).slice(0, 3)"
                :key="tag"
                class="rounded-full bg-[color-mix(in_srgb,var(--brand-2)_88%,white)] px-3 py-1 text-[11px] font-extrabold text-[var(--brand-4)] shadow-sm"
              >
                {{ tag }}
              </span>
            </div>

            <p class="mt-1 text-sm font-semibold text-stone-400">
              {{ product.protein }} <span v-if="product.cut">• {{ product.cut }}</span>
            </p>

            <p class="mt-3 text-stone-300">
              {{ product.shortDescription }}
            </p>

            <div v-if="product.status === 'active'" class="mt-6 rounded-2xl border border-stone-800 bg-[color-mix(in_srgb,var(--brand-5)_48%,white)] p-4">
              <div class="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 class="font-extrabold text-[var(--brand-4)]">Choose Size</h3>
                  <p class="mt-1 text-sm text-stone-300">
                    Select a size before adding to cart.
                  </p>
                </div>

                <p class="text-right text-sm font-semibold text-stone-400">
                  {{ selectedStockLabel }}
                  <span class="block text-lg font-extrabold text-[var(--brand-4)]">
                    {{ formatPrice(unitPrice) }}
                  </span>
                </p>
              </div>

              <div class="mt-4 flex flex-wrap gap-2">
                <button
                  v-for="variant in variants"
                  :key="variant.size"
                  class="rounded-full border px-4 py-2 text-sm font-extrabold transition"
                  :class="[
                    selectedSize === variant.size
                      ? 'border-emerald-400 bg-emerald-400 text-[var(--brand-4)] shadow-sm'
                      : 'border-stone-700 bg-white text-stone-700 hover:border-emerald-400',
                    isInventoryLimited(product) && (variant.stockStatus === 'out-of-stock' || Number(variant.quantity || 0) <= 0)
                      ? 'opacity-60'
                      : ''
                  ]"
                  @click="selectedSize = variant.size"
                >
                  {{ variant.size }}
                </button>
              </div>

              <p class="mt-3 text-xs text-stone-400">
                {{ getVariantDescription(selectedSize) }}
              </p>
            </div>

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

            <div v-if="product.status === 'active' && isPurchasable" class="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-stone-800 bg-[color-mix(in_srgb,var(--brand-5)_55%,white)] p-4">
              <div>
                <p class="text-sm text-stone-400">Quantity</p>
                <div class="mt-2 inline-flex items-center overflow-hidden rounded-full border border-stone-700 bg-white">
                  <button
                    class="inline-flex h-10 w-10 items-center justify-center text-stone-400 hover:text-emerald-400"
                    @click="decreaseQuantity"
                  >
                    -
                  </button>
                  <span class="min-w-[3rem] text-center font-bold">{{ quantity }}</span>
                  <button
                    class="inline-flex h-10 w-10 items-center justify-center text-stone-400 hover:text-emerald-400"
                    @click="increaseQuantity"
                  >
                    +
                  </button>
                </div>
              </div>

              <div class="text-right">
                <p class="text-sm text-stone-400">Total</p>
                <p class="text-2xl font-extrabold text-[var(--brand-4)]">
                  {{ formatPrice(totalPrice) }}
                </p>
              </div>
            </div>

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

            <button
              v-if="isPurchasable"
              class="focus-ring mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-400 px-5 py-3 font-semibold text-[var(--brand-4)] hover:bg-emerald-300"
              @click="addProductToCart"
            >
              <i class="fa-solid fa-bag-shopping"></i>
              Add {{ quantity }} to Cart
            </button>

            <button
              v-else
              class="focus-ring mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-400 px-5 py-3 font-semibold text-[var(--brand-4)] hover:bg-emerald-300"
              @click="emit('close')"
            >
              <i class="fa-solid fa-bell"></i>
              Notify Me When Available
            </button>

            <div class="mt-6 grid gap-4 sm:grid-cols-2">
              <div class="rounded-2xl border border-stone-800 bg-white p-4">
                <div class="flex items-start gap-3">
                  <i class="fa-solid fa-bowl-food mt-1 text-emerald-400"></i>
                  <div>
                    <h3 class="font-extrabold">Ingredients</h3>
                    <p class="mt-2 text-sm text-stone-300">
                      {{ product.ingredients || 'Single ingredient. No salt, no sugar, no glycerin, no preservatives.' }}
                    </p>
                  </div>
                </div>
              </div>

              <div class="rounded-2xl border border-stone-800 bg-white p-4">
                <div class="flex items-start gap-3">
                  <i class="fa-solid fa-hand-sparkles mt-1 text-emerald-400"></i>
                  <div>
                    <h3 class="font-extrabold">Texture</h3>
                    <p class="mt-2 text-sm text-stone-300">
                      {{ product.texture || 'Firm jerky texture that can be broken into smaller pieces.' }}
                    </p>
                  </div>
                </div>
              </div>

              <div class="rounded-2xl border border-stone-800 bg-white p-4">
                <div class="flex items-start gap-3">
                  <i class="fa-solid fa-bullseye mt-1 text-emerald-400"></i>
                  <div>
                    <h3 class="font-extrabold">Best For</h3>
                    <p class="mt-2 text-sm text-stone-300">
                      {{ product.bestFor || 'Training rewards, bigger dogs, picky pups, and simple-ingredient routines.' }}
                    </p>
                  </div>
                </div>
              </div>

              <div class="rounded-2xl border border-stone-800 bg-white p-4">
                <div class="flex items-start gap-3">
                  <i class="fa-solid fa-clock mt-1 text-emerald-400"></i>
                  <div>
                    <h3 class="font-extrabold">Freshness</h3>
                    <p class="mt-2 text-sm text-stone-300">
                      {{ product.freshness || 'Best enjoyed within 14–21 days after opening. Keep sealed for freshness.' }}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div class="mt-4 rounded-2xl border border-stone-800 bg-white p-4">
              <div class="flex items-start gap-3">
                <i class="fa-solid fa-ban mt-1 text-emerald-400"></i>
                <div class="min-w-0 flex-1">
                  <h3 class="font-extrabold">What’s Not Inside</h3>
                  <div class="mt-3 flex flex-wrap gap-2">
                    <span
                      v-for="item in notIncludedItems"
                      :key="item"
                      class="rounded-full bg-[color-mix(in_srgb,var(--brand-5)_70%,white)] px-3 py-1 text-xs font-bold text-[var(--brand-4)]"
                    >
                      {{ item }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div v-if="hasGuaranteedAnalysis" class="mt-4 rounded-2xl border border-stone-800 bg-white p-4">
              <h3 class="font-extrabold">Guaranteed Analysis</h3>

              <dl class="mt-3 grid grid-cols-2 gap-y-2 text-sm">
                <dt class="text-stone-400">Crude Protein min</dt>
                <dd class="text-right font-semibold">
                  {{ product.guaranteedAnalysis?.crudeProteinMin || '70%' }}
                </dd>

                <dt class="text-stone-400">Crude Fat min</dt>
                <dd class="text-right font-semibold">
                  {{ product.guaranteedAnalysis?.crudeFatMin || '4.5%' }}
                </dd>

                <dt class="text-stone-400">Crude Fiber max</dt>
                <dd class="text-right font-semibold">
                  {{ product.guaranteedAnalysis?.crudeFiberMax || '0.5%' }}
                </dd>

                <dt class="text-stone-400">Moisture max</dt>
                <dd class="text-right font-semibold">
                  {{ product.guaranteedAnalysis?.moistureMax || '20%' }}
                </dd>
              </dl>
            </div>

            <div class="mt-4 rounded-2xl border border-stone-800 bg-[color-mix(in_srgb,var(--brand-5)_55%,white)] p-4">
              <h3 class="font-extrabold">Storage & Feeding</h3>
              <p class="mt-2 text-sm text-stone-300">
                {{ product.storageFeeding || 'Keep sealed in a cool, dry place. Refrigerate after opening for max freshness. Treats are intended for intermittent or supplemental feeding only. Always supervise and provide fresh water.' }}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  </Teleport>
</template>
