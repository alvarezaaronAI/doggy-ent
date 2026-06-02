

<script setup>
const props = defineProps({
  checklist: {
    type: Array,
    default: () => [],
  },
})
</script>

<template>
  <aside class="hidden xl:sticky xl:top-24 xl:block xl:self-start xl:max-w-[220px]">
    <section class="section-panel p-5">
      <div class="flex items-center justify-between gap-3">
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-400">
            Checkout Progress
          </p>

          <h2 class="mt-1 text-lg font-extrabold leading-tight">
            Before checkout
          </h2>
        </div>

        <span class="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--brand-5)_72%,white)] text-[var(--brand-4)]">
          <i class="fa-solid fa-list-check"></i>
        </span>
      </div>

      <div class="mt-5 space-y-3">
        <div
          v-for="item in props.checklist"
          :key="item.id"
          class="flex items-center gap-3 rounded-2xl border px-3 py-3 transition"
          :class="item.complete
            ? 'border-emerald-200 bg-emerald-50/70'
            : 'border-stone-700 bg-[color-mix(in_srgb,var(--brand-5)_55%,white)]'
          "
        >
          <span
            class="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm"
            :class="item.complete
              ? 'bg-emerald-400 text-[var(--brand-4)]'
              : 'bg-stone-200 text-stone-500'
            "
          >
            <i
              :class="item.complete
                ? 'fa-solid fa-check'
                : 'fa-solid fa-circle'
              "
            ></i>
          </span>

          <div class="min-w-0 flex-1">
            <p class="text-sm font-bold leading-tight">
              {{ item.label }}
            </p>

            <p
              class="mt-0.5 text-xs font-medium"
              :class="item.complete
                ? 'text-emerald-700'
                : 'text-stone-400'
              "
            >
              {{ item.complete ? 'Completed' : 'Still required' }}
            </p>
          </div>
        </div>
      </div>

      <div class="mt-5 rounded-2xl border border-stone-700 bg-[color-mix(in_srgb,var(--brand-5)_55%,white)] p-4">
        <div class="flex items-start gap-3">
          <i class="fa-solid fa-shield-heart mt-0.5 text-emerald-400"></i>

          <div>
            <p class="text-sm font-bold leading-tight">
              Secure checkout
            </p>

            <p class="mt-1 text-xs leading-relaxed text-stone-300">
              Your card details are encrypted and securely processed through Stripe.
            </p>
          </div>
        </div>
      </div>
    </section>
  </aside>

  <section class="sticky top-[73px] z-40 border-b border-stone-200 bg-white/92 px-4 py-3 backdrop-blur xl:hidden">
    <div class="flex items-center justify-between gap-3">
      <div>
        <p class="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-400">
          Checkout Progress
        </p>

        <div class="mt-2 flex gap-2 overflow-x-auto scrollbar-hide">
          <span
            v-for="item in props.checklist"
            :key="item.id"
            class="inline-flex flex-shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold whitespace-nowrap"
            :class="item.complete
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
              : 'border-stone-700 bg-[color-mix(in_srgb,var(--brand-5)_55%,white)] text-stone-400'
            "
          >
            <i :class="item.complete ? 'fa-solid fa-check' : 'fa-regular fa-circle'"></i>
            {{ item.label }}
          </span>
        </div>
      </div>
    </div>
  </section>
</template>