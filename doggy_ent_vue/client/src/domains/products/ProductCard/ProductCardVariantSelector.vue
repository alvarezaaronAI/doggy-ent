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

const emit = defineEmits(['select-size'])
</script>

<template>
  <div>
    <p class="mb-2 text-xs store-muted">Bag size</p>
    <div
      class="flex flex-wrap items-center gap-2"
      role="group"
      :aria-label="`${product.name} bag size`"
    >
      <button
        v-for="variant in props.variants"
        :key="variant.size"
        type="button"
        class="store-size"
        :aria-pressed="props.selectedSize === variant.size"
        @click.stop="emit('select-size', variant.size)"
      >
        {{ variant.size }}
      </button>
    </div>
  </div>
</template>
