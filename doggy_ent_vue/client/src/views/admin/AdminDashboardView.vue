<template>
  <main class="min-h-screen bg-[var(--brand-5)] text-slate-900">
    <section class="mx-auto max-w-7xl px-6 py-10 md:py-14">
      <div class="section-panel p-8 md:p-10">
        <div class="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p class="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-stone-400">
              Admin CMS
            </p>

            <h1 class="text-4xl font-bold tracking-tight">Admin Dashboard</h1>

            <p class="mt-3 max-w-2xl text-stone-300">
              Manage products, orders, promos, and donation campaigns from one protected admin area.
            </p>

            <p v-if="admin" class="mt-3 text-sm text-stone-400">
              Signed in as <span class="font-semibold text-emerald-300">{{ admin.email }}</span>
            </p>
          </div>

          <button
            class="rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
            @click="logout"
          >
            Logout
          </button>
        </div>

        <div class="mt-10 grid gap-4 md:grid-cols-4">
          <RouterLink
            to="/admin/products"
            class="rounded-2xl border border-[var(--brand-3)] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-400 hover:shadow-md"
          >
            <h2 class="text-lg font-extrabold text-[var(--brand-4)]">Products</h2>
            <p class="mt-2 text-sm text-stone-400">Manage listings, pricing, and product status.</p>
          </RouterLink>

          <RouterLink
            to="/admin/orders"
            class="rounded-2xl border border-[var(--brand-3)] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-400 hover:shadow-md"
          >
            <h2 class="text-lg font-extrabold text-[var(--brand-4)]">Orders</h2>
            <p class="mt-2 text-sm text-stone-400">Review incoming orders and fulfillment flow.</p>
          </RouterLink>

          <RouterLink
            to="/admin/promos"
            class="rounded-2xl border border-[var(--brand-3)] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-400 hover:shadow-md"
          >
            <h2 class="text-lg font-extrabold text-[var(--brand-4)]">Promos</h2>
            <p class="mt-2 text-sm text-stone-400">Handle coupon codes, offers, and campaigns.</p>
          </RouterLink>
          <RouterLink
            to="/admin/campaigns"
            class="rounded-2xl border border-[var(--brand-3)] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-400 hover:shadow-md"
          >
            <h2 class="text-lg font-extrabold text-[var(--brand-4)]">Campaigns</h2>
            <p class="mt-2 text-sm text-stone-400">Manage shelter donation campaigns and product impact tracking.</p>
          </RouterLink>
        </div>

        <div class="mt-10">
          <RouterLink
            to="/"
            class="inline-flex rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-[var(--brand-4)] transition hover:border-emerald-400"
          >
            Back to Home
          </RouterLink>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const admin = ref(null)

async function loadAdminSession() {
  try {
    const response = await fetch('/api/auth/me', {
      credentials: 'include',
    })

    const data = await response.json()

    if (response.ok && data.authenticated) {
      admin.value = data.admin
    }
  } catch {
    admin.value = null
  }
}

async function logout() {
  try {
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    })
  } finally {
    admin.value = null
    router.push('/admin/login')
  }
}

onMounted(loadAdminSession)
</script>