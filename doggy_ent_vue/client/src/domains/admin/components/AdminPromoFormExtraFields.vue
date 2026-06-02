<script setup>
defineProps({
  form: {
    type: Object,
    required: true,
  },
  isReferralPromo: {
    type: Boolean,
    default: false,
  },
  isUniquePromo: {
    type: Boolean,
    default: false,
  },
})
</script>

<template>
  <div class="grid gap-4 md:grid-cols-2">
    <label class="block">
      <span class="mb-2 block text-sm font-semibold text-[var(--brand-4)]">Minimum subtotal</span>
      <input v-model.number="form.minimumSubtotal" type="number" min="0" step="0.01" class="w-full rounded-2xl border border-stone-700 bg-white px-4 py-3 outline-none focus:border-emerald-400" />
    </label>

    <label class="block">
      <span class="mb-2 block text-sm font-semibold text-[var(--brand-4)]">Total usage limit</span>
      <input v-model="form.usageLimitTotal" type="number" min="0" class="w-full rounded-2xl border border-stone-700 bg-white px-4 py-3 outline-none focus:border-emerald-400" placeholder="blank = unlimited" />
    </label>
  </div>

  <div class="grid gap-4 md:grid-cols-2">
    <label class="block">
      <span class="mb-2 block text-sm font-semibold text-[var(--brand-4)]">Per-customer limit</span>
      <input v-model="form.usageLimitPerCustomer" type="number" min="0" class="w-full rounded-2xl border border-stone-700 bg-white px-4 py-3 outline-none focus:border-emerald-400" />
    </label>

    <label
      v-if="isUniquePromo"
      class="block"
    >
      <span class="mb-2 block text-sm font-semibold text-[var(--brand-4)]">Assigned customer email</span>
      <input v-model="form.assignedCustomerEmail" type="email" class="w-full rounded-2xl border border-stone-700 bg-white px-4 py-3 outline-none focus:border-emerald-400" placeholder="for unique codes" />
    </label>
  </div>

  <div
    v-if="isReferralPromo"
    class="rounded-2xl border border-stone-800 bg-[color-mix(in_srgb,var(--brand-5)_55%,white)] p-4"
  >
    <h3 class="font-extrabold text-[var(--brand-4)]">Referral tracking</h3>
    <p class="mt-1 text-sm text-stone-300">
      Optional owner name for influencer, customer, or partner referral codes.
    </p>

    <label class="mt-4 block">
      <span class="mb-2 block text-sm font-semibold text-[var(--brand-4)]">Referral owner</span>
      <input v-model="form.referralOwnerName" class="w-full rounded-2xl border border-stone-700 bg-white px-4 py-3 outline-none focus:border-emerald-400" placeholder="Influencer, customer, partner, etc." />
    </label>
  </div>

  <div class="rounded-2xl border border-stone-200 bg-[color-mix(in_srgb,var(--brand-5)_55%,white)] p-4">
    <div class="flex items-start justify-between gap-3">
      <div>
        <h3 class="font-extrabold text-[var(--brand-4)]">Schedule</h3>
        <p class="mt-1 text-sm text-stone-400">
          Optional. Leave blank for codes that are available until paused, expired, or deleted.
        </p>
      </div>
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
