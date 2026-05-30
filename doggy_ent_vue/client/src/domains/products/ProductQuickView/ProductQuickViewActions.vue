<script setup>
const props = defineProps({
  isPurchasable: {
    type: Boolean,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
})

const emit = defineEmits(['add-to-cart', 'notify'])
</script>

<template>
  <button
    v-if="isPurchasable"
    class="focus-ring mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-400 px-5 py-3 font-semibold text-[var(--brand-4)] hover:bg-emerald-300"
    @click="emit('add-to-cart')"
  >
    <i class="fa-solid fa-bag-shopping"></i>
    Add {{ quantity }} to Cart
  </button>

  <button
    v-else
    class="focus-ring mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-400 px-5 py-3 font-semibold text-[var(--brand-4)] hover:bg-emerald-300"
    @click="emit('notify')"
  >
    <i class="fa-solid fa-bell"></i>
    Notify Me When Available
  </button>
</template>
