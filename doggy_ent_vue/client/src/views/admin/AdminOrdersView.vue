<template>
  <main class="min-h-screen bg-slate-100 text-slate-900">
    <section class="mx-auto max-w-6xl px-6 py-16">
      <p class="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Admin / Orders</p>
      <h1 class="text-4xl font-bold tracking-tight">Orders</h1>
      <p class="mt-3 max-w-2xl text-slate-600">
        This is a placeholder admin orders page.
      </p>

      <div class="mt-8 flex gap-3">
        <RouterLink
          to="/admin"
          class="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-white"
        >
          Back to Dashboard
        </RouterLink>
        <RouterLink
          to="/"
          class="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-white"
        >
          Back to Home
        </RouterLink>
      </div>
    </section>
  </main>
</template>
