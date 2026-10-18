import { DEFAULT_SOCIAL_URLS } from './socialLinks.js'
import { commercePresentation } from './commercePresentation.js'
import { pagePresentation } from './pagePresentation.js'
// Public content only. Commerce data continues to come from the product API.
export const SECTION_CATALOG = {
  hero: { label: 'Hero', singleton: true, defaults: { title: 'Small-Batch Dog Treats', eyebrow: '', lead: 'Good treats. Good company.', text: '', image: '', imageAlt: 'An illustrative dog enjoying the outdoors', buttonLabel: '', buttonUrl: '', secondaryLabel: 'See ingredients', secondaryUrl: '/#ingredients', storyLabel: 'Meet Chase & Evie', storyUrl: '/meet-chase-evie', tags: [], items: [
    { title: 'Guest checkout', text: '', href: '/#shop' },
    { title: 'Made with care', text: '', href: '/#process' },
    { title: 'Ingredient details', text: '', href: '/#ingredients' },
  ] } },
  promise: { label: 'Brand promises', singleton: true, defaults: { items: [
    { title: 'Simple ingredients', text: '', href: '/#ingredients' },
    { title: 'Small-batch care', text: '', href: '/#process' },
    { title: 'Good company', text: '', href: '/meet-chase-evie' },
  ] } },
  giving: { label: 'Giving spotlight', singleton: true, defaults: { eyebrow: 'A little treat. A little good.', title: 'Good treats, shared purpose.', text: 'Campaign contributions come from eligible purchases. Nothing extra is added to your total.' } },
  spotlight: { label: 'Featured product', singleton: true, defaults: { eyebrow: 'Featured treat', productId: '', title: 'A little favourite.', text: '' } },
  collection: { label: 'Product collection', defaults: { eyebrow: 'The collection', title: 'All Treats', text: '', productIds: [] } },
  drops: { label: 'Next Drops', singleton: true, defaults: { eyebrow: 'Something to look forward to', title: 'Next Drops', text: "A look at what we're working on. Availability and launch details will appear here when they're ready.", buttonLabel: "Shop today's treats", buttonUrl: '/#shop' } },
  gallery: { label: 'Happy Pups / gallery', defaults: { eyebrow: 'Everyday adventures', title: 'Happy Pups', text: 'Good treats. Even better company.', caption: 'Illustrative gallery. Customer stories and verified reviews are coming in a future phase.', sampleReviews: false, items: [] } },
  process: { label: 'Made with care', singleton: true, defaults: { eyebrow: 'From kitchen to treat bag', title: 'Made with care.', text: 'A little care in every batch, from first cut to final bag.', image: '', imageAlt: 'Illustrative preparation detail, not the actual kitchen', items: [
    { title: 'Source simply', text: 'Simple protein cuts are the starting point for our treats.' },
    { title: 'Prepare with care', text: 'Trim, slice, and dehydrate low and slow for texture and flavor.' },
    { title: 'Pack in small batches', text: 'Thoughtfully packed treats, ready for the moments you share.' },
  ] } },
  ingredients: { label: 'Ingredient promise', singleton: true, defaults: { eyebrow: 'Know what goes in', title: 'Our ingredient promise.', text: "Clear ingredients, thoughtful preparation. Check each treat's details to find the right fit for your pup.", buttonLabel: 'Explore the collection', buttonUrl: '/#shop' } },
  brand: { label: 'Meet the brand', singleton: true, defaults: { eyebrow: 'Meet the brand', title: 'Built from real life.', text: "Two labs, big appetites, and a search for treats that felt simple and trustworthy. That's where our story began.\n\nWe keep things thoughtful: straightforward ingredients, small batches, and something to feel good about sharing.", image: '', imageAlt: 'An illustrative dog enjoying the outdoors', caption: 'Illustrative photo', buttonLabel: 'More about Chase & Evie', buttonUrl: '/meet-chase-evie' } },
  help: { label: 'Shopping help', singleton: true, defaults: { eyebrow: 'A little help', title: 'Before you treat.', items: [
    { title: 'Which bag size?', text: 'Choose a size on each treat to see its price and availability. Your selected size goes into the cart.' },
    { title: 'How does giving work?', text: 'Eligible treats show the campaign they support. Contributions are funded from eligible purchases, not added to your total.' },
    { title: 'What about shipping?', text: 'Shipping and taxes are calculated at checkout before payment. Sign in for order history, or check out as a guest.' },
  ] } },
  banner: { label: 'Sale / announcement banner', defaults: { eyebrow: '', title: 'A little something special', text: '', buttonLabel: 'Shop treats', buttonUrl: '/#shop', image: '', imageAlt: '' } },
  story: { label: 'Image & story', defaults: { eyebrow: '', title: 'Our latest story', text: '', image: '', imageAlt: '', buttonLabel: '', buttonUrl: '' } },
}

