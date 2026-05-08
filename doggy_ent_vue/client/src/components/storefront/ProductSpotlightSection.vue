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
  featuredProduct: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['add-to-cart'])

const selectedSize = ref('6 oz')

const variants = computed(() => {
  if (Array.isArray(props.featuredProduct?.variants) && props.featuredProduct.variants.length) {
    return props.featuredProduct.variants
  }

  return [
    {
      size: '6 oz',
      price: Number(props.featuredProduct?.price || 0),
      quantity: 0,
      stockStatus: 'out-of-stock',
      lowStockThreshold: 0,
    },
  ]
})

const selectedVariant = computed(() =>
  variants.value.find((variant) => normalizeSize(variant.size) === normalizeSize(selectedSize.value)) || variants.value[0]
)

const selectedPrice = computed(() =>
  Number(selectedVariant.value?.price || props.featuredProduct?.price || 0)
)

const isPurchasable = computed(() =>
  isProductPurchasable(props.featuredProduct, selectedVariant.value)
)

const stockLabel = computed(() =>
  getStockLabel(props.featuredProduct, selectedVariant.value)
)

const displayTags = computed(() => {
  if (Array.isArray(props.featuredProduct?.tags) && props.featuredProduct.tags.length) {
    return props.featuredProduct.tags.slice(0, 3)
  }

  return ['Single-ingredient', 'Grain-free']
})

watch(
  () => props.featuredProduct,
  (product) => {
    const productVariants = Array.isArray(product?.variants) ? product.variants : []
    const hasSixOz = productVariants.some((variant) => variant.size === '6 oz')
    selectedSize.value = hasSixOz ? '6 oz' : productVariants[0]?.size || '6 oz'
  },
  { immediate: true }
)

function formatPrice(value) {
  return `$${Number(value).toFixed(2)}`
}

function normalizeSize(size) {
  return String(size || '').trim().toLowerCase()
}

function isSelectedSize(size) {
  return normalizeSize(selectedSize.value) === normalizeSize(size)
}

function selectSize(size) {
  selectedSize.value = size
}

function addFeaturedToCart() {
  if (!props.featuredProduct || !selectedVariant.value || !isPurchasable.value) return

  emit('add-to-cart', {
    ...props.featuredProduct,
    size: selectedVariant.value.size,
    price: selectedPrice.value,
    quantity: 1,
    availableQuantity: getAvailableQuantity(props.featuredProduct, selectedVariant.value),
    sellingMode: getSellingMode(props.featuredProduct),
  })
}
</script>

<template>
  <section id="spotlight" class="mx-auto max-w-7xl px-5 py-10 md:px-6">
    <div class="section-panel overflow-hidden p-5 md:p-6">
      <div class="grid gap-6 md:grid-cols-2 md:items-stretch">
        <div class="tile-strong overflow-hidden rounded-2xl border border-stone-800 bg-white">
          <img
            :src="featuredProduct?.image || 'https://images.unsplash.com/photo-1568640347023-a616a30bc3bd?q=80&w=1200&auto=format&fit=crop'"
            :alt="featuredProduct?.name || 'Chicken breast jerky'"
            class="h-full min-h-[340px] w-full object-cover"
          />
        </div>

        <div class="tile-strong flex flex-col justify-center rounded-2xl border border-stone-800 bg-white p-5 md:p-7">
          <p class="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-400">
            Featured treat
          </p>

          <h2 class="mt-2 text-2xl font-extrabold text-[var(--brand-4)] md:text-3xl">
            {{ featuredProduct?.name }}
          </h2>

          <div class="mt-3 flex flex-wrap gap-2">
            <span
              v-for="tag in displayTags"
              :key="tag"
              class="rounded-full bg-[color-mix(in_srgb,var(--brand-2)_88%,white)] px-3 py-1 text-[11px] font-extrabold text-[var(--brand-4)]"
            >
              {{ tag }}
            </span>
          </div>

          <p class="mt-4 text-stone-300">
            {{ featuredProduct?.shortDescription }}
          </p>

          <div class="mt-6 rounded-2xl border border-stone-800 p-4">
            <div class="flex items-center justify-between gap-4">
              <div>
                <p class="text-sm font-bold">Choose Size</p>
                <div class="mt-2 flex gap-2">
                  <button
                    v-for="variant in variants"
                    :key="variant.size"
                    @click="selectSize(variant.size)"
                    class="min-w-[72px] rounded-full border px-4 py-2 text-sm font-extrabold transition"
                    :class="[
                      isSelectedSize(variant.size)
                        ? 'chip-blue-ring border-emerald-400 bg-emerald-400 text-[var(--brand-4)] shadow-sm'
                        : 'border-stone-700 bg-white text-stone-700 hover:border-emerald-400',
                      isInventoryLimited(featuredProduct) && (variant.stockStatus === 'out-of-stock' || Number(variant.quantity || 0) <= 0)
                        ? 'opacity-60'
                        : ''
                    ]"
                  >
                    {{ variant.size }}
                  </button>
                </div>
              </div>

              <div class="text-right">
                <p class="text-xs font-bold uppercase tracking-[0.12em] text-stone-400">{{ stockLabel }}</p>
                <p class="mt-1 text-xl font-extrabold text-[var(--brand-4)]">{{ formatPrice(selectedPrice) }}</p>
              </div>
            </div>
          </div>

          <div
            v-if="featuredProduct?.status === 'active' && isInventoryLimited(featuredProduct) && !isPurchasable"
            class="mt-4 rounded-2xl border border-stone-800 bg-[color-mix(in_srgb,var(--brand-5)_55%,white)] p-4"
          >
            <p class="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-400">
              {{ stockLabel }}
            </p>
            <h3 class="mt-2 font-extrabold text-[var(--brand-4)]">
              This size is not available right now
            </h3>
            <p class="mt-2 text-sm text-stone-300">
              Choose another size if available, or request a notification when this size is restocked.
            </p>
          </div>

          <div class="mt-6 flex gap-3">
            <button
              v-if="isPurchasable"
              class="bg-emerald-400 px-5 py-3 rounded-lg font-semibold"
              @click="addFeaturedToCart"
            >
              Add to Cart
            </button>

            <button
              v-else
              class="bg-emerald-400 px-5 py-3 rounded-lg font-semibold text-[var(--brand-4)]"
            >
              Notify Me
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>