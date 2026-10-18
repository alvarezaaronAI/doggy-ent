<script setup>
import { Eye, Heart } from '@lucide/vue'
import { BRAND_IMAGES } from '@storefront/constants/brandContent.js'
import StorefrontPhoto from '@storefront/components/StorefrontPhoto.vue'

defineProps({ labels: { type: Object, required: true } })
const programs = [
  { title: 'Everyday comfort', text: 'Meals, a safe place to rest and gentle routines.', image: BRAND_IMAGES.partner },
  { title: 'Foster support', text: 'Practical support while dogs settle into temporary homes.', image: BRAND_IMAGES.campaign },
  { title: 'Thoughtful introductions', text: 'Helping the next chapter start with the right match.', image: BRAND_IMAGES.adventure },
]
</script>

<template>
  <section class="store-inner">
    <header class="campaign-heading-row"><div><p class="campaign-eyebrow">The work behind the story</p><h2>{{ labels.programsTitle }}</h2></div><p>Three fictional programme examples, ready for your future partner facts.</p></header>
    <div class="campaign-programs">
      <article v-for="program in programs" :key="program.title" class="campaign-program">
        <StorefrontPhoto :image="program.image" :alt="'Illustrative Labrador photograph: ' + program.title" />
        <div class="campaign-program-copy"><h3>{{ program.title }}</h3><p>{{ program.text }}</p><small>Fictional programme example</small></div>
      </article>
    </div>
  </section>
  <section class="campaign-why-band">
    <div class="store-inner campaign-why-layout">
      <header><p class="campaign-eyebrow">Why this partner</p><h2>{{ labels.whyTitle }}</h2><p class="campaign-copy">A place to explain the connection, not just display a name.</p></header>
      <div class="grid gap-6">
        <div class="campaign-value"><Heart :size="22" aria-hidden="true" /><div><h3>Care that feels personal.</h3><p>Share the real values, local connection and work that made this partner meaningful to your brand.</p></div></div>
        <div class="campaign-value"><Eye :size="22" aria-hidden="true" /><div><h3>Clarity about the giving.</h3><p>Explain the actual campaign rule and publish partner updates only when verified.</p></div></div>
        <p class="campaign-note">Fictional partner examples. Attribution is not proof of a payout.</p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.campaign-programs { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 20px; }
.campaign-program { min-width: 0; overflow: hidden; border: 1px solid var(--store-line); border-radius: 8px; background: #fff; box-shadow: 0 8px 24px #293b3410; }
.campaign-program :deep(.storefront-photo) { border-radius: 0; box-shadow: none; --store-photo-ratio: 1.55; --store-photo-position: 50% 35%; }
.campaign-program-copy { padding: 18px; }
.campaign-program-copy h3 { font-size: 18px; line-height: 1.4; font-weight: 650; overflow-wrap: anywhere; }
.campaign-program-copy p { margin-top: 9px; color: var(--store-muted); font-size: 14px; line-height: 1.6; }
.campaign-program-copy small { display: block; margin-top: 12px; font-size: 12px; color: var(--store-muted); }
.campaign-why-band { background: color-mix(in srgb, var(--brand-2) 20%, white); }
.campaign-why-layout { display: grid; grid-template-columns: minmax(0, .85fr) minmax(0, 1.15fr); gap: 36px; }
.campaign-why-layout h2 { color: var(--brand-1); }
.campaign-value { display: flex; gap: 12px; align-items: flex-start; }
.campaign-value svg { flex-shrink: 0; color: var(--brand-1); }
.campaign-value h3 { font-size: 16px; line-height: 1.4; font-weight: 650; }
.campaign-value p { margin-top: 4px; color: var(--store-muted); font-size: 14px; line-height: 1.6; }
@media (max-width: 700px) { .campaign-why-layout { grid-template-columns: minmax(0, 1fr); gap: 24px; } .campaign-programs { gap: 12px; } .campaign-program-copy { padding: 14px; } }
@media (max-width: 500px) { .campaign-programs { grid-template-columns: minmax(0, 1fr); } }
@container website-preview (max-width:700px) { .campaign-why-layout { grid-template-columns: minmax(0, 1fr); gap: 24px; } }
@container website-preview (max-width:500px) { .campaign-programs { grid-template-columns: minmax(0, 1fr); } }
</style>
