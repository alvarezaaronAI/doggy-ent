<script setup>
import { computed, onMounted } from 'vue'
import ContentLink from '@storefront/components/ContentLink.vue'
import { useStorefrontContent } from '@storefront/composables/useStorefrontContent.js'
import { visibleStorefrontLinks } from '@storefront-content/sectionCatalog.js'
import { createSocialLinks } from '@storefront/utils/socialLinks.js'
import { mediaImageSource } from '@shared/utils/mediaImage.js'
const props = defineProps({ content: Object, preview: Boolean })
const { content: liveContent, loadContent } = useStorefrontContent()
const page = computed(() => props.content || liveContent.value)
const footer = computed(() => page.value.footer)
const links = computed(() => visibleStorefrontLinks(footer.value.links, page.value.sections))
const shopLinks = computed(() => links.value.filter(link => /#(?:shop|coming-soon|ingredients)$/.test(link.href) || link.href.startsWith('/campaigns/') || link.href === '/meet-chase-evie'))
const helpLinks = computed(() => links.value.filter(link => !shopLinks.value.includes(link)))
const socialLinks = computed(() => createSocialLinks(footer.value.social))
const background = computed(() => ({
  backgroundColor: { white: '#fff', giving: '#edf6f0', oat: 'var(--storefront-brand-5)' }[footer.value.background],
  ...(footer.value.backgroundImage ? { backgroundImage: `linear-gradient(rgba(255,255,255,.70),rgba(255,255,255,.70)), url(${JSON.stringify(mediaImageSource(footer.value.backgroundImage))})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}),
}))
onMounted(() => { if (!props.preview) loadContent() })
</script>
<template>
  <footer v-if="footer.visible" class="site-footer" :style="background">
    <div class="site-footer-inner">
      <div>
        <RouterLink to="/" class="site-footer-brand"
          ><span class="site-footer-mark"
            ><i class="fa-solid fa-paw" aria-hidden="true"></i></span
          ><span>{{ footer.brandName }}</span></RouterLink
        >
        <p class="site-footer-intro">
          {{ footer.text }}
        </p>
        <nav class="site-footer-social" aria-label="Social media">
          <template v-for="link in socialLinks" :key="link.label"><a v-if="link.href" :href="link.href" :aria-label="link.label + ' (opens in a new tab)'" target="_blank" rel="noopener noreferrer"><i :class="['fa-brands', link.icon]" aria-hidden="true"></i><span>{{ link.label }}</span></a><span v-else role="link" aria-disabled="true" :aria-label="link.label + ' profile coming soon'" class="site-social-placeholder"><i :class="['fa-brands', link.icon]" aria-hidden="true"></i><span>{{ link.label }}</span></span></template>
        </nav>
      </div>
      <div><h2 class="mb-2 text-xs font-semibold">Shop &amp; discover</h2><nav aria-label="Footer shop"><ContentLink v-for="(link, index) in shopLinks" :key="index" :href="link.href">{{ link.label }}</ContentLink></nav></div>
      <div><h2 class="mb-2 text-xs font-semibold">Here to help</h2><nav aria-label="Footer help"><ContentLink v-for="(link, index) in helpLinks" :key="index" :href="link.href">{{ link.label }}</ContentLink><ContentLink href="/account">Your account</ContentLink><RouterLink to="/shipping-returns" :inert="preview || undefined">Shipping &amp; returns</RouterLink><RouterLink to="/contact" :inert="preview || undefined">Contact</RouterLink></nav></div>
    </div>
    <div class="site-footer-bottom">
      <p>&copy; {{ new Date().getFullYear() }} {{ footer.brandName }}</p>
      <p>{{ footer.tagline }}</p>
      <nav aria-label="Footer policies"><RouterLink to="/privacy" :inert="preview || undefined">Privacy</RouterLink><RouterLink to="/terms" :inert="preview || undefined">Terms</RouterLink><RouterLink to="/cookies" :inert="preview || undefined">Cookies &amp; storage</RouterLink><RouterLink to="/accessibility" :inert="preview || undefined">Accessibility</RouterLink></nav>
    </div>
  </footer>
</template>
<style scoped>
.site-footer {
  color: #4b5563;
  background: var(--storefront-brand-5);
  border-top: 1px solid #e5d6bd;
}
.site-footer-inner {
  max-width: 1168px;
  margin: auto;
  padding: 22px 24px 14px;
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr) minmax(0, 1fr);
  gap: 20px;
  align-items: start;
}
.site-footer-brand {
  font-size: 18px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 750;
  color: #19201b;
  text-decoration: none;
}
.site-footer-mark {
  display: inline-flex;
  width: 32px;
  height: 32px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border: 2px solid var(--storefront-brand-1);
  border-radius: 50%;
  background: var(--storefront-brand-2);
  color: #19201b;
  font-size: 18px;
}
.site-footer-intro {
  margin-top: 8px;
  font-size: 12px;
  line-height: 1.6;
}
.site-footer nav {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  gap: 0 12px;
}
.site-footer-inner > div:not(:first-child) nav { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); align-items:start; gap:0 12px; }
.site-footer-inner > div:not(:first-child) nav a { justify-content:flex-start; }
.site-footer .site-footer-social { margin-top:8px; gap:12px; }
.site-footer .site-footer-social a {
  font-size: 12px;
  gap: 6px;
}
.site-social-placeholder {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: 32px;
  font-size: 12px;
  opacity: 0.45;
  cursor: default;
}
.site-footer a:focus-visible {
  outline: 2px solid var(--storefront-brand-1);
  outline-offset: 3px;
}
.site-footer nav a {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 32px;
  padding: 4px 0;
  color: #27342d;
  font-size: 12px;
  text-decoration: none;
  border-radius: 4px;
}
.site-footer nav a:hover {
  background: rgba(255, 255, 255, 0.55);
  color: var(--storefront-brand-1);
}
.site-footer-bottom {
  max-width: 1168px;
  margin: auto;
  padding: 12px 24px;
  border-top: 1px solid #e5d6bd;
  font-size: 11px;
  line-height: 1.6;
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
}
@media (max-width: 699px) {
  .site-footer-inner {
    grid-template-columns: repeat(2,minmax(0, 1fr));
    gap:16px;
  }
  .site-footer-inner > div:first-child { grid-column:1/-1; }
  .site-footer-bottom {
    flex-direction: column;
    align-items: flex-start;
  }
}
@media (max-width: 639px) {
  .site-footer-inner,
  .site-footer-bottom {
    padding-inline: 16px;
  }
  .site-footer-brand {
    font-size: 18px;
  }
}
@media(pointer:coarse) { .site-footer nav a,.site-social-placeholder { min-height:44px; min-width:44px; } }
</style>
