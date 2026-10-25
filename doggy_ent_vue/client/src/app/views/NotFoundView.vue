<script setup>
import { computed } from 'vue'
import PolicyShell from '@domains/policies/components/PolicyShell.vue'
import PageRecovery from '@shared/components/PageRecovery.vue'
import { useRecoveryMetadata } from '@shared/composables/useRecoveryMetadata.js'
useRecoveryMetadata(computed(() => 'Page not found'))
</script>
<template><PolicyShell class="[&>main]:flex"><div class="store-pattern flex flex-1 items-center"><PageRecovery class="w-full" focus-on-mount /></div></PolicyShell></template>
