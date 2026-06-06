<script setup>
import {
  getAdminDataTarget,
} from '@shared/api/http.js'

const dataTarget = getAdminDataTarget()
</script>

<template>
  <span
    class="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-black uppercase tracking-[0.12em]"
    :class="dataTarget === 'RAILWAY'
      ? 'border-amber-300 bg-amber-50 text-amber-800'
      : 'border-emerald-300 bg-emerald-50 text-emerald-800'"
  >
    <span
      class="h-2 w-2 rounded-full"
      :class="dataTarget === 'RAILWAY'
        ? 'bg-amber-500'
        : 'bg-emerald-500'"
    ></span>
    {{ dataTarget }} Data Target
  </span>
</template>
