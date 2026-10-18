export const WEBSITE_PAGES = [
  { label: 'Storefront pages', items: [['home', 'Homepage'], ['campaign', 'Campaign page'], ['brand', 'Chase & Evie story']] },
  { label: 'Shared components', items: [['shell', 'Header, announcement & footer'], ['cards', 'Product cards'], ['quick', 'Product pop-out']] },
  { label: 'Commerce pages', items: [['checkout', 'Checkout'], ['confirmation', 'Order confirmation']] },
]
export function websiteSections(page, draft) {
  if (page === 'home') return draft.sections.map(block => [block.id, block.settings.title || block.type])
  if (page === 'shell') return [['announcement', 'Announcement messages'], ['header', 'Header & navigation'], ['theme', 'Background & product density'], ['footer', 'Footer & links']]
  if (page === 'confirmation') return [['confirmation', 'Welcome & background'], ['confirmation-next', 'Next steps'], ['confirmation-help', 'Help & links']]
  return [[page, ({ cards: 'Card action wording', quick: 'Pop-out wording', campaign: 'Campaign presentation', brand: 'Brand story & chapters', checkout: 'Heading & wallets' })[page]]]
}
export const PRESENTATION_FIELDS = {
  cards: { quickViewLabel: 'View details button wording', addLabel: 'Add to bag button wording' },
  quick: { title: 'Label above the product name', introduction: 'Pop-out introduction', detailsLabel: 'Ingredients tab wording', careLabel: 'Serving & storage tab wording' },
  campaign: { partnerLabel: 'Partner section label', storyTitle: 'Partner story heading', programsTitle: 'Partner programmes heading', whyTitle: 'Why this partner heading', givingTitle: 'Contribution section label', productsTitle: 'Eligible products label' },
  brand: { title: 'Brand page headline', introduction: 'Introduction beneath the headline', storyTitle: 'Origin story heading', story: 'Origin story paragraphs', pairTitle: 'Portrait section heading', journeyTitle: 'Brand journey heading', galleryTitle: 'Everyday moments heading', valuesTitle: 'Brand values heading', closingTitle: 'Closing shopping invitation' },
}
