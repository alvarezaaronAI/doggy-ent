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
      </div>
      <nav aria-label="Footer">
        <ContentLink v-for="(link, index) in links" :key="index" :href="link.href">{{ link.label }}</ContentLink>
      </nav>
      <div class="site-footer-social">
        <nav aria-label="Social media">
          <template v-for="link in socialLinks" :key="link.label">
            <a
              v-if="link.href"
              :href="link.href"
              :aria-label="link.label + ' (opens in a new tab)'"
              target="_blank"
              rel="noopener noreferrer"
              ><i :class="['fa-brands', link.icon]" aria-hidden="true"></i
            ></a>
            <span
              v-else
              role="link"
              aria-disabled="true"
              :aria-label="link.label + ' profile coming soon'"
              :title="link.label + ' profile coming soon'"
              class="site-social-placeholder"
              ><i :class="['fa-brands', link.icon]" aria-hidden="true"></i
            ></span>
          </template>
        </nav>
        <p
          v-if="socialLinks.some((link) => !link.href)"
          class="mt-3 text-center text-xs"
        >
          More social links coming soon.
        </p>
      </div>
    </div>
    <div class="site-footer-bottom">
      <p>&copy; {{ new Date().getFullYear() }} {{ footer.brandName }}</p>
      <p>{{ footer.tagline }}</p>
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
  max-width: 1280px;
  margin: auto;
  padding: 44px 24px;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.3fr);
  gap: 32px;
  align-items: center;
}
.site-footer-brand {
  font-size: 24px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 750;
  color: #19201b;
  text-decoration: none;
}
.site-footer-mark {
  display: inline-flex;
  width: 44px;
  height: 44px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  border: 2px solid var(--storefront-brand-1);
  border-radius: 50%;
  background: var(--storefront-brand-2);
  color: #19201b;
  font-size: 24px;
}
.site-footer-intro {
  margin-top: 16px;
  font-size: 16px;
  line-height: 1.6;
}
.site-footer nav {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px 12px;
}
.site-footer .site-footer-social {
  grid-column: 1 / -1;
}
.site-footer .site-footer-social nav {
  gap: 16px;
}
.site-footer .site-footer-social a {
  font-size: 23px;
  width: 44px;
}
.site-social-placeholder {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  font-size: 23px;
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
  min-height: 44px;
  padding: 6px 8px;
  color: #27342d;
  font-size: 15px;
  text-decoration: none;
  border-radius: 4px;
}
.site-footer nav a:hover {
  background: rgba(255, 255, 255, 0.55);
  color: var(--storefront-brand-1);
}
.site-footer-bottom {
  max-width: 1280px;
  margin: auto;
  padding: 24px;
  border-top: 1px solid #e5d6bd;
  font-size: 14px;
  line-height: 1.6;
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
}
@media (max-width: 899px) {
  .site-footer-inner {
    grid-template-columns: minmax(0, 1fr);
  }
  .site-footer-bottom {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
}
@media (max-width: 639px) {
  .site-footer-inner,
  .site-footer-bottom {
    padding-inline: 16px;
  }
  .site-footer-brand {
    font-size: 22px;
  }
}
</style>
