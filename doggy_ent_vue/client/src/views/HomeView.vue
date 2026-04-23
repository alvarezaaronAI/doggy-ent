<script setup>
import { onMounted, ref } from 'vue'

const healthData = ref(null)
const isLoading = ref(true)
const errorMessage = ref('')

async function loadHealth() {
  isLoading.value = true
  errorMessage.value = ''

  try {
    const response = await fetch('/api/health')

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`)
    }

    healthData.value = await response.json()
  } catch (error) {
    errorMessage.value = error.message || 'Unable to reach the backend server.'
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  loadHealth()
})
</script>

<template>
  <main class="min-h-screen bg-slate-50 text-slate-900">
    <section class="mx-auto flex min-h-screen max-w-5xl flex-col justify-center px-6 py-16">
      <p class="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
        Doggy Ent
      </p>

      <h1 class="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
        Frontend and backend are now connected
      </h1>

      <p class="mb-8 max-w-2xl text-base text-slate-600 sm:text-lg">
        This home page is making a real request from Vue to your Express server.
      </p>

      <div class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div class="flex items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <h2 class="text-lg font-semibold text-slate-900">Backend health check</h2>
            <p class="text-sm text-slate-500">
              Source:
              <code class="rounded bg-slate-100 px-2 py-1 text-xs text-slate-700">GET /api/health</code>
            </p>
          </div>

          <button
            type="button"
            @click="loadHealth"
            class="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Refresh
          </button>
        </div>

        <div class="mt-6">
          <p v-if="isLoading" class="text-sm font-medium text-slate-500">
            Contacting backend server...
          </p>

          <div
            v-else-if="errorMessage"
            class="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            {{ errorMessage }}
          </div>

          <div v-else class="space-y-3">
            <div class="flex flex-wrap items-center gap-3">
              <span class="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                Connected
              </span>
              <span class="text-sm text-slate-500">The Vue frontend successfully reached Express.</span>
            </div>

            <pre class="overflow-x-auto rounded-xl bg-slate-950 p-4 text-sm text-slate-100">{{ JSON.stringify(healthData, null, 2) }}</pre>
          </div>
        </div>
      </div>

      <div class="mt-8 flex flex-wrap gap-3">
        <RouterLink
          to="/admin"
          class="rounded-lg bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
        >
          Go to Admin Dashboard
        </RouterLink>
      </div>
    </section>
  </main>
</template>
