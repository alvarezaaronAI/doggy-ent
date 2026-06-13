<template>
  <div class="min-h-screen bg-[linear-gradient(180deg,rgba(243,232,210,0.72)_0%,#fff_58%,rgba(242,248,235,0.62)_100%)] text-slate-900">
    <SiteHeader />

    <main>
      <section class="mx-auto max-w-6xl px-6 py-10 md:py-14">
        <div class="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <RouterLink
              to="/"
              class="inline-flex items-center gap-2 text-sm font-bold text-emerald-700 transition hover:text-emerald-900"
            >
              <i class="fa-solid fa-arrow-left text-xs"></i>
              Back to treats
            </RouterLink>

            <p class="mt-6 text-xs font-black uppercase tracking-[0.22em] text-emerald-700">
              Chase &amp; Evie Co.
            </p>

            <h1 class="mt-2 text-4xl font-black tracking-tight text-[var(--brand-4)] md:text-5xl">
              {{ title }}
            </h1>

            <p v-if="subtitle" class="mt-3 max-w-2xl text-stone-600">
              {{ subtitle }}
            </p>
          </div>

          <AccountNav v-if="showNav" />
        </div>

        <slot />
      </section>
    </main>

    <SiteFooter />
  </div>
</template>

<script setup>
import SiteFooter from '@app/layouts/SiteFooter.vue'
import SiteHeader from '@app/layouts/SiteHeader.vue'
import AccountNav from './AccountNav.vue'

defineProps({
  title: {
    type: String,
    required: true,
  },
  subtitle: {
    type: String,
    default: '',
  },
  showNav: {
    type: Boolean,
    default: true,
  },
})
</script>
