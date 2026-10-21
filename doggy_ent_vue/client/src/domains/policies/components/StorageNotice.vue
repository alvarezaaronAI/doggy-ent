<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { Cookie, X } from '@lucide/vue'
import { useStorageNotice } from '../composables/useStorageNotice.js'
const route = useRoute()
const { acknowledged, ready, dismiss } = useStorageNotice()
const visible = computed(() => ready.value && !acknowledged.value && !route.path.startsWith('/admin'))
</script>
<template>
  <aside v-if="visible" aria-label="Cookie and storage information" class="fixed bottom-4 left-4 z-40 flex max-w-md items-start gap-3 rounded-lg border border-stone-300 bg-white p-4 text-sm text-stone-800 shadow-lg max-sm:right-4">
    <Cookie :size="20" aria-hidden="true" class="mt-1 shrink-0" />
    <div class="min-w-0">
      <p class="font-semibold">Your bag, remembered.</p>
      <p class="mt-1 leading-relaxed">We use storage for your bag, sign-in and checkout.</p>
      <RouterLink class="mt-2 inline-flex min-h-11 items-center text-[var(--storefront-brand-1)] underline underline-offset-4" to="/cookies">Cookies &amp; storage details</RouterLink>
    </div>
    <button type="button" title="Dismiss storage notice" aria-label="Dismiss storage notice" class="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-stone-100 focus-visible:outline-2 focus-visible:outline-offset-2" @click="dismiss"><X :size="18" aria-hidden="true" /></button>
  </aside>
</template>
