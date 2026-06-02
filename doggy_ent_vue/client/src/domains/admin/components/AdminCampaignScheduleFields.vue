<script setup>
defineProps({
  form: {
    type: Object,
    required: true,
  },
})
</script>

<template>
  <div class="rounded-2xl border border-stone-200 bg-[color-mix(in_srgb,var(--brand-5)_55%,white)] p-4">
    <div>
      <h3 class="font-extrabold text-[var(--brand-4)]">Schedule</h3>
      <p class="mt-1 text-sm text-stone-400">
        Optional. Leave blank for campaigns that remain active until paused or ended.
      </p>
    </div>

    <div class="mt-4 space-y-4">
      <div class="rounded-2xl border border-stone-200 bg-white/80 p-4">
        <div class="flex items-center justify-between gap-3">
          <p class="text-sm font-extrabold text-[var(--brand-4)]">Starts</p>
          <button
            type="button"
            class="text-xs font-bold text-stone-400 transition hover:text-red-500"
            @click="form.startsDate = ''; form.startsTime = ''"
          >
            Clear start
          </button>
        </div>

        <div class="mt-3 grid gap-3">
          <label class="block">
            <span class="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-stone-400">Start date</span>
            <input
              v-model="form.startsDate"
              type="date"
              class="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-base text-slate-900 outline-none focus:border-emerald-400"
            />
          </label>

          <label class="block">
            <span class="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-stone-400">Start time</span>
            <input
              v-model="form.startsTime"
              type="time"
              class="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-base text-slate-900 outline-none focus:border-emerald-400"
            />
          </label>
        </div>
      </div>

      <div class="rounded-2xl border border-stone-200 bg-white/80 p-4">
        <div class="flex items-center justify-between gap-3">
          <p class="text-sm font-extrabold text-[var(--brand-4)]">Ends</p>
          <button
            type="button"
            class="text-xs font-bold text-stone-400 transition hover:text-red-500"
            @click="form.endsDate = ''; form.endsTime = ''"
          >
            Clear end
          </button>
        </div>

        <div class="mt-3 grid gap-3">
          <label class="block">
            <span class="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-stone-400">End date</span>
            <input
              v-model="form.endsDate"
              type="date"
              class="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-base text-slate-900 outline-none focus:border-emerald-400"
            />
          </label>

          <label class="block">
            <span class="mb-2 block text-xs font-semibold uppercase tracking-[0.12em] text-stone-400">End time</span>
            <input
              v-model="form.endsTime"
              type="time"
              class="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-base text-slate-900 outline-none focus:border-emerald-400"
            />
          </label>
        </div>
      </div>
    </div>
  </div>
</template>
