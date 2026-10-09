<template>
  <AccountShell :title="sectionTitle">
    <RouterView v-slot="{ Component }">
      <KeepAlive :key="user?.id || 'pending-session'" include="AccountOrdersView"><component :is="Component" /></KeepAlive>
    </RouterView>
  </AccountShell>
</template>

<script setup>
import { computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AccountShell from './AccountShell.vue'
import { ACCOUNT_NAV_ITEMS } from '../constants/account.constants.js'
import { useAccountAuth } from '../composables/useAccountAuth.js'
const route = useRoute()
const router = useRouter()
const { authenticated, user } = useAccountAuth()
watch(authenticated, (signedIn, previouslySignedIn) => {
  if (previouslySignedIn && !signedIn) {
    router.replace({ name: 'account-sign-in', query: { redirect: route.fullPath } })
  }
})
const sectionTitle = computed(
  () =>
    [...ACCOUNT_NAV_ITEMS]
      .reverse()
      .find((item) => route.path === item.to || route.path.startsWith(`${item.to}/`))?.label ||
    'Overview'
)
</script>
