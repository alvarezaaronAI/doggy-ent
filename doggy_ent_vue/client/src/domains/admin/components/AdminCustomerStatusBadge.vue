<template>
  <span
    class="inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.14em]"
    :class="badgeClass"
  >
    {{ status }}
  </span>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  status: {
    type: String,
    required: true,
  },
})

const badgeClass = computed(() =>
  props.status === 'ACTIVE'
    ? 'bg-emerald-50 text-emerald-700'
    : 'bg-stone-100 text-stone-600',
)
</script>
