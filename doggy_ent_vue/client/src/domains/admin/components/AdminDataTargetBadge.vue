<script setup>
import {
  onMounted,
  ref,
} from 'vue'
import {
  fetchApi,
  parseJsonResponse,
} from '@shared/api/http.js'

const dataTarget = ref('UNKNOWN')
const targetLabel = ref('CHECKING DATA TARGET')

onMounted(async () => {
  try {
    const response = await fetchApi('/api/auth/data-target')

    const data = await parseJsonResponse(
      response,
      'Unable to load admin data target.',
    )

    if (['LOCAL', 'RAILWAY_DB', 'DEPLOYED'].includes(data?.target?.code)) {
      dataTarget.value = data.target.code
      targetLabel.value = data.target.label
    } else throw new Error('Unrecognized data target.')
  }
  catch {
    targetLabel.value = 'TARGET UNVERIFIED'
  }
})
</script>

<template>
  <span
    class="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-black uppercase tracking-[0.12em]"
    :class="dataTarget === 'UNKNOWN' ? 'border-gray-300 bg-gray-50 text-gray-700' : dataTarget !== 'LOCAL'
      ? 'border-amber-300 bg-amber-50 text-amber-800'
      : 'border-emerald-300 bg-emerald-50 text-emerald-800'"
  >
    <span
      class="h-2 w-2 rounded-full"
      :class="dataTarget === 'UNKNOWN' ? 'bg-gray-400' : dataTarget !== 'LOCAL'
        ? 'bg-amber-500'
        : 'bg-emerald-500'"
    ></span>
    {{ targetLabel }}
  </span>
</template>
