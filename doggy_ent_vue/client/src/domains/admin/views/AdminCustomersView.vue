<script setup>
import { onMounted } from 'vue'
import AdminCustomersTable from '../components/AdminCustomersTable.vue'
import AdminDataTargetBadge from '../components/AdminDataTargetBadge.vue'
import {
  useAdminCustomers,
} from '../composables/useAdminCustomers.js'

const {
  error,
  filteredCustomers,
  loadCustomers,
  loading,
  searchQuery,
} = useAdminCustomers()

onMounted(loadCustomers)
</script>

<template>
  <main class="min-h-screen bg-[var(--brand-5)] text-slate-900">
    <section class="mx-auto max-w-7xl px-6 py-10 md:py-14">
      <div class="mb-8 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <div class="mb-3 flex flex-wrap items-center gap-3">
            <p class="text-sm font-semibold uppercase tracking-[0.2em] text-stone-400">
              Admin CMS
            </p>

            <AdminDataTargetBadge />
          </div>

          <h1 class="text-4xl font-bold tracking-tight">Customers</h1>
          <p class="mt-3 max-w-2xl text-stone-500">
            Review account status, order history, and customer readiness tools.
          </p>
        </div>

        <RouterLink
          to="/admin"
          class="rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-[var(--brand-4)] transition hover:border-emerald-400"
        >
          Dashboard
        </RouterLink>
      </div>

      <div class="mb-5 max-w-md">
        <input
          v-model="searchQuery"
          class="w-full rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm outline-none focus:border-emerald-500"
          placeholder="Search customers..."
          type="search"
        />
      </div>

      <p v-if="loading" class="rounded-xl border border-stone-200 bg-white p-6 text-sm text-stone-500">
        Loading customers...
      </p>

      <AdminCustomersTable
        v-else
        :customers="filteredCustomers"
      />

      <p v-if="error" class="mt-5 text-sm font-semibold text-red-600">
        {{ error }}
      </p>
    </section>
  </main>
</template>
