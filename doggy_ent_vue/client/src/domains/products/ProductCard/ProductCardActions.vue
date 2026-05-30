<script setup>
const props = defineProps({
  product: {
    type: Object,
    required: true,
  },
  isPurchasable: {
    type: Boolean,
    required: true,
  },
})

const emit = defineEmits([
  'quick-view',
  'add-to-cart',
])
</script>

<template>
  <div class="mt-auto flex items-center justify-between gap-2 pt-5">
    <button
      class="rounded-lg border border-stone-700 px-4 py-2 font-semibold text-stone-700 transition hover:border-emerald-400 hover:text-emerald-400"
      @click.stop="emit('quick-view', props.product)"
    >
      Quick View
    </button>

    <button
      v-if="props.isPurchasable"
      class="focus-ring rounded-lg bg-emerald-400 px-4 py-2 font-semibold text-[var(--brand-4)] hover:bg-emerald-300"
      @click.stop="emit('add-to-cart', props.product)"
    >
      Add to Cart
    </button>

    <button
      v-else
      class="focus-ring rounded-lg bg-emerald-400 px-4 py-2 font-semibold text-[var(--brand-4)] hover:bg-emerald-300"
      @click.stop="emit('quick-view', props.product)"
    >
      Notify Me
    </button>
  </div>
</template>
