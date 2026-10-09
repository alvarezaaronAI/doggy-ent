<template>
  <nav aria-label="Account navigation" class="account-nav">
    <template v-for="(item, index) in ACCOUNT_NAV_ITEMS" :key="item.to">
      <p v-if="item.future && !ACCOUNT_NAV_ITEMS[index - 1]?.future" class="account-future-label">
        Coming later
      </p>
      <RouterLink
        :to="item.to"
        class="account-nav-link"
        :class="{ 'is-active': isActive(item.to) }"
        :aria-current="isActive(item.to) ? 'page' : undefined"
        @click="$emit('navigate')"
      >
        <i :class="['fa-solid', item.icon]" aria-hidden="true"></i>{{ item.label }}
      </RouterLink>
    </template>
  </nav>
</template>

<script setup>
import { useRoute } from 'vue-router'
import { ACCOUNT_NAV_ITEMS } from '../constants/account.constants.js'
defineEmits(['navigate'])
const route = useRoute()
function isActive(path) {
  return path === '/account'
    ? route.path === path
    : route.path === path || route.path.startsWith(`${path}/`)
}
</script>
