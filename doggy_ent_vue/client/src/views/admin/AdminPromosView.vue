<template>
  <main class="min-h-screen bg-[var(--brand-5)] text-slate-900">
    <section class="mx-auto max-w-7xl px-6 py-10 md:py-14">
      <div class="section-panel p-8 md:p-10">
        <div class="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p class="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-400">Admin / Marketing</p>
            <h1 class="mt-2 text-4xl font-extrabold">Promos</h1>
            <p class="mt-3 max-w-3xl text-stone-300">
              This view will eventually manage promo rules, code validity, campaign windows, and discount strategy.
            </p>
          </div>

          <button class="focus-ring rounded-lg bg-emerald-400 px-5 py-3 font-semibold text-[var(--brand-4)] transition hover:bg-emerald-300">
            Create Promo
          </button>
        </div>

        <div class="mt-8 grid gap-4">
          <article class="tile rounded-2xl p-5">
            <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p class="font-semibold text-[var(--brand-4)]">TREATS10</p>
                <p class="mt-1 text-sm text-stone-300">10% off selected orders</p>
              </div>
              <span class="rounded-full bg-[color:var(--success-1)]/15 px-3 py-1 text-xs font-semibold text-[color:var(--success-1)]">Active</span>
            </div>
          </article>

          <article class="tile rounded-2xl p-5">
            <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p class="font-semibold text-[var(--brand-4)]">WELCOME15</p>
                <p class="mt-1 text-sm text-stone-300">15% off first order</p>
              </div>
              <span class="rounded-full bg-stone-200 px-3 py-1 text-xs font-semibold text-stone-700">Draft</span>
            </div>
          </article>
        </div>

        <div class="mt-8 flex flex-wrap gap-3">
          <RouterLink
            to="/admin"
            class="rounded-lg border border-stone-700 px-4 py-2 text-sm font-semibold text-stone-700 transition hover:bg-white"
          >
            Back to Dashboard
          </RouterLink>

          <RouterLink
            to="/admin/products"
            class="rounded-lg border border-stone-700 px-4 py-2 text-sm font-semibold text-stone-700 transition hover:bg-white"
          >
            Go to Products
          </RouterLink>
        </div>
      </div>
    </section>
  </main>
</template>
