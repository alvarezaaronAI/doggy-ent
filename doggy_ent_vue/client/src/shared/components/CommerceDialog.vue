<script setup>
import { onMounted, onBeforeUnmount, ref, useId } from 'vue'
import { X } from '@lucide/vue'
const props = defineProps({ title: { type: String, required: true }, busy: Boolean, wide: Boolean })
const emit = defineEmits(['close'])
const dialog = ref(null), titleId = useId()
let opener
function close() { if (!props.busy) emit('close') }
onMounted(() => { opener = document.activeElement; dialog.value.showModal() })
onBeforeUnmount(() => { dialog.value?.close(); if (opener?.isConnected) opener.focus() })
</script>
<template>
  <Teleport to="body">
    <dialog ref="dialog" class="commerce-dialog" :class="{ 'commerce-dialog-wide': wide }" role="dialog" aria-modal="true" :aria-labelledby="titleId" @cancel.prevent="close" @click="$event.target === $event.currentTarget && close()">
      <header class="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-stone-200 bg-white px-5 py-4">
        <h2 :id="titleId" class="text-lg font-semibold text-[#6a3c2b]">{{ title }}</h2>
        <button type="button" class="grid h-11 w-11 shrink-0 place-items-center rounded-md border border-stone-200 bg-stone-50" :disabled="busy" aria-label="Close dialog" title="Close" @click="close"><X :size="20" /></button>
      </header>
      <slot />
    </dialog>
  </Teleport>
</template>
<style scoped>
.commerce-dialog { margin: auto; padding: 0; width: calc(100% - 24px); max-width: 520px; max-height: calc(100dvh - 32px); overflow: auto; border: 1px solid #ddd9d3; border-radius: 8px; color: #292d2a; background: white; box-shadow: 0 24px 70px #0003; }
.commerce-dialog-wide { max-width: 1080px; }
.commerce-dialog::backdrop { background: #18231dcc; }
.commerce-dialog :deep(button:focus-visible), .commerce-dialog :deep(a:focus-visible) { outline: 2px solid #315bc5; outline-offset: 2px; }
</style>
