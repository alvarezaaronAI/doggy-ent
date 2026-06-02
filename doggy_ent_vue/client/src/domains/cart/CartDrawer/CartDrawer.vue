<script setup>
import {
  getSellingMode,
  canIgnoreInventory,
} from '@shared/constants/sellingMode'

import CartItemCard from '@cart/CartDrawer/CartItemCard.vue'
import CartEmptyState from '@cart/CartDrawer/CartEmptyState.vue'
import CartSummary from '@cart/CartDrawer/CartSummary.vue'

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

function getLineTotal(item) {
  return Number(item.price || 0) * Number(item.quantity || 0)
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
      v-if="props.isOpen"
      class="fixed inset-0 z-[100] bg-black/40"
      @click="emit('close')"
    ></div>

    <aside
      class="fixed right-0 top-0 z-[110] flex h-dvh w-full max-w-[420px] flex-col overflow-hidden border-l border-stone-800 bg-white shadow-2xl transition-transform duration-300 ease-out"
      :class="props.isOpen ? 'translate-x-0' : 'translate-x-full'"
      :aria-hidden="!props.isOpen"
      aria-labelledby="cart-title"
    >
      <div class="flex items-center justify-between border-b border-stone-800 px-5 py-4">
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-400">
            Your Cart
          </p>
          <h2 id="cart-title" class="text-2xl font-extrabold">Bag Summary</h2>
          <p class="mt-1 text-sm text-stone-300">
            {{ props.itemCount }} {{ props.itemCount === 1 ? 'item' : 'items' }} ready for checkout
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

      <CartEmptyState
        v-if="!props.cartItems.length"
        @continue-shopping="emit('continue-shopping')"
      />

      <div v-else class="flex min-h-0 flex-1 flex-col">
        <div class="min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-5">
          <CartItemCard
            v-for="item in props.cartItems"
            :key="`${item.id}-${item.size}`"
            :item="item"
            :is-at-max="isAtMax"
            :get-selling-mode-label="getSellingModeLabel"
            :get-availability-label="getAvailabilityLabel"
            :format-price="formatPrice"
            :get-line-total="getLineTotal"
            @increase="emit('increase', item.id, item.size)"
            @decrease="emit('decrease', item.id, item.size)"
            @remove="emit('remove', item.id, item.size)"
          />
        </div>

        <CartSummary
          :subtotal="props.subtotal"
          :item-count="props.itemCount"
          :format-price="formatPrice"
          @close="emit('close')"
          @continue-shopping="emit('continue-shopping')"
        />
      </div>
    </aside>
  </Teleport>
</template>