export function sectionSettings(type, settings = {}) {
  return { ...structuredClone(SECTION_CATALOG[type]?.defaults || {}), background: 'default', backgroundImage: '', ...settings }
}

export function createSection(type, id) {
  return { id, type, visible: true, settings: sectionSettings(type) }
}

export function createDefaultStorefrontContent() {
  const links = [
    ['Shop', '/#shop'], ['Giving', '/#giving'], ['Our story', '/meet-chase-evie'],
  ].map(([label, href]) => ({ label, href }))
  const copy = {
    hero: { title: 'Chase & Evie Co.', eyebrow: 'Good treats. Good company.', lead: '', text: 'Small-batch dog treats for their everyday adventures. Thoughtful ingredients. A little more joy in every bag.', buttonLabel: 'Shop the treats', buttonUrl: '/#shop', secondaryLabel: '', items: [] },
    collection: { eyebrow: '', title: 'All treats', text: 'Find their next favourite.' },
    giving: { eyebrow: '', title: 'A little treat. A little good.', text: 'Discover a campaign and the treats that support it, with no extra donation added to your bill.' },
    drops: { eyebrow: '', text: 'A first look at the treats we are imagining next.' },
    process: { eyebrow: 'From our little kitchen to their good days', title: 'Made with care', text: 'Thoughtful preparation, from the protein cut to the finished treat bag.' },
    ingredients: { eyebrow: '', title: 'Our ingredient promise' },
    brand: { eyebrow: '', title: 'Two dogs. A simple idea.', text: 'Chase and Evie inspired a search for simple, trustworthy treats. Meet the pair behind the name.', buttonLabel: 'Meet Chase & Evie' },
  }
  const footerLinks = [
    ['All treats', '/#shop'], ['Next Drops', '/#coming-soon'], ['Giving campaigns', '/#giving'],
    ['Ingredients', '/#ingredients'], ['Our story', '/meet-chase-evie'], ['Shopping help', '/account/help'],
  ].map(([label, href]) => ({ label, href }))
  return {
    version: 1,
    ...commercePresentation(),
    presentation: pagePresentation(),
    announcement: { visible: true, text: 'Small-batch treats. Thoughtful ingredients. Good company.', href: '' },
    header: { brandName: 'Chase & Evie Co.', searchPlaceholder: 'Search treats, proteins, tags...', links },
    footer: { visible: true, brandName: 'Chase & Evie Co.', text: 'Small-batch dog treats inspired by Chase & Evie.', tagline: 'Made for happy pups and everyday adventures.', background: 'oat', backgroundImage: '', links: footerLinks, social: { instagram: DEFAULT_SOCIAL_URLS.instagram, tiktok: '', youtube: '' } },
    theme: { season: 'original', backgroundImage: '', monogram: true, columns: '4' },
    sections: [
      ['hero', 'hero'], ['promise', 'promise'], ['spotlight', 'spotlight'],
      ['shop', 'collection'], ['giving', 'giving'], ['coming-soon', 'drops'],
      ['process', 'process'], ['reviews', 'gallery'], ['ingredients', 'ingredients'], ['about', 'brand'], ['faq', 'help'],
    ].map(([id, type]) => ({ ...createSection(type, id), visible: !['promise', 'help'].includes(type), settings: sectionSettings(type, copy[type]) })),
  }
}

export function visibleStorefrontLinks(links, sections) {
  const visible = new Set(sections.filter((section) => section.visible).map((section) => section.id))
  return links.filter((link) => !link.href.startsWith('/#') || visible.has(link.href.slice(2)))
}
