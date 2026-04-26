
<script setup>
import { computed, ref, watch } from 'vue'

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
    },
  ]
})

const selectedVariant = computed(() =>
  variants.value.find((variant) => variant.size === selectedSize.value) || variants.value[0]
)

const selectedPrice = computed(() => Number(selectedVariant.value?.price || props.featuredProduct?.price || 0))

const isPurchasable = computed(() =>
  props.featuredProduct?.status === 'active' &&
  selectedVariant.value?.stockStatus === 'in-stock' &&
  Number(selectedVariant.value?.quantity || 0) > 0
)

const stockLabel = computed(() => {
  if (!selectedVariant.value) return 'Unavailable'

  if (
    selectedVariant.value.stockStatus === 'out-of-stock' ||
    Number(selectedVariant.value.quantity || 0) <= 0
  ) {
    return 'Out of stock'
  }

  if (Number(selectedVariant.value.quantity || 0) <= Number(selectedVariant.value.lowStockThreshold || 0)) {
    return 'Low stock'
  }

  return 'In stock'
})

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
            :alt="featuredProduct?.name || 'Chicken breast jerky in craft pouch'"
            class="h-full min-h-[340px] w-full object-cover"
          />
        </div>

        <div class="tile-strong flex flex-col justify-center rounded-2xl border border-stone-800 bg-white p-5 md:p-7">
          <p class="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-400">
            Featured treat
          </p>

          <h2 class="mt-2 text-2xl font-extrabold text-[var(--brand-4)] md:text-3xl">
            {{ featuredProduct?.name || 'Chicken Breast Jerky' }}
          </h2>

          <div class="mt-3 flex flex-wrap gap-2">
            <span
              v-for="tag in displayTags"
              :key="tag"
              class="rounded-full bg-[color-mix(in_srgb,var(--brand-2)_88%,white)] px-3 py-1 text-[11px] font-extrabold text-[var(--brand-4)] shadow-sm"
            >
              {{ tag }}
            </span>
          </div>

          <p class="mt-4 text-stone-300">
            {{ featuredProduct?.shortDescription || 'Lean, hand-sliced chicken breast, dehydrated low and slow. That is the whole ingredient list.' }}
          </p>

          <p class="mt-3 text-xs font-semibold uppercase tracking-[0.14em] text-stone-400">
            {{ featuredProduct?.protein || 'Chicken' }}<span v-if="featuredProduct?.cut"> • {{ featuredProduct.cut }}</span>
          </p>

          <ul class="mt-5 grid gap-2 text-sm text-stone-300 sm:grid-cols-2">
            <li class="flex items-center gap-2">
              <i class="fa-regular fa-circle-check text-emerald-400"></i>
              Simple ingredients
            </li>
            <li class="flex items-center gap-2">
              <i class="fa-regular fa-circle-check text-emerald-400"></i>
              Small-batch prepared
            </li>
            <li class="flex items-center gap-2">
              <i class="fa-regular fa-circle-check text-emerald-400"></i>
              Bigger-dog friendly
            </li>
            <li class="flex items-center gap-2">
              <i class="fa-regular fa-circle-check text-emerald-400"></i>
              No unnecessary fillers
            </li>
          </ul>

          <div class="mt-6 rounded-2xl border border-stone-800 bg-[color-mix(in_srgb,var(--brand-5)_55%,white)] p-4">
            <div class="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p class="text-sm font-extrabold text-[var(--brand-4)]">Choose Size</p>
                <div class="mt-3 flex flex-wrap gap-2">
                  <button
                    v-for="variant in variants"
                    :key="variant.size"
                    class="rounded-full border px-4 py-2 text-sm font-extrabold transition"
                    :class="selectedSize === variant.size
                      ? 'border-emerald-400 bg-emerald-400 text-[var(--brand-4)] shadow-sm'
                      : 'border-stone-700 bg-white text-stone-700 hover:border-emerald-400'"
                    @click="selectSize(variant.size)"
                  >
                    {{ variant.size }}
                  </button>
                </div>
              </div>

              <div class="text-right">
                <p class="text-xs font-bold uppercase tracking-[0.12em] text-stone-400">
                  {{ stockLabel }}
                </p>
                <p class="mt-1 text-2xl font-extrabold text-[var(--brand-4)]">
                  {{ formatPrice(selectedPrice) }}
                </p>
              </div>
            </div>
          </div>

          <div class="mt-6 flex flex-wrap items-center gap-3">
            <button
              v-if="isPurchasable"
              class="focus-ring inline-flex items-center gap-2 rounded-lg bg-emerald-400 px-5 py-3 font-semibold text-[var(--brand-4)] hover:bg-emerald-300"
              @click="addFeaturedToCart"
            >
              <i class="fa-solid fa-bag-shopping"></i>
              Add to Cart
            </button>

            <button
              v-else
              class="focus-ring inline-flex items-center gap-2 rounded-lg bg-emerald-400 px-5 py-3 font-semibold text-[var(--brand-4)] hover:bg-emerald-300"
            >
              <i class="fa-solid fa-bell"></i>
              Notify Me
            </button>

            <a href="#catalog" class="inline-flex items-center gap-2 text-sm font-semibold text-emerald-400 hover:underline">
              View all treats
              <i class="fa-solid fa-arrow-right"></i>
            </a>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
