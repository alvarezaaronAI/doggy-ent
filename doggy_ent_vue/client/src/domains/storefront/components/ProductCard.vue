

<script setup>
import { RouterLink } from 'vue-router'

const props = defineProps({
  product: {
    type: Object,
    required: true,
  },
  formatPrice: {
    type: Function,
    required: true,
  },
  getDisplayTags: {
    type: Function,
    required: true,
  },
  getProductVariants: {
    type: Function,
    required: true,
  },
  getSelectedCardSize: {
    type: Function,
    required: true,
  },
  selectCardSize: {
    type: Function,
    required: true,
  },
  getSelectedCardPrice: {
    type: Function,
    required: true,
  },
  getSelectedCardVariant: {
    type: Function,
    required: true,
  },
  getSelectedStockLabel: {
    type: Function,
    required: true,
  },
  isPurchasable: {
    type: Function,
    required: true,
  },
})

const emit = defineEmits(['quick-view', 'add-to-cart'])
</script>

<template>
  <article
    class="tile-strong flex h-full min-h-[500px] flex-col overflow-hidden rounded-2xl transition hover:-translate-y-1 hover:shadow-2xl"
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

      <p class="mt-3 min-h-[52px] text-sm text-stone-300">
        {{ props.product.shortDescription }}
      </p>

      <p class="text-xs font-semibold uppercase tracking-[0.14em] text-stone-400">
        {{ props.product.protein }}
        <span v-if="props.product.cut"> • {{ props.product.cut }}</span>
      </p>

      <div class="mt-3 border-t border-[color-mix(in_srgb,var(--brand-3)_30%,white)] pt-3">
        <div class="flex items-center gap-2">
          <button
            v-for="variant in props.getProductVariants(props.product)"
            :key="variant.size"
            class="rounded-full border px-3 py-1 text-xs font-extrabold transition"
            :class="props.getSelectedCardSize(props.product) === variant.size
              ? 'border-emerald-400 bg-emerald-400 text-[var(--brand-4)]'
              : 'border-stone-700 bg-white text-stone-700 hover:border-emerald-400'"
            @click.stop="props.selectCardSize(props.product, variant.size)"
          >
            {{ variant.size }}
          </button>
        </div>

        <div class="mt-3 flex items-end justify-between gap-3">
          <p class="text-lg font-extrabold text-[var(--brand-4)]">
            {{ props.formatPrice(props.getSelectedCardPrice(props.product)) }}
          </p>

          <p
            class="text-xs font-bold uppercase tracking-[0.12em]"
            :class="props.isPurchasable(props.product, props.getSelectedCardVariant(props.product))
              ? 'text-[color:var(--success-1)]'
              : 'text-amber-700'"
          >
            {{ props.getSelectedStockLabel(props.product) }}
          </p>
        </div>
      </div>

      <div class="mt-auto flex items-center justify-between gap-2 pt-5">
        <button
          class="rounded-lg border border-stone-700 px-4 py-2 font-semibold text-stone-700 transition hover:border-emerald-400 hover:text-emerald-400"
          @click.stop="emit('quick-view', props.product)"
        >
          Quick View
        </button>

        <button
          v-if="props.isPurchasable(props.product, props.getSelectedCardVariant(props.product))"
          class="focus-ring rounded-lg bg-emerald-400 px-4 py-2 font-semibold text-[var(--brand-4)] hover:bg-emerald-300"
          @click.stop="emit('add-to-cart', props.product)"
        >
          Add to Cart
        </button>

        <button
          v-else
          class="focus-ring rounded-lg bg-emerald-400 px-4 py-2 font-semibold text-[var(--brand-4)] hover:bg-emerald-300"
          @click.stop="emit('quick-view', props.product)"
        >
          Notify Me
        </button>
      </div>
    </div>
  </article>
</template>