<script setup>
import { computed, onMounted } from 'vue'
import ContentLink from '@storefront/components/ContentLink.vue'
import { useStorefrontContent } from '@storefront/composables/useStorefrontContent.js'
const props = defineProps({ content: Object, preview: Boolean })
const { content: liveContent, loadContent } = useStorefrontContent()
const announcement = computed(() => (props.content || liveContent.value).announcement)
onMounted(() => { if (!props.preview) loadContent() })
</script>
<template>
  <div v-if="announcement.visible" class="border-b border-[#e1e5df] bg-[#f8faf8] px-4 py-2 text-center text-xs text-[#4f6258]">
    <ContentLink v-if="announcement.href" :href="announcement.href" class="underline underline-offset-2">{{ announcement.text }}</ContentLink>
    <span v-else>{{ announcement.text }}</span>
  </div>
</template>
