<template>
  <nav aria-label="Account navigation" class="account-nav">
    <section v-for="group in ACCOUNT_NAV_GROUPS" :key="group.label" :aria-label="group.label" class="account-nav-group">
      <h2 class="account-nav-label">{{ group.label }}</h2>
      <RouterLink
        v-for="item in group.items"
        :key="item.to"
        :to="item.to"
        class="account-nav-link"
        :class="{ 'is-active': isActive(item.to) }"
        :aria-current="isActive(item.to) ? 'page' : undefined"
        @click="$emit('navigate')"
      >
        <i :class="['fa-solid', item.icon]" aria-hidden="true"></i><span>{{ item.label }}</span>
        <span v-if="item.future" class="ml-auto text-[10px] font-normal">Soon</span>
      </RouterLink>
    </section>
  </nav>
</template>

<script setup>
import { useRoute } from 'vue-router'
import { ACCOUNT_NAV_GROUPS } from '../constants/account.constants.js'
defineEmits(['navigate'])
const route = useRoute()
function isActive(path) {
  return path === '/account'
    ? route.path === path
    : route.path === path || route.path.startsWith(`${path}/`)
}
</script>
