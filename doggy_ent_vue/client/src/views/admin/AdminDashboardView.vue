<template>
  <main class="min-h-screen bg-[var(--brand-5)] text-slate-900">
    <section class="border-b border-stone-800 bg-white/80">
      <div class="mx-auto max-w-7xl px-6 py-5">
        <div class="flex flex-wrap items-center justify-between gap-4">
          <div class="flex items-center gap-3 font-black tracking-tight text-xl">
            <span class="chip-blue-ring inline-flex h-10 w-10 items-center justify-center rounded-full bg-emerald-400 text-[var(--brand-4)]">
              🐾
            </span>
            <span class="text-[var(--brand-4)]">Chase &amp; Evie Co. Admin</span>
          </div>

          <RouterLink
            to="/"
            class="rounded-full border border-emerald-400 px-4 py-2 text-sm font-semibold text-emerald-400 transition hover:bg-stone-900"
          >
            Back to Storefront
          </RouterLink>
        </div>
      </div>
    </section>

    <section class="mx-auto max-w-7xl px-6 py-10 md:py-14">
      <div class="section-panel p-8 md:p-10">
        <p class="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-400">
          Admin CMS
        </p>

        <h1 class="mt-3 text-4xl font-extrabold tracking-tight">
          Admin Dashboard
        </h1>

        <p class="mt-4 max-w-3xl text-stone-300">
          This dashboard now uses the same visual language as your storefront concept:
          warm oat background, white surfaces, kraft borders, cacao headings, blue accents,
          and yellow action buttons.
        </p>

        <div class="mt-8 grid gap-5 md:grid-cols-3">
          <RouterLink
            to="/admin/products"
            class="tile-strong rounded-3xl p-6 transition hover:-translate-y-0.5"
          >
            <p class="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-400">Catalog</p>
            <h2 class="mt-2 text-2xl font-extrabold">Products</h2>
            <p class="mt-3 text-sm text-stone-300">
              Manage listings, pricing, descriptions, media, and product status.
            </p>
          </RouterLink>

          <RouterLink
            to="/admin/orders"
            class="tile-strong rounded-3xl p-6 transition hover:-translate-y-0.5"
          >
            <p class="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-400">Operations</p>
            <h2 class="mt-2 text-2xl font-extrabold">Orders</h2>
            <p class="mt-3 text-sm text-stone-300">
              Review incoming orders, payment state, and fulfillment progress.
            </p>
          </RouterLink>

          <RouterLink
            to="/admin/promos"
            class="tile-strong rounded-3xl p-6 transition hover:-translate-y-0.5"
          >
            <p class="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-400">Marketing</p>
            <h2 class="mt-2 text-2xl font-extrabold">Promos</h2>
            <p class="mt-3 text-sm text-stone-300">
              Handle discount codes, offers, launches, and seasonal campaigns.
            </p>
          </RouterLink>
        </div>

        <div class="mt-8 flex flex-wrap gap-3">
          <RouterLink
            to="/admin/products"
            class="focus-ring rounded-lg bg-emerald-400 px-5 py-3 font-semibold text-[var(--brand-4)] transition hover:bg-emerald-300"
          >
            Open Product CMS
          </RouterLink>

          <RouterLink
            to="/"
            class="rounded-lg border border-stone-700 px-5 py-3 font-semibold text-stone-700 transition hover:bg-white"
          >
            Back Home
          </RouterLink>
        </div>
      </div>
    </section>
  </main>
</template>
