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
  <main class="min-h-screen bg-[var(--brand-5)] text-slate-900">
    <section class="mx-auto max-w-7xl px-6 py-16">
      <div class="section-panel p-8">
        <h1 class="text-4xl font-extrabold">Doggy Ent Storefront</h1>
        <p class="mt-3 text-stone-300">
          This page now matches your concept styling while still proving frontend ↔ backend communication.
        </p>

        <div class="mt-6">
          <p v-if="isLoading">Loading backend...</p>

          <div v-else-if="errorMessage" class="text-red-600">
            {{ errorMessage }}
          </div>

          <div v-else>
            <p class="text-green-700 font-semibold">Connected to backend</p>
            <pre class="mt-3 bg-[var(--brand-4)] text-white p-4 rounded-xl">
{{ JSON.stringify(healthData, null, 2) }}
            </pre>
          </div>
        </div>

        <div class="mt-8 flex gap-4">
          <RouterLink to="/admin" class="px-4 py-2 bg-emerald-400 rounded-lg font-semibold">
            Admin
          </RouterLink>

          <RouterLink to="/admin/products" class="px-4 py-2 border rounded-lg">
            Products
          </RouterLink>
        </div>
      </div>
    </section>
  </main>
</template>
