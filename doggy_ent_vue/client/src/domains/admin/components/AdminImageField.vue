<script setup>
import { ref, useId, watch } from 'vue'
import { Upload, Images, X, LoaderCircle } from '@lucide/vue'
import { mediaImageSource } from '@shared/utils/mediaImage.js'
import { IMAGE_UPLOAD_TYPES } from '@storefront-content/mediaRules.js'
import { useAdminImageUpload } from '../composables/useAdminMedia.js'
import AdminMediaLibrary from './AdminMediaLibrary.vue'
const props = defineProps({ modelValue: { type: String, default: '' }, label: { type: String, required: true }, help: String, folder: { type: String, default: 'general' } })
const emit = defineEmits(['update:modelValue', 'description'])
const inputId = useId(), fileInput = ref(null), libraryOpen = ref(false), failed = ref(false)
const { uploading, error, success, upload } = useAdminImageUpload()
watch(() => props.modelValue, () => { failed.value = false })
function choose(asset) { emit('update:modelValue', asset.url); if (asset.altText) emit('description', asset.altText); error.value = ''; failed.value = false; libraryOpen.value = false }
async function change(event) {
  const file = event.target.files?.[0]
  event.target.value = ''
  if (file) { const asset = await upload(file, props.folder); if (asset) choose(asset) }
}
function update(value) { failed.value = false; success.value = ''; error.value = ''; emit('update:modelValue', value) }
</script>
<template>
  <div class="space-y-2 min-w-0">
    <label :for="inputId" class="admin-field">{{ label }}<input :id="inputId" :value="modelValue" maxlength="1200" placeholder="Choose a library image or paste an HTTPS image URL" :disabled="uploading" @input="update($event.target.value)" /></label>
    <p v-if="help" class="admin-muted text-xs">{{ help }}</p>
    <div class="flex flex-wrap gap-2">
      <button type="button" class="admin-button" :disabled="uploading" @click="fileInput.click()"><LoaderCircle v-if="uploading" :size="16" class="motion-safe:animate-spin" /><Upload v-else :size="16" />{{ uploading ? 'Uploading...' : 'Upload image' }}</button>
      <button type="button" class="admin-button" :disabled="uploading" @click="libraryOpen = true"><Images :size="16" />Choose library</button>
      <button v-if="modelValue" type="button" class="admin-button" :disabled="uploading" :aria-label="'Clear ' + label" :title="'Clear ' + label" @click="update('')"><X :size="16" /></button>
    </div>
    <input ref="fileInput" type="file" :accept="IMAGE_UPLOAD_TYPES.join(',')" class="hidden" tabindex="-1" :aria-label="'Upload ' + label" @change="change" />
    <p class="admin-muted text-xs">JPEG, PNG or WebP · up to 8 MB. Uploads are public library files, stored immediately in the selected database.</p>
    <img v-if="modelValue && !failed" :key="modelValue" :src="mediaImageSource(modelValue)" :alt="label + ' preview'" class="h-24 w-full rounded border border-[var(--admin-line)] bg-gray-50 object-contain" loading="lazy" @error="failed = true" />
    <p v-if="modelValue && failed" class="text-xs text-amber-800">This image could not load. Check the URL or choose a library image.</p>
    <p v-if="error" class="text-sm text-red-700" role="alert">{{ error }}</p>
    <p v-if="success" class="text-xs text-emerald-800" role="status">{{ success }}</p>
    <AdminMediaLibrary v-if="libraryOpen" @choose="choose" @close="libraryOpen = false" />
  </div>
</template>
