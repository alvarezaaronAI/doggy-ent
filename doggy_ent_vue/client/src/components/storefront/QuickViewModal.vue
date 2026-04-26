<script setup>
import { computed, ref, watch } from 'vue'

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

const sizeOptions = [
  {
    label: '6 oz',
    description: 'Great for trying it out',
    multiplier: 1,
  },
  {
    label: '18 oz',
    description: 'Best value for bigger dogs',
    multiplier: 2.75,
  },
]

const selectedSizeOption = computed(() =>
  sizeOptions.find((option) => option.label === selectedSize.value) || sizeOptions[0]
)

const unitPrice = computed(() => {
  const basePrice = Number(props.product?.price || 0)
  return basePrice * selectedSizeOption.value.multiplier
})

const totalPrice = computed(() => unitPrice.value * quantity.value)

watch(
  () => props.isOpen,
  (isOpen) => {
    if (isOpen) {
      selectedSize.value = '6 oz'
      quantity.value = 1
    }
  }
)

function formatPrice(value) {
  return `$${Number(value).toFixed(2)}`
}

function increaseQuantity() {
  quantity.value += 1
}

function decreaseQuantity() {
  if (quantity.value > 1) {
    quantity.value -= 1
  }
}

function addProductToCart() {
  if (!props.product) return

  emit('add-to-cart', {
    ...props.product,
    size: selectedSize.value,
    price: unitPrice.value,
    quantity: quantity.value,
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

            <p class="mt-3 text-stone-300">
              {{ product.shortDescription }}
            </p>

            <div class="mt-6">
              <div class="flex items-center justify-between gap-3">
                <h3 class="font-extrabold text-[var(--brand-4)]">Choose Size</h3>
                <p class="text-sm text-stone-400">6 oz or 18 oz</p>
              </div>

              <div class="mt-3 grid gap-3 sm:grid-cols-2">
                <button
                  v-for="option in sizeOptions"
                  :key="option.label"
                  class="rounded-2xl border p-4 text-left transition"
                  :class="
                    selectedSize === option.label
                      ? 'border-emerald-400 bg-[color-mix(in_srgb,var(--brand-5)_55%,white)] shadow-md'
                      : 'border-stone-700 bg-white hover:border-emerald-400'
                  "
                  @click="selectedSize = option.label"
                >
                  <div class="flex items-start justify-between gap-3">
                    <div>
                      <p class="font-extrabold">{{ option.label }}</p>
                      <p class="mt-1 text-sm text-stone-300">{{ option.description }}</p>
                    </div>
                    <p class="font-bold text-[var(--brand-4)]">
                      {{ formatPrice(Number(product.price) * option.multiplier) }}
                    </p>
                  </div>
                </button>
              </div>
            </div>

            <div class="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-stone-800 bg-[color-mix(in_srgb,var(--brand-5)_55%,white)] p-4">
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

            <button
              class="focus-ring mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-400 px-5 py-3 font-semibold text-[var(--brand-4)] hover:bg-emerald-300"
              @click="addProductToCart"
            >
              <i class="fa-solid fa-bag-shopping"></i>
              Add {{ quantity }} to Cart
            </button>

            <div class="mt-6 grid gap-4 sm:grid-cols-2">
              <div class="rounded-2xl border border-stone-800 bg-white p-4">
                <h3 class="font-extrabold">Ingredients</h3>
                <p class="mt-2 text-sm text-stone-300">
                  Chicken breast. No salt, no sugar, no glycerin, no preservatives.
                </p>
              </div>

              <div class="rounded-2xl border border-stone-800 bg-white p-4">
                <h3 class="font-extrabold">Perfect For</h3>
                <p class="mt-2 text-sm text-stone-300">
                  Bigger dogs, training rewards, picky pups, and simple-ingredient snack routines.
                </p>
              </div>
            </div>

            <div class="mt-4 rounded-2xl border border-stone-800 bg-white p-4">
              <h3 class="font-extrabold">Guaranteed Analysis</h3>

              <dl class="mt-3 grid grid-cols-2 gap-y-2 text-sm">
                <dt class="text-stone-400">Crude Protein min</dt>
                <dd class="text-right font-semibold">70%</dd>

                <dt class="text-stone-400">Crude Fat min</dt>
                <dd class="text-right font-semibold">4.5%</dd>

                <dt class="text-stone-400">Crude Fiber max</dt>
                <dd class="text-right font-semibold">0.5%</dd>

                <dt class="text-stone-400">Moisture max</dt>
                <dd class="text-right font-semibold">20%</dd>
              </dl>
            </div>

            <div class="mt-4 rounded-2xl border border-stone-800 bg-[color-mix(in_srgb,var(--brand-5)_55%,white)] p-4">
              <h3 class="font-extrabold">Storage & Feeding</h3>
              <p class="mt-2 text-sm text-stone-300">
                Keep sealed in a cool, dry place. Refrigerate after opening for max freshness.
                Treats are intended for intermittent or supplemental feeding only. Always supervise and provide fresh water.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  </Teleport>
</template>
