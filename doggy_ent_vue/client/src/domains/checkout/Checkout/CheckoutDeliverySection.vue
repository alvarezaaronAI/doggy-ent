

<script setup>
defineProps({
  selectedShipping: {
    type: String,
    required: true,
  },
  shippingOptions: {
    type: Array,
    required: true,
  },
  formatPrice: {
    type: Function,
    required: true,
  },
})

const emit = defineEmits([
  'update:selectedShipping',
])

function updateSelectedShipping(value) {
  emit('update:selectedShipping', value)
}
</script>

<template>
  <div class="rounded-2xl border border-stone-800 bg-[color-mix(in_srgb,white_88%,var(--brand-5))] p-5">
    <div class="flex gap-4">
      <span class="inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-emerald-400 font-extrabold text-[var(--brand-4)]">
        3
      </span>

      <div class="min-w-0 flex-1">
        <h3 class="text-xl font-extrabold">Delivery</h3>
        <p class="mt-1 text-xs leading-relaxed text-stone-300">
          Choose the shipping method that works best for your timeline.
        </p>

        <div class="mt-5 space-y-3">
          <label
            v-for="option in shippingOptions"
            :key="option.code"
            class="flex cursor-pointer items-start justify-between gap-4 rounded-2xl border p-4 transition hover:-translate-y-0.5"
            :class="selectedShipping === option.code ? 'border-emerald-400 bg-[color-mix(in_srgb,white_92%,var(--brand-5))] shadow-md' : 'border-stone-800 bg-white'"
          >
            <input
              class="sr-only"
              type="radio"
              :checked="selectedShipping === option.code"
              :value="option.code"
              @change="updateSelectedShipping(option.code)"
            />

            <div>
              <p class="font-extrabold">{{ option.label }}</p>
              <p class="mt-1 text-xs leading-relaxed text-stone-300">
                {{ option.description }}
              </p>
            </div>

            <div class="font-extrabold">
              {{ formatPrice(option.price) }}
            </div>
          </label>
        </div>
      </div>
    </div>
  </div>
</template>