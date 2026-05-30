<script setup>
const props = defineProps({
  analysis: {
    type: Object,
    default: () => ({}),
  },
})
</script>

<template>
  <div class="mt-4 rounded-2xl border border-stone-800 bg-white p-4">
    <h3 class="font-extrabold">Guaranteed Analysis</h3>

    <dl class="mt-3 grid grid-cols-2 gap-y-2 text-sm">
      <dt class="text-stone-400">Crude Protein min</dt>
      <dd class="text-right font-semibold">{{ analysis.crudeProteinMin }}</dd>

      <dt class="text-stone-400">Crude Fat min</dt>
      <dd class="text-right font-semibold">{{ analysis.crudeFatMin }}</dd>

      <dt class="text-stone-400">Crude Fiber max</dt>
      <dd class="text-right font-semibold">{{ analysis.crudeFiberMax }}</dd>

      <dt class="text-stone-400">Moisture max</dt>
      <dd class="text-right font-semibold">{{ analysis.moistureMax }}</dd>
    </dl>
  </div>
</template>
