<script setup>
defineProps({
  cartItems: {
    type: Array,
    required: true,
  },
  formatPrice: {
    type: Function,
    required: true,
  },
})

function getLineTotal(item) {
  return Number(item.price || 0) * Number(item.quantity || 0)
}
</script>

<template>
  <div v-if="cartItems.length" class="mt-5 space-y-4">
    <article
      v-for="item in cartItems"
      :key="`${item.id}-${item.size}`"
      class="flex gap-3"
    >
      <img
        class="h-[70px] w-[70px] flex-shrink-0 rounded-2xl border border-stone-800 object-cover"
        :src="item.image"
        :alt="item.name"
      />

      <div class="min-w-0 flex-1">
        <div class="flex items-start justify-between gap-3">
          <div>
            <h3 class="font-extrabold leading-tight">{{ item.name }}</h3>
            <p class="mt-1 text-xs leading-relaxed text-stone-300">
              {{ item.size }} • Qty {{ item.quantity }}
            </p>
          </div>

          <p class="font-extrabold">
            {{ formatPrice(getLineTotal(item)) }}
          </p>
        </div>
      </div>
    </article>
  </div>

  <div
    v-else
    class="mt-5 rounded-2xl border border-stone-800 bg-[color-mix(in_srgb,var(--brand-5)_55%,white)] p-4 text-sm text-stone-300"
  >
    Your cart is empty. Return to the shop to add treats before checking out.
  </div>
</template>
