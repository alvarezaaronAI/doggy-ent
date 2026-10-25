<script setup>
import { computed } from 'vue'
import { ArrowLeft, PawPrint } from '@lucide/vue'
import { useRecoveryMetadata } from '@shared/composables/useRecoveryMetadata.js'
useRecoveryMetadata(computed(() => 'Admin page not found'))
</script>
<template>
  <main class="storefront-ui store-pattern flex flex-1 items-center justify-center px-6 py-12 text-center">
    <div class="max-w-md">
      <PawPrint :size="28" aria-hidden="true" class="mx-auto mb-5 text-[var(--storefront-brand-1)]" />
      <p class="text-6xl font-bold text-[var(--storefront-brand-1)]">404</p>
      <h1 class="mt-4 text-2xl font-semibold">This workspace page wandered off.</h1>
      <p class="store-muted mt-4 leading-relaxed">This link does not lead to an admin tool. Head back to your workspace to continue.</p>
      <RouterLink to="/admin" class="store-button store-button-primary mt-6"><ArrowLeft :size="18" aria-hidden="true" />Back to workspace</RouterLink>
    </div>
  </main>
</template>
