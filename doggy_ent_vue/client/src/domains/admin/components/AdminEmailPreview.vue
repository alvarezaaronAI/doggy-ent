<script setup>
import { ref } from 'vue'
import { Monitor, Smartphone } from '@lucide/vue'
defineProps({ preview: Object, error: String })
const phone = ref(false)
</script>
<template>
  <section class="email-preview">
    <div class="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--admin-line)] bg-white p-3"><strong class="text-sm">{{ preview?.sample ? 'Sample email' : 'Customer email preview' }}</strong><div class="flex gap-2"><button type="button" class="admin-button" :aria-pressed="!phone" aria-label="Wide email preview" title="Wide email preview" @click="phone = false"><Monitor :size="16" /></button><button type="button" class="admin-button" :aria-pressed="phone" aria-label="Phone email preview" title="Phone email preview" @click="phone = true"><Smartphone :size="16" /></button></div></div>
    <div v-if="preview" class="email-scroll"><div class="email-document" :class="{ phone }"><div class="bg-white p-4 text-sm border-b border-[var(--admin-line)]"><p class="break-all"><strong>To:</strong> {{ preview.recipient }}</p><p class="mt-2"><strong>Subject:</strong> {{ preview.subject }}</p></div><iframe :srcdoc="preview.html" sandbox referrerpolicy="no-referrer" title="Email appearance" /></div></div>
    <p v-else class="admin-state" :role="error ? 'alert' : 'status'">{{ error || 'Preparing email preview...' }}</p>
  </section>
</template>
<style scoped>
.email-preview { min-width: 0; border: 1px solid var(--admin-line); border-radius: 6px; background: #eceeeb; overflow: hidden; }
.email-scroll { max-height: 76svh; overflow: auto; overscroll-behavior: contain; }
.email-document { width: 100%; margin: auto; }
.email-document.phone { max-width: 390px; }
iframe { display: block; width: 100%; height: 850px; border: 0; background: #faf9f6; }
</style>
