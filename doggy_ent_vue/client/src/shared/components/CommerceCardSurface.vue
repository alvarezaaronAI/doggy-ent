<script setup>
defineProps({ giving: Boolean, promotion: Boolean, monogram: Boolean })
</script>
<template>
  <article class="commerce-card" :class="{ 'commerce-card-giving': giving, 'commerce-card-promo': promotion, 'commerce-card-monogram': monogram }"><slot /></article>
</template>
<style scoped>
.commerce-card { min-width: 0; border: 1px solid #ddd9d2; border-radius: 8px; background: #fff; color: #303b34; }
.commerce-card-giving { border-color: #bed6c8; background: #edf6f0; }
.commerce-card-promo:not(.commerce-card-giving) { border-color: #d9ca92; background: #fff9e5; }
.commerce-card-monogram { position: relative; isolation: isolate; }
.commerce-card-monogram::before { content: ''; position: absolute; inset: 0; z-index: -1; pointer-events: none; border-radius: inherit; background: url('../../assets/images/brand/labrador-monogram-v1.webp') repeat; background-size: 220px; opacity: .065; }
</style>
