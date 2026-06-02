<script setup>
const props = defineProps({
  items: {
    type: Array,
    default: () => [],
  },
})
</script>

<template>
  <div class="mt-4 rounded-2xl border border-stone-800 bg-white p-4">
    <div class="flex items-start gap-3">
      <i class="fa-solid fa-ban mt-1 text-emerald-400"></i>
      <div class="min-w-0 flex-1">
        <h3 class="font-extrabold">What's Not Inside</h3>
        <div class="mt-3 flex flex-wrap gap-2">
          <span
            v-for="item in items"
            :key="item"
            class="rounded-full bg-[color-mix(in_srgb,var(--brand-5)_70%,white)] px-3 py-1 text-xs font-bold text-[var(--brand-4)]"
          >
            {{ item }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
