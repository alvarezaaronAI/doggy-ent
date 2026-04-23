<template>
  <main class="min-h-screen bg-slate-950 text-white">
    <section class="mx-auto max-w-6xl px-6 py-16">
      <p class="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
        Admin CMS
      </p>

      <h1 class="text-4xl font-bold tracking-tight">Admin Dashboard</h1>

      <p class="mt-3 max-w-2xl text-slate-300">
        This is the admin shell. For now it proves routing works.
      </p>

      <div class="mt-10 grid gap-4 md:grid-cols-3">
        <RouterLink
          to="/admin/products"
          class="rounded-2xl border border-slate-800 bg-slate-900 p-5 transition hover:border-slate-600"
        >
          <h2 class="text-lg font-semibold">Products</h2>
          <p class="mt-2 text-sm text-slate-400">Manage listings, pricing, and product status.</p>
        </RouterLink>

        <RouterLink
          to="/admin/orders"
          class="rounded-2xl border border-slate-800 bg-slate-900 p-5 transition hover:border-slate-600"
        >
          <h2 class="text-lg font-semibold">Orders</h2>
          <p class="mt-2 text-sm text-slate-400">Review incoming orders and fulfillment flow.</p>
        </RouterLink>

        <RouterLink
          to="/admin/promos"
          class="rounded-2xl border border-slate-800 bg-slate-900 p-5 transition hover:border-slate-600"
        >
          <h2 class="text-lg font-semibold">Promos</h2>
          <p class="mt-2 text-sm text-slate-400">Handle coupon codes, offers, and campaigns.</p>
        </RouterLink>
      </div>

      <div class="mt-10">
        <RouterLink
          to="/"
          class="inline-flex rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-slate-500"
        >
          Back to Home
        </RouterLink>
      </div>
    </section>
  </main>
</template>
