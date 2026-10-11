<script setup>
import { onMounted, onBeforeUnmount, ref } from 'vue'
import { ChevronDown } from '@lucide/vue'
defineProps({ total: String, itemCount: Number })
const details = ref(null)
let observer, desktop
onMounted(() => {
  observer = new ResizeObserver(entries => {
    const next = entries[0].contentRect.width >= 900
    if (desktop === undefined || next && desktop !== next) details.value.open = true
    desktop = next
  })
  observer.observe(details.value.closest('.checkout-ui'))
})
onBeforeUnmount(() => observer?.disconnect())
</script>
<template>
  <details ref="details" open class="checkout-disclosure">
    <summary class="flex cursor-pointer list-none items-center justify-between gap-3 rounded-md border border-stone-200 bg-white p-4 text-sm font-semibold"><span>Your bag · {{ itemCount }} {{ itemCount === 1 ? 'item' : 'items' }}</span><span class="flex items-center gap-3">{{ total }}<ChevronDown :size="16" /></span></summary>
    <div class="mt-4"><slot /></div>
  </details>
</template>
<style scoped>
summary::-webkit-details-marker { display: none; }
@container (min-width: 900px) { summary { display: none; } details > div { margin-top: 0; } }
</style>
