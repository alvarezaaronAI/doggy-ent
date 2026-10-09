<script setup>
import { Leaf, Flame, Package } from '@lucide/vue'
const steps = [
  {
    name: 'Source simply',
    text: 'Simple protein cuts are the starting point for our treats.',
    icon: Leaf,
  },
  {
    name: 'Prepare with care',
    text: 'Trim, slice, and dehydrate low and slow for texture and flavor.',
    icon: Flame,
  },
  {
    name: 'Pack in small batches',
    text: 'Thoughtfully packed treats, ready for the moments you share.',
    icon: Package,
  },
]
</script>
<template>
  <section id="process" class="store-section">
    <div class="store-inner">
      <p class="store-eyebrow">From kitchen to treat bag</p>
      <h2 class="mt-3 text-3xl font-bold">Made with care.</h2>
      <p class="store-muted mt-3">
        A little care in every batch, from first cut to final bag.
      </p>
      <div class="mt-8 grid gap-8 md:grid-cols-3">
        <div
          v-for="(step, index) in steps"
          :key="step.name"
          class="home-process-step"
        >
          <component
            :is="step.icon"
            :size="28"
            class="text-[#17664d]"
            aria-hidden="true"
          />
          <p class="store-muted mt-4 text-xs">0{{ index + 1 }}</p>
          <h3 class="mt-2 text-lg font-bold">{{ step.name }}</h3>
          <p class="store-muted mt-3 leading-relaxed">{{ step.text }}</p>
        </div>
      </div>
    </div>
  </section>
</template>
