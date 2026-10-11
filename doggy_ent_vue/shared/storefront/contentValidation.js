import { SECTION_CATALOG } from './sectionCatalog.js'
import { createSocialLinks } from './socialLinks.js'
import { getMediaAssetId } from './mediaRules.js'
import { commercePresentation, CHECKOUT_PRESENTATION, CONFIRMATION_PRESENTATION } from './commercePresentation.js'

export function isSafeContentUrl(value, { image = false } = {}) {
  if (value === '') return true
  if (typeof value !== 'string' || value.length > 1200 || /[\s\\\u0000-\u001f]/.test(value)) return false
  if (value.startsWith('/') && !value.startsWith('//')) {
    if (image) return Boolean(getMediaAssetId(value))
    try {
      const url = new URL(value, 'https://storefront.invalid')
      if (/%(?:2f|5c|25)/i.test(url.pathname)) return false
      const path = decodeURIComponent(url.pathname)
      return !/[\\\u0000-\u001f]/.test(path) && !/^\/(?:api|admin)(?:\/|$)/i.test(path)
    } catch { return false }
  }
  try {
    const url = new URL(value)
    return url.protocol === 'https:' && !url.username && !url.password
  } catch { return false }
}

const palette = ['default', 'white', 'oat', 'giving']
function text(value, max = 1200) { return typeof value === 'string' && value.length <= max }
function links(value) {
  return Array.isArray(value) && value.length <= 12 && value.every((link) =>
    link && text(link.label, 80) && link.label.trim() && isSafeContentUrl(link.href) && link.href)
}

export function validateStorefrontContent(doc) {
  if (!doc || doc.version !== 1) return 'Unsupported website content version.'
  const { checkout, confirmation } = commercePresentation(doc)
  for (const [key, defaults] of [['checkout', CHECKOUT_PRESENTATION], ['confirmation', CONFIRMATION_PRESENTATION]]) {
    if (doc[key] && (typeof doc[key] !== 'object' || Object.keys(doc[key]).some(field => !(field in defaults)))) return 'Unsupported checkout or confirmation setting.'
  }
  if (![checkout.title, checkout.introduction].every(value => text(value, 300) && value.trim()) || typeof checkout.applePay !== 'boolean' || typeof checkout.googlePay !== 'boolean') return 'Check the checkout heading and wallet settings.'
  if (!Object.entries(confirmation).every(([key, value]) => key === 'background' ? palette.includes(value) : key === 'helpUrl' ? isSafeContentUrl(value) && value : text(value, 500) && value.trim())) return 'Check the order confirmation text, background and help destination.'
  if (new TextEncoder().encode(JSON.stringify(doc)).length > 90000) return 'Website content is too large. Reduce text, links, or sections before saving.'
  const { announcement: a, header: h, footer: f, theme: t } = doc
  if (!a || typeof a.visible !== 'boolean' || !text(a.text, 300) || !isSafeContentUrl(a.href)) return 'Check the announcement text and link.'
  if (!h || !text(h.brandName, 80) || !h.brandName.trim() || !text(h.searchPlaceholder, 100) || !links(h.links)) return 'Check the header name, search text, and navigation links.'
  if (!f || typeof f.visible !== 'boolean' || !text(f.brandName, 80) || !f.brandName.trim() || !text(f.text, 500) || !text(f.tagline, 500) || !palette.includes(f.background) || !isSafeContentUrl(f.backgroundImage, { image: true }) || !links(f.links)) return 'Check the footer content and links.'
  if (!f.social || !['instagram', 'tiktok', 'youtube'].every((key) => isSafeContentUrl(f.social[key], { image: true }))) return 'Social destinations must be HTTPS links.'
  if (createSocialLinks(f.social).some(link => f.social[link.label.toLowerCase()] && !link.href)) return 'Social links must point to profiles on their matching platforms.'
  if (!t || !['original', 'autumn', 'winter'].includes(t.season) || !isSafeContentUrl(t.backgroundImage, { image: true })) return 'Choose a supported season and an uploaded image or HTTPS background image.'
  if (!Array.isArray(doc.sections) || doc.sections.length < 1 || doc.sections.length > 24) return 'Use between 1 and 24 homepage sections.'
  const ids = new Set(), singletonTypes = new Set()
  for (const block of doc.sections) {
    if (!block || !/^[a-z][a-z0-9-]{0,59}$/.test(block.id) || ['header', 'footer', 'announcement', 'theme', 'cart-drawer', 'site-account-menu', 'site-mobile-menu'].includes(block.id) || ids.has(block.id)) return 'Section anchors must be unique, lowercase names.'
    ids.add(block.id)
    const definition = SECTION_CATALOG[block.type]
    if (!definition || typeof block.visible !== 'boolean') return 'Choose a supported section type.'
    if (definition.singleton && singletonTypes.has(block.type)) return 'This section type can only appear once.'
    singletonTypes.add(block.type)
    const s = block.settings
    if (!s || !palette.includes(s.background) || !isSafeContentUrl(s.backgroundImage, { image: true })) return 'Check the section background.'
    const allowed = new Set([...Object.keys(definition.defaults), 'background', 'backgroundImage'])
    if (Object.keys(s).some((key) => !allowed.has(key))) return 'A section contains unsupported settings.'
    for (const key of Object.keys(definition.defaults)) {
      const value = s[key]
      if (key === 'items') {
        if (!Array.isArray(value) || value.length > 12 || value.some((item) => !item || Object.keys(item).some((field) => !['title', 'text', 'image', 'alt', 'href'].includes(field)) || !text(item.title ?? '', 160) || !text(item.text ?? '', 2000) || !text(item.alt ?? '', 240) || !isSafeContentUrl(item.image ?? '', { image: true }) || !isSafeContentUrl(item.href ?? ''))) return 'Check the section items, image descriptions, and links.'
      } else if (key === 'tags') {
        if (!Array.isArray(value) || value.length > 12 || value.some(tag => !text(tag, 120))) return 'Use up to 12 short hero badges.'
      } else if (key === 'productIds') {
        if (!Array.isArray(value) || value.length > 100 || value.some((id) => !text(id, 80))) return 'Check the selected products.'
      } else if (['buttonUrl', 'secondaryUrl', 'storyUrl'].includes(key)) {
        if (!isSafeContentUrl(value)) return 'Buttons need a safe site path or HTTPS destination.'
      } else if (key === 'image') {
        if (!isSafeContentUrl(value, { image: true })) return 'Choose an uploaded image or a valid HTTPS image URL.'
      } else if (!text(value, key === 'text' ? 6000 : key === 'imageAlt' ? 240 : 300)) return 'Some content is missing or too long.'
    }
    if (s.image && !s.imageAlt?.trim()) return 'Add an image description for each section image.'
    if (s.items?.some((item) => item.image && !item.alt?.trim())) return 'Add an image description for each gallery image.'
    if (block.type === 'gallery' && s.items.some(item => !item.image?.trim() || !item.alt?.trim())) return 'Gallery items need an image and image description.'
    if (['process', 'help'].includes(block.type) && s.items.some(item => !item.title?.trim() || !item.text?.trim())) return 'Section items need a title and body text.'
    if (['promise', 'hero'].includes(block.type) && s.items.some(item => !item.title?.trim() || !item.href?.trim())) return 'Supporting links need a label and destination.'
    if ('title' in s && !s.title.trim()) return 'Add a heading to each content section.'
    if (s.buttonLabel && !s.buttonUrl && block.type !== 'hero') return 'Add a destination for the section button.'
  }
  if (!doc.sections.some((block) => block.visible)) return 'Keep at least one homepage section visible.'
  return ''
}
