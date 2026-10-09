<script setup>
import { Pencil } from '@lucide/vue'
defineProps({
  sectionKey: String,
  label: String,
  editable: Boolean,
  selected: Boolean,
})
const emit = defineEmits(['select'])
</script>
<template>
  <section
    class="store-section campaign-section"
    :class="{ 'campaign-section-selected': editable && selected }"
  >
    <button
      v-if="editable"
      type="button"
      data-campaign-edit
      class="campaign-edit-button"
      :aria-label="'Edit ' + label"
      :aria-pressed="selected"
      @click="emit('select', sectionKey)"
    >
      <Pencil :size="15" /> {{ label }}
    </button>
    <slot />
  </section>
</template>
<style scoped>
.campaign-section {
  position: relative;
}
.campaign-section-selected {
  outline: 2px solid var(--brand-1);
  outline-offset: -2px;
}
.campaign-edit-button {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 5;
  display: flex;
  align-items: center;
  gap: 6px;
  min-height: 36px;
  border: 1px solid #bcc9bc;
  border-radius: 4px;
  padding: 6px 10px;
  background: #fff;
  color: #17634c;
  font-size: 12px;
}
</style>
