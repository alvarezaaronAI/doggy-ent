<script setup>
import { onBeforeUnmount, ref, watch } from 'vue'
import { Camera } from '@lucide/vue'
import { fetchAccountPetPhoto } from '../api/accountPets.api.js'
import templatePhoto from '../../../assets/images/brand/labrador-portrait-template.webp'

const props = defineProps({ pet: { type: Object, default: null }, preview: { type: String, default: '' }, cleared: Boolean })
const source = ref(''), unavailable = ref(false)
let controller, objectUrl = '', generation = 0
function release() {
  controller?.abort()
  if (objectUrl) URL.revokeObjectURL(objectUrl)
  objectUrl = ''; source.value = ''
}
watch(() => [props.pet?.id, props.pet?.hasPhoto, props.pet?.photoUpdatedAt, props.preview, props.cleared], async () => {
  const current = ++generation
  release(); unavailable.value = false
  if (props.preview || props.cleared || !props.pet?.hasPhoto) return
  controller = new AbortController()
  try {
    const blob = await fetchAccountPetPhoto(props.pet.id, controller.signal)
    if (current !== generation) return
    objectUrl = URL.createObjectURL(blob); source.value = objectUrl
  } catch (error) { if (current === generation && error.name !== 'AbortError') unavailable.value = true }
}, { immediate: true })
onBeforeUnmount(() => { generation++; release() })
</script>
<template>
  <div class="relative aspect-[3/2] overflow-hidden bg-[var(--account-soft)]">
    <img v-if="preview || source" :src="preview || source" :alt="`${pet?.nickname || 'Your pet'}'s photo`" class="h-full w-full object-cover" @error="source = ''; unavailable = true" />
    <img v-else :src="templatePhoto" alt="Illustrative Labrador photograph, not your pet" class="h-full w-full object-cover" />
    <span v-if="!preview && !source" class="absolute bottom-3 left-3 right-3 flex w-fit max-w-[calc(100%-24px)] items-center gap-2 rounded bg-white/95 px-2.5 py-1.5 text-xs text-[var(--account-ink)] shadow-sm"><Camera :size="14" aria-hidden="true" />{{ unavailable ? 'Photo unavailable · illustration shown' : 'Illustration · add their photo' }}</span>
  </div>
</template>
