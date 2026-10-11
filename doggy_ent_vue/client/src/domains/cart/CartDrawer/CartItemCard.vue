<script setup>
import { Minus, Plus, Trash2 } from '@lucide/vue'
import CommerceItemCard from '@shared/components/CommerceItemCard.vue'
defineProps({ item: { type: Object, required: true }, campaigns: { type: Array, default: () => [] }, isAtMax: Function, getSellingModeLabel: Function, getAvailabilityLabel: Function, formatPrice: Function, getLineTotal: Function })
defineEmits(['increase', 'decrease', 'remove'])
</script>
<template>
  <CommerceItemCard :item="item" :campaigns="campaigns" :format-price="formatPrice" class="my-4">
    <template #details><p class="mt-1 text-xs text-stone-600">{{ getSellingModeLabel(item) }} · {{ getAvailabilityLabel(item) }}</p></template>
    <template #actions>
      <div class="mt-3 flex flex-wrap items-center justify-between gap-2">
        <div class="inline-flex overflow-hidden rounded-md border border-stone-300 bg-white">
          <button type="button" class="grid h-11 w-11 place-items-center hover:bg-stone-100" :aria-label="`Decrease quantity of ${item.name}, ${item.size}`" title="Decrease quantity" @click="$emit('decrease')"><Minus :size="16" /></button>
          <span class="grid min-w-10 place-items-center text-sm font-semibold">{{ item.quantity }}</span>
          <button type="button" class="grid h-11 w-11 place-items-center hover:bg-stone-100 disabled:opacity-40" :disabled="isAtMax(item)" :aria-label="`Increase quantity of ${item.name}, ${item.size}`" title="Increase quantity" @click="$emit('increase')"><Plus :size="16" /></button>
        </div>
        <button type="button" class="grid h-11 w-11 place-items-center rounded-md border border-stone-300 bg-white" :aria-label="`Remove ${item.name}, ${item.size}`" title="Remove item" @click="$emit('remove')"><Trash2 :size="16" /></button>
      </div>
      <p v-if="isAtMax(item)" class="mt-2 text-xs font-semibold text-amber-700">Maximum available quantity reached</p>
    </template>
  </CommerceItemCard>
</template>
