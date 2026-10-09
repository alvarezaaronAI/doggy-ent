<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import {
  ADMIN_NAVIGATION,
  isAdminNavActive,
} from '../constants/adminNavigation.constants.js'
import AdminIcon from './AdminIcon.vue'
const route = useRoute()
const open = ref(false)
watch(
  () => route.fullPath,
  () => {
    open.value = false
  },
)
</script>
<template>
  <aside class="admin-sidebar">
    <button
      type="button"
      class="admin-button admin-nav-toggle w-full justify-start"
      :aria-expanded="open"
      aria-controls="admin-navigation"
      @click="open = !open"
    >
      <AdminIcon :name="open ? 'close' : 'menu'" />Admin navigation
    </button>
    <nav
      id="admin-navigation"
      aria-label="Admin sections"
      :class="open ? 'grid' : 'hidden'"
      class="grid-cols-2 gap-5 pt-4 lg:grid lg:grid-cols-1 lg:gap-6 lg:pt-0"
    >
      <section v-for="group in ADMIN_NAVIGATION" :key="group.label">
        <p
          class="mb-2 px-3 text-xs font-medium uppercase text-[var(--admin-muted)]"
        >
          {{ group.label }}
        </p>
        <RouterLink
          v-for="item in group.items"
          :key="item.to"
          :to="item.to"
          class="admin-nav-link"
          :class="{ 'admin-nav-active': isAdminNavActive(route.path, item) }"
          :aria-current="
            isAdminNavActive(route.path, item) ? 'page' : undefined
          "
          ><AdminIcon :name="item.icon" />{{ item.label }}</RouterLink
        >
      </section>
    </nav>
  </aside>
</template>
