<template>
  <main class="min-h-screen bg-[var(--brand-5)] text-slate-900">
    <section class="mx-auto max-w-7xl px-6 py-10 md:py-14">
      <div class="section-panel p-8 md:p-10">
        <p class="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-400">Admin / Operations</p>
        <h1 class="mt-2 text-4xl font-extrabold">Orders</h1>
        <p class="mt-3 max-w-3xl text-stone-300">
          This will become the order operations area for payment review, packing flow, and fulfillment tracking.
        </p>

        <div class="mt-8 grid gap-4">
          <article class="tile rounded-2xl p-5">
            <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p class="font-semibold text-[var(--brand-4)]">Order #1001</p>
                <p class="mt-1 text-sm text-stone-300">Customer: Demo User</p>
              </div>
              <span class="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">Pending</span>
            </div>
          </article>

          <article class="tile rounded-2xl p-5">
            <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p class="font-semibold text-[var(--brand-4)]">Order #1002</p>
                <p class="mt-1 text-sm text-stone-300">Customer: Demo User</p>
              </div>
              <span class="rounded-full bg-[color:var(--success-1)]/15 px-3 py-1 text-xs font-semibold text-[color:var(--success-1)]">Paid</span>
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
            to="/admin/promos"
            class="rounded-lg border border-stone-700 px-4 py-2 text-sm font-semibold text-stone-700 transition hover:bg-white"
          >
            Go to Promos
          </RouterLink>
        </div>
      </div>
    </section>
  </main>
</template>
