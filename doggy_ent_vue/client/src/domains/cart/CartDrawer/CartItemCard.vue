

<script setup>
import { ref, watch } from 'vue'
import { Minus, Plus, Trash2, Package } from '@lucide/vue'
const props = defineProps({
  item: {
    type: Object,
    required: true,
  },
  isAtMax: {
    type: Function,
    required: true,
  },
  getSellingModeLabel: {
    type: Function,
    required: true,
  },
  getAvailabilityLabel: {
    type: Function,
    required: true,
  },
  formatPrice: {
    type: Function,
    required: true,
  },
  getLineTotal: {
    type: Function,
    required: true,
  },
})

const emit = defineEmits([
  'increase',
  'decrease',
  'remove',
])
const imageFailed = ref(false)
watch(() => props.item.image, () => { imageFailed.value = false })
</script>

<template>
  <article class="border-b border-stone-800 py-5 last:border-b-0">
    <div class="flex gap-3">
      <div class="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-md border border-stone-800 bg-[#f6f3ed]">
        <img
          v-if="props.item.image && !imageFailed"
          class="h-full w-full object-cover"
          :src="props.item.image"
          :alt="props.item.name"
          @error="imageFailed = true"
        />
        <Package v-else :size="28" class="text-[var(--brand-1)]" aria-hidden="true" />
      </div>

      <div class="min-w-0 flex-1">
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <h3 class="font-semibold leading-tight">{{ props.item.name }}</h3>

            <p class="mt-1 flex flex-wrap items-center gap-2 text-sm text-stone-300">
              <span>{{ props.item.size }}</span>

              <span
                v-if="props.item.variant?.sku"
                class="break-all text-[10px] text-stone-500"
              >
                {{ props.item.variant.sku }}
              </span>
            </p>

            <p class="mt-1 text-xs text-stone-400">
              {{ props.getSellingModeLabel(props.item) }} · {{ props.getAvailabilityLabel(props.item) }}
            </p>
          </div>

          <button
            type="button"
            class="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-[#e3d7cd] bg-[#f5f4f1] text-[#6a3c2b] hover:bg-[#ece5df]"
            :aria-label="`Remove ${props.item.name}, ${props.item.size}`"
            title="Remove item"
            @click="emit('remove')"
          >
            <Trash2 :size="16" aria-hidden="true" />
          </button>
        </div>

        <div class="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div class="inline-flex items-center overflow-hidden rounded-md border border-stone-700 bg-[#f5f4f1]">
            <button
              type="button"
              class="inline-flex h-11 w-11 items-center justify-center text-stone-400 hover:bg-white"
              :aria-label="`Decrease quantity of ${props.item.name}, ${props.item.size}`"
              title="Decrease quantity"
              @click="emit('decrease')"
            >
              <Minus :size="16" aria-hidden="true" />
            </button>

            <span class="min-w-[2.5rem] text-center text-sm font-semibold">
              {{ props.item.quantity }}
            </span>

            <button
              type="button"
              class="inline-flex h-11 w-11 items-center justify-center hover:bg-white"
              :aria-label="`Increase quantity of ${props.item.name}, ${props.item.size}`"
              title="Increase quantity"
              :class="props.isAtMax(props.item) ? 'text-stone-300 cursor-not-allowed' : 'text-stone-400 hover:text-emerald-400'"
              :disabled="props.isAtMax(props.item)"
              @click="emit('increase')"
            >
              <Plus :size="16" aria-hidden="true" />
            </button>
          </div>

          <div class="text-right">
            <p class="text-sm text-stone-300">{{ props.formatPrice(props.item.price) }} each</p>
            <p class="font-semibold">{{ props.formatPrice(props.getLineTotal(props.item)) }}</p>
          </div>
        </div>

        <p
          v-if="props.isAtMax(props.item)"
          class="mt-2 text-xs font-semibold text-amber-700"
        >
          Maximum available quantity reached
        </p>
      </div>
    </div>
  </article>
</template>
