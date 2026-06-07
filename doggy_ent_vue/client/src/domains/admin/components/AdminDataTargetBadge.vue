<script setup>
import {
  onMounted,
  ref,
} from 'vue'
import {
  fetchApi,
  getAdminDataTarget,
  parseJsonResponse,
} from '@shared/api/http.js'

const dataTarget = ref(getAdminDataTarget())
const targetLabel = ref(
  dataTarget.value === 'RAILWAY_DB'
    ? 'RAILWAY DB TARGET'
    : 'LOCAL DATA TARGET',
)

onMounted(async () => {
  try {
    const response = await fetchApi('/api/auth/data-target')

    const data = await parseJsonResponse(
      response,
      'Unable to load admin data target.',
    )

    if (data?.target?.code) {
      dataTarget.value = data.target.code
      targetLabel.value = data.target.label
    }
  }
  catch {
    // Keep the startup-mode fallback label.
  }
})
</script>

<template>
  <span
    class="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-black uppercase tracking-[0.12em]"
    :class="dataTarget === 'RAILWAY_DB'
      ? 'border-amber-300 bg-amber-50 text-amber-800'
      : 'border-emerald-300 bg-emerald-50 text-emerald-800'"
  >
    <span
      class="h-2 w-2 rounded-full"
      :class="dataTarget === 'RAILWAY_DB'
        ? 'bg-amber-500'
        : 'bg-emerald-500'"
    ></span>
    {{ targetLabel }}
  </span>
</template>
