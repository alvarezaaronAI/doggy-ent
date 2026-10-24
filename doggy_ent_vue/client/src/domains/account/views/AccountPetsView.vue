<script setup>
import AccountPetsSection from '../components/AccountPetsSection.vue'
import monogram from '../../../assets/images/brand/labrador-monogram-v1.webp'
</script>
<template>
  <div class="relative isolate min-w-0"><div class="pointer-events-none absolute inset-0 -z-10 bg-repeat opacity-[0.065]" :style="{ backgroundImage: `url(${monogram})`, backgroundSize: '360px' }" aria-hidden="true"></div><AccountPetsSection /></div>
</template>
