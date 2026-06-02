<script setup>
const props = defineProps({
  product: {
    type: Object,
    required: true,
  },
  variants: {
    type: Array,
    default: () => [],
  },
  selectedSize: {
    type: String,
    default: '',
  },
})

const emit = defineEmits([
  'select-size',
])
</script>

<template>
  <div class="flex items-center gap-2">
    <button
      v-for="variant in props.variants"
      :key="variant.size"
      class="rounded-full border px-3 py-1 text-xs font-extrabold transition"
      :class="props.selectedSize === variant.size
        ? 'border-emerald-400 bg-emerald-400 text-[var(--brand-4)]'
        : 'border-stone-700 bg-white text-stone-700 hover:border-emerald-400'"
      @click.stop="emit('select-size', variant.size)"
    >
      {{ variant.size }}
    </button>
  </div>
</template>
