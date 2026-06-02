
<script setup>
defineProps({
  customer: {
    type: Object,
    required: true,
  },
})
</script>

<template>
  <div class="rounded-2xl border border-stone-800 bg-[color-mix(in_srgb,white_88%,var(--brand-5))] p-5">
    <div class="flex gap-4">
      <span class="inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-emerald-400 font-extrabold text-[var(--brand-4)]">
        2
      </span>

      <div class="min-w-0 flex-1">
        <h3 class="text-xl font-extrabold">Shipping</h3>
        <p class="mt-1 text-xs leading-relaxed text-stone-300">
          Enter the shipping address where you’d like your order delivered.
        </p>

        <div class="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
          <input
            v-model="customer.firstName"
            class="rounded-2xl border border-stone-700 bg-white px-4 py-3 outline-none focus:border-emerald-400"
            placeholder="First name"
          />

          <input
            v-model="customer.lastName"
            class="rounded-2xl border border-stone-700 bg-white px-4 py-3 outline-none focus:border-emerald-400"
            placeholder="Last name"
          />

          <input
            v-model="customer.address1"
            class="rounded-2xl border border-stone-700 bg-white px-4 py-3 outline-none focus:border-emerald-400 md:col-span-2"
            placeholder="Street address"
          />

          <input
            v-model="customer.address2"
            class="rounded-2xl border border-stone-700 bg-white px-4 py-3 outline-none focus:border-emerald-400 md:col-span-2"
            placeholder="Apartment, suite, etc. Optional"
          />

          <input
            v-model="customer.city"
            class="rounded-2xl border border-stone-700 bg-white px-4 py-3 outline-none focus:border-emerald-400"
            placeholder="City"
          />

          <select
            v-model="customer.state"
            class="rounded-2xl border border-stone-700 bg-white px-4 py-3 outline-none focus:border-emerald-400"
          >
            <option value="">Select state</option>
            <option value="CA">California</option>
            <option value="NV">Nevada</option>
            <option value="AZ">Arizona</option>
            <option value="OR">Oregon</option>
          </select>

          <input
            v-model="customer.zip"
            class="rounded-2xl border border-stone-700 bg-white px-4 py-3 outline-none focus:border-emerald-400"
            placeholder="ZIP code"
          />

          <select
            v-model="customer.country"
            class="rounded-2xl border border-stone-700 bg-white px-4 py-3 outline-none focus:border-emerald-400"
          >
            <option value="US">United States</option>
            <option value="CA">Canada</option>
          </select>
        </div>
      </div>
    </div>
  </div>
</template>