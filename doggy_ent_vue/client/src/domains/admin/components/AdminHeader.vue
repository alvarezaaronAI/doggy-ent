<script setup>
import AdminIcon from './AdminIcon.vue'
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
      <RouterLink to="/" class="admin-button"
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
