<script setup>
defineProps({ giving: Boolean, promotion: Boolean })
</script>
<template>
  <article class="commerce-card" :class="{ 'commerce-card-giving': giving, 'commerce-card-promo': promotion }"><slot /></article>
</template>
<style scoped>
.commerce-card { min-width: 0; border: 1px solid #ddd9d2; border-radius: 8px; background: #fff; color: #303b34; }
.commerce-card-giving { border-color: #bed6c8; background: #edf6f0; }
.commerce-card-promo:not(.commerce-card-giving) { border-color: #d9ca92; background: #fff9e5; }
</style>
