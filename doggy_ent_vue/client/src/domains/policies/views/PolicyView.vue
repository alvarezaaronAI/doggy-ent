<script setup>
import { computed } from 'vue'
import PolicyShell from '../components/PolicyShell.vue'
import PolicyContent from '../components/PolicyContent.vue'
import { POLICY_PAGES } from '../content/policyPages.js'
import { usePolicyMetadata } from '../composables/usePolicyMetadata.js'
const props = defineProps({ pageKey: { type: String, required: true } })
const page = computed(() => POLICY_PAGES[props.pageKey])
usePolicyMetadata(page)
</script>
<template><PolicyShell><PolicyContent :page="page" :page-key="pageKey" /></PolicyShell></template>
