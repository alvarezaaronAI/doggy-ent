<template>
  <nav class="flex flex-wrap items-center gap-2 text-sm font-semibold">
    <RouterLink
      v-for="item in navItems"
      :key="item.to"
      :to="item.to"
      class="rounded-lg border border-stone-200 bg-white px-3 py-2 text-stone-600 transition hover:border-emerald-400 hover:text-emerald-700"
      active-class="border-emerald-500 text-emerald-700"
    >
      {{ item.label }}
    </RouterLink>
  </nav>
</template>

<script setup>
const navItems = [
  {
    label: 'Overview',
    to: '/account',
  },
  {
    label: 'Profile',
    to: '/account/profile',
  },
  {
    label: 'Orders',
    to: '/account/orders',
  },
]
</script>
