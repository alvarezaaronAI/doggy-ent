<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref, useId } from 'vue'
import { X, Search, ChevronLeft, ChevronRight, Check, Save } from '@lucide/vue'
import { MEDIA_FOLDERS } from '@storefront-content/mediaRules.js'
import { mediaImageSource } from '@shared/utils/mediaImage.js'
import { useAdminMediaLibrary } from '../composables/useAdminMedia.js'
const emit = defineEmits(['choose', 'close'])
const { search, folder, page, result, selected, loading, busy, error, success, dirty, load, select, save } = useAdminMediaLibrary()
const dialog = ref(null), titleId = useId()
const size = bytes => `${(bytes / 1024 / 1024).toFixed(2)} MB`
function close() { if (!busy.value) emit('close') }
function choose() { if (selected.value && !dirty.value && !busy.value) emit('choose', selected.value) }
onMounted(async () => { await nextTick(); dialog.value.showModal(); load() })
onBeforeUnmount(() => dialog.value?.close())
</script>
<template>
  <dialog ref="dialog" class="media-library-dialog" :aria-labelledby="titleId" @cancel.prevent="close" @click.self="close">
    <div class="media-library-content">
      <div class="flex items-center justify-between gap-4">
        <h2 :id="titleId">Image library</h2>
        <button type="button" class="admin-button" :disabled="busy" aria-label="Close image library" title="Close image library" @click="close"><X :size="20" /></button>
      </div>
      <p class="admin-muted mt-2 text-sm">Reusable public images for the selected database. Do not upload private documents or customer information.</p>
      <div class="mt-5 flex flex-wrap items-end gap-3">
        <label class="admin-field min-w-0 flex-1">Find an image<input v-model="search" maxlength="160" type="search" placeholder="Image name or description" :disabled="busy" @keydown.enter.prevent="load()" /></label>
        <label class="admin-field">Image folder<select v-model="folder" :disabled="busy" @change="load()"><option value="">All folders</option><option v-for="name in MEDIA_FOLDERS" :key="name" :value="name">{{ name }}</option></select></label>
        <button type="button" class="admin-button" :disabled="busy || loading" @click="load()"><Search :size="16" />Search</button>
      </div>
      <p v-if="error" class="admin-alert admin-alert-error mt-4" role="alert">{{ error }}</p>
      <p v-if="success" class="admin-alert admin-alert-success mt-4" role="status">{{ success }}</p>
      <p v-if="loading" class="admin-state" role="status">Loading images...</p>
      <div v-else-if="result" class="media-library-grid mt-5">
        <section>
          <p class="admin-muted mb-3 text-xs">{{ result.count }} matching images · {{ size(result.storageBytes) }} / {{ size(result.capacityBytes) }} stored</p>
          <div class="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <button v-for="asset in result.assets" :key="asset.id" type="button" class="media-library-image" :aria-pressed="selected?.id === asset.id" :disabled="busy" @click="select(asset)">
              <img :src="mediaImageSource(asset.thumbnailUrl)" :alt="asset.altText || asset.name" loading="lazy" class="aspect-[4/3] w-full rounded bg-gray-100 object-contain" />
              <strong class="mt-2 block break-words text-sm">{{ asset.name }}</strong>
              <span class="admin-muted block text-xs">{{ asset.width }} × {{ asset.height }} · {{ size(asset.byteSize) }}</span>
            </button>
          </div>
          <p v-if="!result.assets.length" class="admin-state">No images match. Try another search or upload an image from the editor.</p>
          <div class="mt-4 flex items-center justify-between gap-3">
            <button type="button" class="admin-button" :disabled="busy || page === 1" aria-label="Previous image page" title="Previous image page" @click="load(page - 1)"><ChevronLeft :size="18" /></button>
            <span class="admin-muted text-xs">Page {{ page }}</span>
            <button type="button" class="admin-button" :disabled="busy || !result.hasMore" aria-label="Next image page" title="Next image page" @click="load(page + 1)"><ChevronRight :size="18" /></button>
          </div>
        </section>
        <aside class="space-y-4 border-t border-[var(--admin-line)] pt-4 sm:border-l sm:border-t-0 sm:pl-5 sm:pt-0">
          <template v-if="selected">
            <h3>Selected image</h3>
            <label class="admin-field">Library image name<input v-model="selected.name" maxlength="160" :disabled="busy" /></label>
            <label class="admin-field">Image description for accessibility<textarea v-model="selected.altText" maxlength="240" rows="3" :disabled="busy" :aria-describedby="titleId + '-description'"></textarea></label>
            <p :id="titleId + '-description'" class="admin-muted text-xs">Describe what the photo shows. Decorative backgrounds can leave this empty.</p>
            <label class="admin-field">Store in folder<select v-model="selected.folder" :disabled="busy"><option v-for="name in MEDIA_FOLDERS" :key="name" :value="name">{{ name }}</option></select></label>
            <button type="button" class="admin-button" :disabled="busy || !dirty" @click="save"><Save :size="16" />{{ busy ? 'Saving...' : 'Save image details' }}</button>
            <button type="button" class="admin-button admin-primary w-full" :disabled="busy || dirty" @click="choose"><Check :size="16" />Use this image</button>
            <p v-if="dirty" class="admin-muted text-xs">Save image details before selecting, or choose the image again to discard these edits.</p>
          </template>
          <p v-else class="admin-muted text-sm">Select an image to review its details and use it in the current field.</p>
        </aside>
      </div>
      <button v-else-if="!loading" type="button" class="admin-button mt-4" @click="load()">Try again</button>
    </div>
  </dialog>
</template>
<style scoped>
.media-library-dialog { width: min(960px,calc(100% - 24px)); max-height: calc(100svh - 32px); margin: auto; padding: 0; border: 1px solid var(--admin-line); border-radius: 8px; color: var(--admin-text); background: white; }
.media-library-dialog::backdrop { background: rgb(24 36 29 / 45%); }
.media-library-content { padding: 24px; }
.media-library-grid { display: grid; grid-template-columns: minmax(0,1fr) 250px; gap: 20px; }
.media-library-image { min-width: 0; border: 1px solid var(--admin-line); padding: 8px; border-radius: 6px; text-align: left; background: white; }
.media-library-image[aria-pressed='true'] { border-color: var(--admin-accent); background: var(--admin-soft); }
@media(max-width:639px) { .media-library-grid { grid-template-columns: minmax(0,1fr); } .media-library-content { padding: 16px; } }
</style>
