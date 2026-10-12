import { readonly, ref } from 'vue'
import { createDefaultStorefrontContent } from '@storefront-content/sectionCatalog.js'
import { validateStorefrontContent } from '@storefront-content/contentValidation.js'
import { fetchStorefrontContent } from '../api/storefrontContent.api.js'
import { createSocialLinks } from '../utils/socialLinks.js'

export function createDefaultClientStorefrontContent() {
  const value = createDefaultStorefrontContent()
  const social = createSocialLinks({ instagram: import.meta.env.VITE_INSTAGRAM_URL, tiktok: import.meta.env.VITE_TIKTOK_URL, youtube: import.meta.env.VITE_YOUTUBE_URL })
  value.footer.social = Object.fromEntries(social.map(link => [link.label.toLowerCase(), link.href]))
  return value
}
const content = ref(createDefaultClientStorefrontContent())
const error = ref('')
let pending = null
let lastLoaded = 0
let generation = 0
export function useStorefrontContent() {
  async function loadContent({ force = false } = {}) {
    if (pending) return pending
    if (!force && Date.now() - lastLoaded < 60000) return
    const requestGeneration = ++generation
    pending = (async () => {
      try {
        const data = await fetchStorefrontContent()
        if (data.content && validateStorefrontContent(data.content)) throw new Error('Website content is temporarily unavailable.')
        if (requestGeneration !== generation) return
        content.value = data.content || createDefaultClientStorefrontContent()
        error.value = ''
      } catch (e) {
        // Last known good/default presentation must never block shopping.
        if (requestGeneration === generation) error.value = e.message
      } finally {
        lastLoaded = Date.now()
        pending = null
      }
    })()
    return pending
  }
  function usePublishedContent(value) {
    generation++
    content.value = structuredClone(value)
    lastLoaded = Date.now()
  }
  return { content: readonly(content), contentError: readonly(error), loadContent, usePublishedContent }
}
