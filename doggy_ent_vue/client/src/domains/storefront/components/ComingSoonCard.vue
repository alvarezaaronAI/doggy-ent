<script setup>
import { RouterLink } from 'vue-router'

const props = defineProps({
  product: {
    type: Object,
    required: true,
  },
  getDisplayTags: {
    type: Function,
    required: true,
  },
})

const emit = defineEmits(['preview'])
</script>

<template>
  <article
    class="tile-strong flex h-full min-h-[450px] flex-col overflow-hidden rounded-2xl transition hover:-translate-y-1 hover:shadow-2xl"
  >
    <RouterLink :to="`/products/${props.product.slug}`">
      <img
        class="h-44 w-full flex-shrink-0 cursor-pointer object-cover transition hover:opacity-90"
        :src="props.product.image"
        :alt="props.product.name"
      />
    </RouterLink>

    <div class="flex flex-1 flex-col p-4">
      <div>
        <p class="text-xs font-bold uppercase tracking-[0.16em] text-emerald-400">
          {{ props.product.category }}
        </p>

        <RouterLink
          :to="`/products/${props.product.slug}`"
          class="mt-2 block text-xl font-semibold transition hover:text-emerald-400"
        >
          {{ props.product.name }}
        </RouterLink>
      </div>

      <div class="mt-3 flex min-h-[28px] flex-wrap gap-2">
        <span
          v-for="tag in props.getDisplayTags(props.product).slice(0, 2)"
          :key="tag"
          class="rounded-full bg-[color-mix(in_srgb,var(--brand-2)_88%,white)] px-3 py-1 text-[11px] font-extrabold text-[var(--brand-4)] shadow-sm"
        >
          {{ tag }}
        </span>
      </div>

      <p class="mt-3 min-h-[48px] text-sm text-stone-300">
        {{ props.product.shortDescription }}
      </p>

      <p class="text-xs font-semibold uppercase tracking-[0.14em] text-stone-400">
        {{ props.product.protein }}
        <span v-if="props.product.cut"> • {{ props.product.cut }}</span>
      </p>

      <div class="mt-4 rounded-2xl border border-[color-mix(in_srgb,var(--brand-3)_35%,white)] bg-[color-mix(in_srgb,var(--brand-5)_62%,white)] p-3">
        <p class="text-xs font-extrabold uppercase tracking-[0.22em] text-emerald-400">
          Coming Soon
        </p>

        <h4 class="mt-1 text-base font-extrabold text-[var(--brand-4)]">
          This product is not available yet
        </h4>

        <p class="mt-1 text-sm leading-relaxed text-stone-300">
          Pricing, sizes, and launch details will be announced when this treat goes live.
        </p>
      </div>

      <div class="mt-auto flex items-center justify-between gap-2 pt-5">
        <button
          class="rounded-lg border border-emerald-400 px-3 py-2 text-sm font-semibold text-emerald-400 hover:bg-stone-900"
          @click.stop="emit('preview', props.product)"
        >
          Preview
        </button>

        <button
          class="focus-ring rounded-lg bg-emerald-400 px-4 py-2 font-semibold text-[var(--brand-4)] hover:bg-emerald-300"
          @click.stop="emit('preview', props.product)"
        >
          Notify Me
        </button>
      </div>
    </div>
  </article>
</template>
