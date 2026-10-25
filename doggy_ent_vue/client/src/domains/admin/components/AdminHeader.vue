<script setup>
import AdminIcon from './AdminIcon.vue'
import { APPLICATION_SURFACE, getStorefrontHref } from '@shared/config/applicationSurface.js'
const standalone = APPLICATION_SURFACE === 'admin'
const storeHref = getStorefrontHref()
defineProps({ admin: { type: Object, default: null }, signingOut: Boolean })
defineEmits(['logout'])
</script>
<template>
  <header class="admin-header">
    <RouterLink
      to="/admin"
      class="flex min-w-0 items-center gap-3"
      aria-label="Chase and Evie admin overview"
    >
      <AdminIcon name="brand" /><span
        ><strong class="block text-lg font-semibold"
          >Chase &amp; Evie Co.</strong
        ><span class="admin-muted">Admin workspace</span></span
      >
    </RouterLink>
    <div class="flex items-center gap-2">
      <a v-if="standalone && storeHref" :href="storeHref" target="_blank" rel="noopener noreferrer" class="admin-button" aria-label="View store (opens in a new tab)"><AdminIcon name="external" /><span>View store</span></a>
      <button v-else-if="standalone" type="button" class="admin-button" disabled title="Store address not configured"><AdminIcon name="external" /><span>View store</span></button>
      <RouterLink v-else to="/" class="admin-button"
        ><AdminIcon name="external" /><span class="hidden sm:inline"
          >View store</span
        ><span class="sr-only sm:hidden">View store</span></RouterLink
      >
      <button
        type="button"
        class="admin-icon-button"
        :disabled="signingOut"
        aria-label="Sign out"
        title="Sign out"
        @click="$emit('logout')"
      >
        <AdminIcon name="logout" />
      </button>
    </div>
  </header>
</template>
