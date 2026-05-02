<script setup>
import {
  getSellingMode,
  canIgnoreInventory,
} from '../../utils/sellingMode'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  cartItems: {
    type: Array,
    default: () => [],
  },
  subtotal: {
    type: Number,
    default: 0,
  },
  itemCount: {
    type: Number,
    default: 0,
  },
})

const emit = defineEmits([
  'close',
  'increase',
  'decrease',
  'remove',
  'continue-shopping',
])

function formatPrice(value) {
  return `$${Number(value).toFixed(2)}`
}


function isAtMax(item) {
  if (canIgnoreInventory(item)) return false
  return Number(item.quantity) >= Number(item.availableQuantity || 0)
}

function getSellingModeLabel(item) {
  const mode = getSellingMode(item)

  if (mode === 'made-to-order') return 'Made fresh to order'
  if (mode === 'preorder') return 'Preorder item'

  return 'In-stock item'
}

function getAvailabilityLabel(item) {
  if (canIgnoreInventory(item)) return 'No limit'

  const availableQuantity = Number(item.availableQuantity || 0)
  if (availableQuantity <= 0) return 'No longer available'

  return `${availableQuantity} available`
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-[100] bg-black/40"
      @click="emit('close')"
    ></div>

    <aside
      class="fixed right-0 top-0 z-[110] flex h-dvh w-full max-w-[420px] flex-col overflow-hidden border-l border-stone-800 bg-white shadow-2xl transition-transform duration-300 ease-out"
      :class="isOpen ? 'translate-x-0' : 'translate-x-full'"
      :aria-hidden="!isOpen"
      aria-labelledby="cart-title"
    >
      <div class="flex items-center justify-between border-b border-stone-800 px-5 py-4">
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-400">
            Your Cart
          </p>
          <h2 id="cart-title" class="text-2xl font-extrabold">Bag Summary</h2>
          <p class="mt-1 text-sm text-stone-300">
            {{ itemCount }} {{ itemCount === 1 ? 'item' : 'items' }} ready for checkout
          </p>
        </div>

        <button
          class="inline-flex h-10 w-10 items-center justify-center rounded-full border border-stone-700 text-stone-400 hover:border-emerald-400"
          aria-label="Close cart"
          @click="emit('close')"
        >
          ✕
        </button>
      </div>

      <div
        v-if="!cartItems.length"
        class="flex flex-1 flex-col items-center justify-center px-6 text-center"
      >
        <div class="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--brand-2)_50%,white)] text-2xl text-[var(--brand-4)] shadow-sm">
          🛍️
        </div>

        <h3 class="text-xl font-bold">Your cart is empty</h3>

        <p class="mt-2 max-w-xs text-sm text-stone-300">
          Add a treat to see your order slide in from the right side.
        </p>

        <button
          class="focus-ring mt-5 inline-flex items-center gap-2 rounded-lg bg-emerald-400 px-5 py-3 font-semibold text-[var(--brand-4)] hover:bg-emerald-300"
          @click="emit('continue-shopping')"
        >
          Shop Treats
        </button>
      </div>

      <div v-else class="flex min-h-0 flex-1 flex-col">
        <div class="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-5">
          <article
            v-for="item in cartItems"
            :key="`${item.id}-${item.size}`"
            class="tile rounded-2xl p-4 transition hover:-translate-y-1 hover:shadow-2xl hover:scale-[1.01]"
          >
            <div class="flex gap-4">
              <img
                class="h-20 w-20 flex-shrink-0 rounded-2xl border border-stone-800 object-cover shadow-sm"
                :src="item.image"
                :alt="item.name"
              />

              <div class="min-w-0 flex-1">
                <div class="flex items-start justify-between gap-3">
                  <div>
                    <h3 class="font-semibold leading-tight">{{ item.name }}</h3>
                    <p class="mt-1 text-sm text-stone-300">{{ item.size }}</p>
                    <p class="mt-1 text-xs text-stone-400">
                      {{ getSellingModeLabel(item) }} · {{ getAvailabilityLabel(item) }}
                    </p>
                  </div>

                  <button
                    class="inline-flex h-8 w-8 items-center justify-center rounded-full bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-700 transition"
                    :aria-label="`Remove ${item.name}`"
                    @click="emit('remove', item.id, item.size)"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 6l12 12M6 18L18 6" />
                    </svg>
                  </button>
                </div>

                <div class="mt-4 flex items-center justify-between gap-3">
                  <div class="inline-flex items-center overflow-hidden rounded-full border border-stone-700 bg-white shadow-sm">
                    <button
                      class="inline-flex h-9 w-9 items-center justify-center text-stone-400 hover:text-emerald-400"
                      @click="emit('decrease', item.id, item.size)"
                    >
                      -
                    </button>

                    <span class="min-w-[2.5rem] text-center text-sm font-semibold">
                      {{ item.quantity }}
                    </span>

                    <button
                      class="inline-flex h-9 w-9 items-center justify-center"
                      :class="isAtMax(item) ? 'text-stone-300 cursor-not-allowed' : 'text-stone-400 hover:text-emerald-400'"
                      :disabled="isAtMax(item)"
                      @click="emit('increase', item.id, item.size)"
                    >
                      +
                    </button>
                  </div>

                  <div class="text-right">
                    <p class="text-sm text-stone-300">{{ formatPrice(item.price) }} each</p>
                    <p class="font-semibold">{{ formatPrice(item.price * item.quantity) }}</p>
                  </div>
                </div>
                <p
                  v-if="isAtMax(item)"
                  class="mt-2 rounded-xl bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700"
                >
                  Maximum available quantity reached
                </p>
              </div>
            </div>
          </article>
        </div>

        <div class="border-t border-stone-800 bg-[color-mix(in_srgb,var(--brand-5)_62%,white)] px-5 py-5 shadow-[0_-12px_32px_rgba(41,31,24,0.06)]">
          <div class="space-y-3 text-sm">
            <div class="flex items-center justify-between">
              <span class="text-stone-300">Items</span>
              <span class="font-semibold text-stone-900">{{ itemCount }}</span>
            </div>

            <div class="flex items-center justify-between">
              <span class="text-stone-300">Subtotal</span>
              <span class="font-semibold text-stone-900">{{ formatPrice(subtotal) }}</span>
            </div>

            <div class="flex items-center justify-between">
              <span class="text-stone-300">Shipping</span>
              <span class="font-semibold text-stone-900">Calculated at checkout</span>
            </div>

            <div class="rounded-2xl border border-stone-800 bg-white/70 p-3 text-xs leading-relaxed text-stone-500">
              Fresh orders, preorder items, and made-to-order treats may have different prep times before shipping.
            </div>
          </div>

          <div class="my-4 h-px bg-[color-mix(in_srgb,var(--brand-3)_30%,white)]"></div>

          <RouterLink
            to="/checkout"
            class="focus-ring inline-flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-400 px-5 py-3 text-center font-semibold text-[var(--brand-4)] hover:bg-emerald-300"
            @click="emit('close')"
          >
            🔒 Secure Checkout
          </RouterLink>
          <p class="mt-2 text-center text-xs text-stone-400">
            Taxes and shipping are finalized at checkout.
          </p>

          <button
            class="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-emerald-400 px-5 py-3 text-emerald-400 hover:bg-stone-900"
            @click="emit('continue-shopping')"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </aside>
  </Teleport>
</template>
