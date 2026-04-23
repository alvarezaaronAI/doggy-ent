<template>
  <main class="min-h-screen bg-[var(--brand-5)] text-slate-900">
    <section class="mx-auto max-w-7xl px-6 py-10 md:py-14">
      <div class="section-panel p-8 md:p-10">
        <div class="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p class="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-400">Admin / Catalog</p>
            <h1 class="mt-2 text-4xl font-extrabold">Products</h1>
            <p class="mt-3 max-w-3xl text-stone-300">
              This is the branded CMS shell for product management.
            </p>
          </div>

          <button class="focus-ring rounded-lg bg-emerald-400 px-5 py-3 font-semibold text-[var(--brand-4)] transition hover:bg-emerald-300">
            Add Product
          </button>
        </div>

        <div class="mt-8 overflow-hidden rounded-3xl border border-stone-800 bg-white">
          <div class="grid grid-cols-4 gap-4 border-b border-stone-800 bg-[color:var(--brand-5)]/65 px-5 py-4 text-sm font-semibold text-[var(--brand-4)]">
            <div>Name</div>
            <div>Price</div>
            <div>Status</div>
            <div>Actions</div>
          </div>

          <div class="grid grid-cols-4 items-center gap-4 px-5 py-5 text-sm text-stone-700">
            <div>
              <p class="font-semibold text-[var(--brand-4)]">Chicken Breast Jerky</p>
              <p class="mt-1 text-xs text-stone-400">Single ingredient • core product</p>
            </div>
            <div>$12.99</div>
            <div>
              <span class="rounded-full bg-[color:var(--success-1)]/15 px-3 py-1 text-xs font-semibold text-[color:var(--success-1)]">
                Draft
              </span>
            </div>
            <div class="flex flex-wrap gap-2">
              <button class="rounded-lg border border-stone-700 px-3 py-2 font-semibold text-stone-700 transition hover:bg-[color:var(--brand-5)]/55">
                Edit
              </button>
              <button class="rounded-lg border border-stone-700 px-3 py-2 font-semibold text-stone-700 transition hover:bg-[color:var(--brand-5)]/55">
                Delete
              </button>
            </div>
          </div>
        </div>

        <div class="mt-8 flex flex-wrap gap-3">
          <RouterLink
            to="/admin"
            class="rounded-lg border border-stone-700 px-4 py-2 text-sm font-semibold text-stone-700 transition hover:bg-white"
          >
            Back to Dashboard
          </RouterLink>

          <RouterLink
            to="/admin/orders"
            class="rounded-lg border border-stone-700 px-4 py-2 text-sm font-semibold text-stone-700 transition hover:bg-white"
          >
            Go to Orders
          </RouterLink>
        </div>
      </div>
    </section>
  </main>
</template>
