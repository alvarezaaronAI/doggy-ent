

<script setup>
const props = defineProps({
  customer: {
    type: Object,
    required: true,
  },
  accountProfile: {
    type: Object,
    default: null,
  },
  isSignedIn: {
    type: Boolean,
    default: false,
  },
  profilePrefilled: {
    type: Boolean,
    default: false,
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

        <div
          v-if="isSignedIn"
          class="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-stone-700"
        >
          <p class="font-black text-emerald-800">
            Signed in as {{ accountProfile?.email || props.customer.email }}
          </p>
          <p class="mt-1">
            {{ profilePrefilled ? 'We prefilled safe account details where checkout fields were empty.' : 'Your order will be linked to your account after payment succeeds.' }}
          </p>
        </div>

        <div
          v-else
          class="mt-4 rounded-2xl border border-stone-200 bg-white p-4 text-sm text-stone-700"
        >
          <p class="font-black text-[var(--brand-4)]">
            Checking out as guest
          </p>
          <p class="mt-1">
            Guest checkout is ready. Sign in or create an account for order history and faster future checkout.
          </p>
          <div class="mt-3 flex flex-wrap gap-2">
            <RouterLink class="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-black text-white" to="/account/sign-in">
              Sign in
            </RouterLink>
            <RouterLink class="rounded-lg border border-stone-300 px-3 py-2 text-xs font-black text-stone-700" to="/account/create">
              Create account
            </RouterLink>
          </div>
        </div>

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

        <div v-if="!isSignedIn" class="mt-4 space-y-2">
          <label class="flex items-start gap-2 text-sm text-stone-300">
            <input v-model="props.customer.saveInfo" type="checkbox" class="mt-1" />
            <span>Save my information for faster checkout next time.</span>
          </label>

          <label class="flex items-start gap-2 text-sm text-stone-300">
            <input v-model="props.customer.marketingOptIn" type="checkbox" class="mt-1" />
            <span>Email me exclusive offers, new drops, and rewards updates.</span>
          </label>
        </div>

        <p v-else class="mt-4 text-sm text-stone-300">
          Marketing preferences are managed in your account profile.
        </p>
      </div>
    </div>
  </div>
</template>
