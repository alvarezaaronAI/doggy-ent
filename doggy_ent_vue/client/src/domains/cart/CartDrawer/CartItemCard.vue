

<script setup>
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
</script>

<template>
  <article class="tile rounded-2xl p-4 transition hover:-translate-y-1 hover:shadow-2xl hover:scale-[1.01]">
    <div class="flex gap-4">
      <img
        class="h-20 w-20 flex-shrink-0 rounded-2xl border border-stone-800 object-cover shadow-sm"
        :src="props.item.image"
        :alt="props.item.name"
      />

      <div class="min-w-0 flex-1">
        <div class="flex items-start justify-between gap-3">
          <div>
            <h3 class="font-semibold leading-tight">{{ props.item.name }}</h3>

            <p class="mt-1 flex flex-wrap items-center gap-2 text-sm text-stone-300">
              <span>{{ props.item.size }}</span>

              <span
                v-if="props.item.variant?.sku"
                class="rounded-full bg-stone-100 px-2 py-1 text-[10px] font-bold tracking-[0.08em] text-stone-500"
              >
                {{ props.item.variant.sku }}
              </span>
            </p>

            <p class="mt-1 text-xs text-stone-400">
              {{ props.getSellingModeLabel(props.item) }} · {{ props.getAvailabilityLabel(props.item) }}
            </p>
          </div>

          <button
            class="inline-flex h-8 w-8 items-center justify-center rounded-full bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-700 transition"
            :aria-label="`Remove ${props.item.name}`"
            @click="emit('remove')"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 6l12 12M6 18L18 6" />
            </svg>
          </button>
        </div>

        <div class="mt-4 flex items-center justify-between gap-3">
          <div class="inline-flex items-center overflow-hidden rounded-full border border-stone-700 bg-white shadow-sm">
            <button
              class="inline-flex h-9 w-9 items-center justify-center text-stone-400 hover:text-emerald-400"
              @click="emit('decrease')"
            >
              -
            </button>

            <span class="min-w-[2.5rem] text-center text-sm font-semibold">
              {{ props.item.quantity }}
            </span>

            <button
              class="inline-flex h-9 w-9 items-center justify-center"
              :class="props.isAtMax(props.item) ? 'text-stone-300 cursor-not-allowed' : 'text-stone-400 hover:text-emerald-400'"
              :disabled="props.isAtMax(props.item)"
              @click="emit('increase')"
            >
              +
            </button>
          </div>

          <div class="text-right">
            <p class="text-sm text-stone-300">{{ props.formatPrice(props.item.price) }} each</p>
            <p class="font-semibold">{{ props.formatPrice(props.getLineTotal(props.item)) }}</p>
          </div>
        </div>

        <p
          v-if="props.isAtMax(props.item)"
          class="mt-2 rounded-xl bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700"
        >
          Maximum available quantity reached
        </p>
      </div>
    </div>
  </article>
</template>