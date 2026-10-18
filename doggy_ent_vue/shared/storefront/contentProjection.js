import { SECTION_CATALOG } from './sectionCatalog.js'
import { commercePresentation, CHECKOUT_PRESENTATION, CONFIRMATION_PRESENTATION } from './commercePresentation.js'
import { pagePresentation, PAGE_PRESENTATION, announcementMessages } from './pagePresentation.js'

// Explicit projection prevents arbitrary/private fields being stored or returned.
export function projectStorefrontContent(doc) {
  const pick = (value, keys) => Object.fromEntries(keys.map((key) => [key, value[key]]))
  const commerce = commercePresentation(doc)
  return {
    version: 1,
    presentation: Object.fromEntries(Object.entries(pagePresentation(doc)).map(([key, value]) => {
      const projected = pick(value, Object.keys(PAGE_PRESENTATION[key]))
      if (key === 'brand') projected.portraits = value.portraits.map(item => pick(item, ['name', 'tagline', 'text', 'image', 'alt']))
      return [key, projected]
    })),
    checkout: pick(commerce.checkout, Object.keys(CHECKOUT_PRESENTATION)),
    confirmation: pick(commerce.confirmation, Object.keys(CONFIRMATION_PRESENTATION)),
    announcement: { ...pick(doc.announcement, ['visible', 'text', 'href']), rotate: doc.announcement.rotate === true, messages: announcementMessages(doc.announcement).map(item => pick(item, ['text', 'href'])) },
    header: { ...pick(doc.header, ['brandName', 'searchPlaceholder']), links: doc.header.links.map((link) => pick(link, ['label', 'href'])) },
    footer: { ...pick(doc.footer, ['visible', 'brandName', 'text', 'tagline', 'background', 'backgroundImage']), links: doc.footer.links.map((link) => pick(link, ['label', 'href'])), social: pick(doc.footer.social, ['instagram', 'tiktok', 'youtube']) },
    theme: { ...pick(doc.theme, ['season', 'backgroundImage']), monogram: doc.theme.monogram !== false, columns: doc.theme.columns || '4' },
    sections: doc.sections.map((block) => ({ ...pick(block, ['id', 'type', 'visible']), settings: pick({ ...SECTION_CATALOG[block.type].defaults, ...block.settings }, [...Object.keys(SECTION_CATALOG[block.type].defaults), 'background', 'backgroundImage']) })),
  }
}
