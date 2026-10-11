<script setup>
import { computed, inject } from 'vue'
import { RouterLink, routerKey } from 'vue-router'
import { isSafeContentUrl } from '@storefront-content/contentValidation.js'
import { useStorefrontContent } from '../composables/useStorefrontContent.js'
const props = defineProps({ href: { type: String, default: '' } })
const { content } = useStorefrontContent()
const sections = inject('storefrontSections', computed(() => content.value.sections))
const safe = computed(() => props.href && isSafeContentUrl(props.href) && (!props.href.startsWith('/#') || sections.value.some(block => block.id === props.href.slice(2) && block.visible)))
const external = computed(() => /^https:\/\//i.test(props.href))
const router = inject(routerKey, null)
</script>
<template>
  <a v-if="safe && external" :href="href" target="_blank" rel="noopener noreferrer"><slot /></a>
  <RouterLink v-else-if="safe && router" :to="href"><slot /></RouterLink>
  <a v-else-if="safe" :href="href"><slot /></a>
  <span v-else-if="!href"><slot /></span>
</template>
