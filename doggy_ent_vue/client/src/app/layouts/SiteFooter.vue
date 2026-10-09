<script setup>
import { BRAND_STORY_PATH } from '@storefront/constants/brandContent.js'
import { createSocialLinks } from '@storefront/utils/socialLinks.js'
const socialLinks = createSocialLinks({
  instagram: import.meta.env.VITE_INSTAGRAM_URL,
  tiktok: import.meta.env.VITE_TIKTOK_URL,
  youtube: import.meta.env.VITE_YOUTUBE_URL,
})
const links = [
  ['All Treats', { path: '/', hash: '#shop' }],
  ['Coming Soon', { path: '/', hash: '#coming-soon' }],
  ['How We Make Them', { path: '/', hash: '#process' }],
  ['Ingredients', { path: '/', hash: '#ingredients' }],
  ['Happy Pups', { path: '/', hash: '#reviews' }],
  ['Meet Chase & Evie', BRAND_STORY_PATH],
  ['FAQ', { path: '/', hash: '#faq' }],
]
</script>
<template>
  <footer class="site-footer">
    <div class="site-footer-inner">
      <div>
        <RouterLink to="/" class="site-footer-brand"
          ><span class="site-footer-mark"
            ><i class="fa-solid fa-paw" aria-hidden="true"></i></span
          ><span>Chase &amp; Evie Co.</span></RouterLink
        >
        <p class="site-footer-intro">
          Small-batch dog treats inspired by Chase &amp; Evie.
        </p>
      </div>
      <nav aria-label="Footer">
        <RouterLink v-for="[label, to] in links" :key="label" :to="to">{{
          label
        }}</RouterLink>
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
      <p>&copy; {{ new Date().getFullYear() }} Chase &amp; Evie Co.</p>
      <p>Made for happy pups, simple treats, and small-batch drops.</p>
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
