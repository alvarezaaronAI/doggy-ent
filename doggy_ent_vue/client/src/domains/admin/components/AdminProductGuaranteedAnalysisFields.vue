<script setup>
defineProps({
  form: {
    type: Object,
    required: true,
  },
})
</script>

<template>
  <div class="md:col-span-2 rounded-2xl border border-stone-200 bg-white/70 p-4">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h3 class="text-lg font-extrabold text-[var(--brand-4)]">Guaranteed Analysis</h3>
        <p class="mt-1 text-sm text-stone-400">
          Optional. Add this only when you have verified nutrition or lab values ready to show on the storefront.
        </p>
      </div>

      <button
        type="button"
        class="rounded-xl border border-stone-300 bg-white px-4 py-2 text-sm font-bold text-[var(--brand-4)] transition hover:border-emerald-400 hover:bg-emerald-50"
        @click="form.showGuaranteedAnalysis = !form.showGuaranteedAnalysis"
      >
        {{ form.showGuaranteedAnalysis ? 'Remove Analysis' : '+ Add Analysis' }}
      </button>
    </div>

    <div v-if="form.showGuaranteedAnalysis" class="mt-4 grid gap-3 md:grid-cols-2">
      <div>
        <label class="mb-2 block text-sm font-semibold text-[var(--brand-4)]">Crude Protein Min</label>
        <input
          v-model="form.crudeProteinMin"
          type="text"
          class="w-full rounded-2xl border border-stone-700 bg-white px-4 py-3 outline-none"
          placeholder="70%"
        />
      </div>

      <div>
        <label class="mb-2 block text-sm font-semibold text-[var(--brand-4)]">Crude Fat Min</label>
        <input
          v-model="form.crudeFatMin"
          type="text"
          class="w-full rounded-2xl border border-stone-700 bg-white px-4 py-3 outline-none"
          placeholder="4.5%"
        />
      </div>

      <div>
        <label class="mb-2 block text-sm font-semibold text-[var(--brand-4)]">Crude Fiber Max</label>
        <input
          v-model="form.crudeFiberMax"
          type="text"
          class="w-full rounded-2xl border border-stone-700 bg-white px-4 py-3 outline-none"
          placeholder="0.5%"
        />
      </div>

      <div>
        <label class="mb-2 block text-sm font-semibold text-[var(--brand-4)]">Moisture Max</label>
        <input
          v-model="form.moistureMax"
          type="text"
          class="w-full rounded-2xl border border-stone-700 bg-white px-4 py-3 outline-none"
          placeholder="20%"
        />
      </div>
    </div>
  </div>
</template>
