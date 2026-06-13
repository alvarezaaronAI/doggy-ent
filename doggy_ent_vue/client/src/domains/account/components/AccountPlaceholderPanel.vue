<template>
  <section class="rounded-xl border border-dashed border-stone-300 bg-white p-5">
    <h2 class="text-base font-bold text-stone-900">
      {{ title }}
    </h2>

    <p class="mt-2 text-sm text-stone-500">
      {{ message }}
    </p>
  </section>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
})
</script>
