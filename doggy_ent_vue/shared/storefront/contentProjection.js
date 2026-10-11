import { SECTION_CATALOG } from './sectionCatalog.js'
import { commercePresentation, CHECKOUT_PRESENTATION, CONFIRMATION_PRESENTATION } from './commercePresentation.js'

// Explicit projection prevents arbitrary/private fields being stored or returned.
export function projectStorefrontContent(doc) {
  const pick = (value, keys) => Object.fromEntries(keys.map((key) => [key, value[key]]))
  const commerce = commercePresentation(doc)
  return {
    version: 1,
    checkout: pick(commerce.checkout, Object.keys(CHECKOUT_PRESENTATION)),
    confirmation: pick(commerce.confirmation, Object.keys(CONFIRMATION_PRESENTATION)),
    announcement: pick(doc.announcement, ['visible', 'text', 'href']),
    header: { ...pick(doc.header, ['brandName', 'searchPlaceholder']), links: doc.header.links.map((link) => pick(link, ['label', 'href'])) },
    footer: { ...pick(doc.footer, ['visible', 'brandName', 'text', 'tagline', 'background', 'backgroundImage']), links: doc.footer.links.map((link) => pick(link, ['label', 'href'])), social: pick(doc.footer.social, ['instagram', 'tiktok', 'youtube']) },
    theme: pick(doc.theme, ['season', 'backgroundImage']),
    sections: doc.sections.map((block) => ({ ...pick(block, ['id', 'type', 'visible']), settings: pick(block.settings, [...Object.keys(SECTION_CATALOG[block.type].defaults), 'background', 'backgroundImage']) })),
  }
}
