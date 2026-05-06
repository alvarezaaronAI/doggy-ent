<script setup>
const props = defineProps({
  variant: {
    type: String,
    default: 'default', // 'default' | 'danger'
  },
  size: {
    type: String,
    default: 'md', // 'sm' | 'md'
  },
  ariaLabel: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['click'])

function onClick(e) {
  emit('click', e)
}

const base = 'inline-flex items-center justify-center rounded-full transition'

const sizeClass = props.size === 'sm'
  ? 'h-7 w-7'
  : 'h-8 w-8'

const variantClass = props.variant === 'danger'
  ? 'bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-700'
  : 'text-stone-400 hover:bg-[color-mix(in_srgb,var(--brand-5)_70%,white)] hover:text-emerald-400'
</script>

<template>
  <button
    :aria-label="ariaLabel"
    :class="[base, sizeClass, variantClass]"
    @click="onClick"
  >
    <slot />
  </button>
</template>
