<script setup>
import { computed, nextTick, onMounted, ref } from 'vue'
import { ArrowRight, House, PawPrint, RefreshCw } from '@lucide/vue'
import { PAGE_RECOVERY } from '../content/pageRecovery.js'
import labPhoto from '../../assets/images/brand/labradors-recovery-trail-v1.webp'

const props = defineProps({ kind: { type: String, default: 'not-found' }, retrying: Boolean, focusOnMount: Boolean })
defineEmits(['retry'])
const page = computed(() => PAGE_RECOVERY[props.kind] || PAGE_RECOVERY['not-found'])
const heading = ref(null)
onMounted(async () => {
  await nextTick()
  if (props.focusOnMount || document.activeElement === document.body) heading.value?.focus()
})
</script>
<template>
  <section class="store-inner grid items-center gap-8 py-10 md:grid-cols-2 md:gap-12 md:py-16" aria-labelledby="page-recovery-title">
    <div class="min-w-0">
      <p class="mb-4 flex items-center gap-2 text-sm font-semibold text-[var(--storefront-brand-1)]"><PawPrint :size="18" aria-hidden="true" />{{ page.label }}</p>
      <h1 id="page-recovery-title" ref="heading" tabindex="-1" class="max-w-md text-4xl font-bold leading-tight text-[var(--storefront-brand-4)] [overflow-wrap:anywhere] outline-none">{{ page.title }}</h1>
      <p class="store-muted mt-5 max-w-md text-base leading-relaxed">{{ page.description }}</p>
      <div class="mt-7 flex flex-wrap gap-3">
        <button v-if="kind === 'unavailable'" type="button" class="store-button store-button-primary" :disabled="retrying" @click="$emit('retry')"><RefreshCw :size="18" aria-hidden="true" />{{ retrying ? 'Trying again...' : 'Try again' }}</button>
        <RouterLink v-else to="/#shop" class="store-button store-button-primary">Back to treats<ArrowRight :size="18" aria-hidden="true" /></RouterLink>
        <RouterLink :to="kind === 'unavailable' ? '/#shop' : '/'" class="store-button"><House :size="18" aria-hidden="true" />{{ kind === 'unavailable' ? 'Visit the shop' : 'Go home' }}</RouterLink>
      </div>
      <p class="store-muted mt-7 text-sm">Need a hand? <RouterLink to="/contact" class="inline-flex min-h-11 items-center font-semibold text-[var(--storefront-brand-1)] underline underline-offset-4">Contact us</RouterLink></p>
    </div>
    <figure class="min-w-0 overflow-hidden rounded-lg border border-[#ddd9d2] bg-white shadow-sm">
      <img :src="labPhoto" alt="Illustrative black and chocolate Labradors beside a blank trail sign" width="1200" height="900" class="aspect-[4/3] w-full object-cover" />
      <figcaption class="flex flex-wrap items-center justify-between gap-2 px-5 py-4"><span class="text-base font-semibold text-[var(--storefront-brand-4)]">{{ page.aside }}</span><span class="store-muted text-xs">Illustrative photograph</span></figcaption>
    </figure>
  </section>
</template>
