// Generated from shared/storefront. Edit the canonical file, then run client and server builds.
export const PAGE_PRESENTATION = {
  cards: { background: 'white', quickViewLabel: 'Quick view', addLabel: 'Add to bag' },
  quick: { background: 'white', title: 'A closer look', introduction: 'Meet their next little favourite.', detailsLabel: 'Ingredients & details', careLabel: 'Serving & storage' },
  campaign: { background: 'giving', partnerLabel: 'Who we support', storyTitle: 'Good things happen together.', programsTitle: 'The everyday work behind a fresh start', whyTitle: 'Why we chose this partner', givingTitle: 'We give. You enjoy.', productsTitle: 'Treats with a little more purpose' },
  brand: {
    background: 'white',
    title: 'Meet Chase & Evie', introduction: 'The dogs behind the name. The everyday moments behind our treats.',
    storyTitle: 'Two dogs. A simple idea.', story: "Two labs, big appetites, and a search for treats that felt simple and trustworthy. That is where our story began.\n\nWe keep things thoughtful: straightforward ingredients, small batches, and something to feel good about sharing.",
    heroImage: '', heroAlt: 'Illustrative Labrador pair enjoying a woodland walk',
    pairTitle: 'The pair behind the name', galleryTitle: 'The good stuff happens together', valuesTitle: 'Keep the good things simple.', closingTitle: 'Bring a little of our story home.',
    portraits: [
      { name: 'Chase', tagline: 'A little adventure in the everyday.', text: 'A place for the explorer, the familiar walking companion, and the little habits that make Chase himself.', image: '', alt: 'Illustrative portrait template for Chase' },
      { name: 'Evie', tagline: 'A little joy in the little things.', text: 'A place for the favourite corner, the familiar routine, and the little moments that make Evie herself.', image: '', alt: 'Illustrative portrait template for Evie' },
    ],
    journeyTitle: 'Every good story starts somewhere.',
    journey: [
      { title: 'The question', text: 'Story template: describe the treats you were searching for and what mattered to you.' },
      { title: 'The first small batch', text: 'Story template: share the first experiments and what you learned.' },
      { title: 'Good company grows', text: 'Story template: explain where the brand is now and what matters next.' },
    ],
  },
}

export function pagePresentation(doc = {}) {
  return Object.fromEntries(Object.entries(PAGE_PRESENTATION).map(([key, defaults]) => [key, {
    ...structuredClone(defaults), ...(doc.presentation?.[key] || {}),
  }]))
}

export function announcementMessages(announcement) {
  return Array.isArray(announcement.messages) ? announcement.messages : [{ text: announcement.text, href: announcement.href }]
}

export const PRESENTATION_COLORS = { white: '#ffffff', oat: '#f3e8d2', giving: '#edf6f0' }
