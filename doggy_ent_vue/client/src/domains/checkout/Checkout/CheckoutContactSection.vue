

<script setup>
const props = defineProps({
  customer: {
    type: Object,
    required: true,
  },
})
</script>

<template>
  <div class="rounded-2xl border border-stone-800 bg-[color-mix(in_srgb,white_88%,var(--brand-5))] p-5">
    <div class="flex gap-4">
      <span class="inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-emerald-400 font-extrabold text-[var(--brand-4)]">1</span>

      <div class="min-w-0 flex-1">
        <h3 class="text-xl font-extrabold">Contact</h3>
        <p class="mt-1 text-xs leading-relaxed text-stone-300">We’ll send your confirmation and shipping updates here.</p>

        <div class="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
          <label class="md:col-span-2">
            <span class="mb-2 block text-xs font-extrabold uppercase tracking-[0.08em] text-[var(--brand-4)]">Email address</span>
            <input v-model="props.customer.email" type="email" class="w-full rounded-2xl border border-stone-700 bg-white px-4 py-3 outline-none focus:border-emerald-400" placeholder="you@example.com" />
          </label>

          <label>
            <span class="mb-2 block text-xs font-extrabold uppercase tracking-[0.08em] text-[var(--brand-4)]">Phone number</span>
            <input v-model="props.customer.phone" type="tel" class="w-full rounded-2xl border border-stone-700 bg-white px-4 py-3 outline-none focus:border-emerald-400" placeholder="(555) 555-5555" />
          </label>

          <label>
            <span class="mb-2 block text-xs font-extrabold uppercase tracking-[0.08em] text-[var(--brand-4)]">Delivery notes</span>
            <input v-model="props.customer.deliveryNotes" type="text" class="w-full rounded-2xl border border-stone-700 bg-white px-4 py-3 outline-none focus:border-emerald-400" placeholder="Gate code, apartment, etc." />
          </label>
        </div>

        <div class="mt-4 space-y-2">
          <label class="flex items-start gap-2 text-sm text-stone-300">
            <input v-model="props.customer.saveInfo" type="checkbox" class="mt-1" />
            <span>Save my information for faster checkout next time.</span>
          </label>

          <label class="flex items-start gap-2 text-sm text-stone-300">
            <input v-model="props.customer.marketingOptIn" type="checkbox" class="mt-1" />
            <span>Email me exclusive offers, new drops, and rewards updates.</span>
          </label>
        </div>
      </div>
    </div>
  </div>
</template>