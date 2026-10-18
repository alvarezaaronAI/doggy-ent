<script setup>
import { computed, onMounted } from 'vue'
import ContentLink from '@storefront/components/ContentLink.vue'
import { useStorefrontContent } from '@storefront/composables/useStorefrontContent.js'
import { ChevronLeft, ChevronRight, Pause, Play } from '@lucide/vue'
import { announcementMessages } from '@storefront-content/pagePresentation.js'
import { useAnnouncementRotation } from '@storefront/composables/useAnnouncementRotation.js'
const props = defineProps({ content: Object, preview: Boolean })
const { content: liveContent, loadContent } = useStorefrontContent()
const announcement = computed(() => (props.content || liveContent.value).announcement)
const messages = computed(() => announcementMessages(announcement.value).filter(item => item.text?.trim()))
const { index, current, paused, reduced, step } = useAnnouncementRotation(messages, computed(() => !props.preview && announcement.value.visible && announcement.value.rotate))
onMounted(() => { if (!props.preview) loadContent() })
</script>
<template>
  <div v-if="announcement.visible && current" class="announcement-bar" aria-label="Store announcements">
    <button v-if="messages.length > 1" type="button" aria-label="Previous announcement" @click="step(-1)"><ChevronLeft :size="16" /></button>
    <div class="announcement-message">
      <Transition name="announcement" mode="out-in"><span :key="index" class="block"><ContentLink v-if="current.href" :href="current.href" class="underline underline-offset-2">{{ current.text }}</ContentLink><span v-else>{{ current.text }}</span></span></Transition>
    </div>
    <template v-if="messages.length > 1"><span class="hidden text-xs sm:block">{{ index + 1 }} / {{ messages.length }}</span><button type="button" aria-label="Next announcement" @click="step(1)"><ChevronRight :size="16" /></button><button v-if="announcement.rotate" type="button" :disabled="preview || reduced" :aria-label="paused ? 'Play announcements' : 'Pause announcements'" @click="paused = !paused"><Play v-if="paused || reduced || preview" :size="15" /><Pause v-else :size="15" /></button></template>
  </div>
</template>
<style scoped>
.announcement-bar { display:flex; justify-content:center; align-items:center; gap:8px; min-height:44px; padding:4px 16px; background:#eef2f9; color:var(--storefront-brand-1); font-size:12px; border-bottom:1px solid #dce3f0; }
.announcement-message { width:min(680px,100%); text-align:center; overflow-wrap:anywhere; }
.announcement-bar button { display:grid; place-items:center; flex-shrink:0; width:36px; min-height:36px; border-radius:4px; }
.announcement-bar button:hover { background:#dce5f4; }
.announcement-enter-active,.announcement-leave-active { transition:opacity .18s; }
.announcement-enter-from,.announcement-leave-to { opacity:0; }
@media(prefers-reduced-motion:reduce) { .announcement-enter-active,.announcement-leave-active { transition:none; } }
@media(pointer:coarse) { .announcement-bar button { min-height:44px; } }
</style>
