<script setup>
import { ref } from 'vue'
import { X } from '@lucide/vue'
import { useCartDrawerDialog } from '@cart/composables/useCartDrawerDialog'
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

const dialog = ref(null)
const { onKeydown } = useCartDrawerDialog({
  isOpen: () => props.isOpen,
  dialog,
  close: () => emit('close'),
})

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
      aria-hidden="true"
      @click="emit('close')"
    ></div>

    <aside
      id="cart-drawer"
      ref="dialog"
      class="cart-drawer-ui fixed right-0 top-0 z-[110] flex h-dvh w-full max-w-[420px] flex-col overflow-hidden border-l border-stone-800 bg-white shadow-2xl transition-transform duration-300 ease-out motion-reduce:transition-none"
      :class="props.isOpen ? 'translate-x-0' : 'translate-x-full'"
      :aria-hidden="!props.isOpen"
      :inert="!props.isOpen"
      role="dialog"
      :aria-modal="props.isOpen ? true : undefined"
      aria-labelledby="cart-title"
      tabindex="-1"
      @keydown="onKeydown"
    >
      <div
        class="cart-drawer-header flex shrink-0 items-center justify-between border-b border-stone-800 bg-white px-5 py-4"
      >
        <div>
          <p
            class="text-xs font-semibold uppercase text-[var(--brand-1)]"
          >
            Your Cart
          </p>
          <h2 id="cart-title" class="text-2xl font-extrabold">Bag Summary</h2>
          <p class="mt-1 text-sm text-stone-300">
            {{ props.itemCount }}
            {{ props.itemCount === 1 ? 'item' : 'items' }} ready for checkout
          </p>
        </div>

        <button
          type="button"
          class="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-stone-700 bg-[#f4f4f2] text-stone-400 hover:border-emerald-400"
          aria-label="Close cart"
          title="Close cart"
          @click="emit('close')"
        >
          <X :size="20" aria-hidden="true" />
        </button>
      </div>

      <CartEmptyState
        v-if="!props.cartItems.length"
        @continue-shopping="emit('continue-shopping')"
      />

      <div v-else class="cart-drawer-content flex min-h-0 flex-1 flex-col">
        <div class="cart-drawer-items min-h-0 flex-1 overflow-y-auto overscroll-contain px-5">
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

<style scoped>
.cart-drawer-ui {
  --brand-1: var(--storefront-brand-1);
  --brand-2: var(--storefront-brand-2);
  --brand-3: var(--storefront-brand-3);
  --brand-4: var(--storefront-brand-4);
  --brand-5: var(--storefront-brand-5);
  color: #27342d;
}
.cart-drawer-ui :deep(h2),
.cart-drawer-ui :deep(h3) {
  color: var(--brand-4);
  overflow-wrap: anywhere;
}
.cart-drawer-ui :deep(button:hover) {
  transform: none;
  box-shadow: none;
}
.cart-drawer-ui :deep(button:focus-visible),
.cart-drawer-ui :deep(a:focus-visible) {
  outline: 2px solid var(--brand-1);
  outline-offset: 3px;
}
.cart-drawer-ui :deep(a:hover) {
  opacity: 1;
}
@media (max-height: 520px) {
  .cart-drawer-ui {
    overflow-y: auto;
    overscroll-behavior: contain;
  }
  .cart-drawer-header {
    position: sticky;
    top: 0;
    z-index: 1;
  }
  .cart-drawer-content,
  .cart-drawer-items {
    flex: none;
  }
  .cart-drawer-items {
    overflow: visible;
  }
}
</style>
