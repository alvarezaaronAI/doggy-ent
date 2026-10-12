<script setup>
import { computed } from 'vue'
import { mediaImageSource } from '@shared/utils/mediaImage.js'
import { WEBSITE_BACKGROUNDS } from '../constants/adminWebsite.constants.js'
const props = defineProps({ draft: { type: Object, required: true }, selected: String, changed: Boolean })
const block = computed(() => props.draft.sections.find(item => item.id === props.selected))
const settings = computed(() => props.selected === 'theme' ? props.draft.theme : props.selected === 'footer' ? props.draft.footer : block.value?.settings)
const palette = computed(() => WEBSITE_BACKGROUNDS.find(item => item.value === settings.value?.background))
const artwork = computed(() => settings.value?.backgroundImage || '')
const seasonalLabel = computed(() => ({ original: 'Everyday', autumn: 'Autumn', winter: 'Winter' })[props.draft.theme.season])
</script>
<template>
  <div class="flex flex-wrap items-center gap-3 border-b border-[var(--admin-line)] bg-white p-3 text-xs" role="status">
    <strong>{{ changed ? 'Edited · not saved' : 'Saved selection' }}</strong>
    <span class="admin-muted">{{ selected === 'theme' ? seasonalLabel + ' homepage' : palette?.label || 'Content & links' }}</span>
    <span v-if="palette" class="h-5 w-5 rounded-sm border border-gray-300" :style="{ background: palette.color }" aria-hidden="true"></span>
    <template v-if="artwork"><img :src="mediaImageSource(artwork)" alt="Selected background artwork" class="h-12 w-20 rounded border border-gray-300 object-cover" /><span>Background artwork applied</span></template>
    <span v-else-if="selected === 'theme'" class="admin-muted">Original background · no seasonal artwork</span>
  </div>
</template>
