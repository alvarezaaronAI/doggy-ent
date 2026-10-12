<script setup>
import { Plus, Trash2, ArrowUp, ArrowDown } from '@lucide/vue'
const props = defineProps({ links: { type: Array, required: true } })
function move(index, offset) {
  const next = index + offset
  if (next < 0 || next >= props.links.length) return
  const [item] = props.links.splice(index, 1); props.links.splice(next, 0, item)
}
</script>
<template>
  <section class="space-y-4">
    <h3>Navigation links</h3>
    <div v-for="(link, index) in links" :key="index" class="space-y-2 border-b border-[var(--admin-line)] pb-4">
      <label class="admin-field">Link {{ index + 1 }} label<input v-model="link.label" maxlength="80" /></label>
      <label class="admin-field">Destination<input v-model="link.href" placeholder="/#shop or https://..." maxlength="1200" /></label>
      <div class="flex gap-2">
        <button type="button" class="admin-button" :disabled="index === 0" :aria-label="'Move link ' + (index + 1) + ' up'" title="Move up" @click="move(index, -1)"><ArrowUp :size="16" /></button>
        <button type="button" class="admin-button" :disabled="index === links.length - 1" :aria-label="'Move link ' + (index + 1) + ' down'" title="Move down" @click="move(index, 1)"><ArrowDown :size="16" /></button>
        <button type="button" class="admin-button" :aria-label="'Remove link ' + (index + 1)" title="Remove link" @click="links.splice(index, 1)"><Trash2 :size="16" /></button>
      </div>
    </div>
    <button type="button" class="admin-button" :disabled="links.length >= 12" @click="links.push({ label: 'New link', href: '/#shop' })"><Plus :size="16" />Add link</button>
  </section>
</template>
