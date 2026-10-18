import { describe, expect, it } from 'vitest'
import { createSSRApp } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { createMemoryHistory, createRouter } from 'vue-router'
import BrandPageContent from '../../../src/domains/storefront/components/BrandPageContent.vue'
import StorefrontPhoto from '../../../src/domains/storefront/components/StorefrontPhoto.vue'
import CampaignPageContent from '../../../src/domains/campaigns/components/CampaignPageContent.vue'
import AdminPresentationFields from '../../../src/domains/admin/components/AdminPresentationFields.vue'
import { createDefaultStorefrontContent } from '../../../src/domains/storefront/content/sectionCatalog.js'

async function render(component, props) {
  const router = createRouter({ history: createMemoryHistory(), routes: [{ path: '/:pathMatch(.*)*', component: { render: () => null } }] })
  await router.push('/')
  return renderToString(createSSRApp(component, props).use(router))
}
const campaign = { id: 'example', name: '[TEST] Sample giving', description: 'Managed introduction.', donationTarget: 'Example partner', story: 'Managed partner story.', donationType: 'FIXED', donationValue: 7, productIds: [], isActive: true }

describe('approved Storybook and Impact First pages', () => {
  it('renders the managed origin once and retains every brand chapter in the new composition', async () => {
    const content = createDefaultStorefrontContent()
    Object.assign(content.presentation.brand, { story: 'Unique origin paragraph.\n\nSecond origin paragraph.', storyTitle: 'Managed origin', galleryTitle: 'Managed moments', closingTitle: 'Managed invitation' })
    const html = await render(BrandPageContent, { content })
    for (const value of ['storybook-brand', 'storybook-origin', 'storybook-portraits', 'storybook-path', 'storybook-moments', 'storybook-values', 'Managed origin', 'Managed moments', 'Managed invitation', 'href="/#shop"']) expect(html).toContain(value)
    expect(html.split('Unique origin paragraph.')).toHaveLength(2)
    expect(html).toContain('Second origin paragraph.')
    expect(html).toContain('id="brand-pair"')
    expect(html).not.toContain('It started with a simple question.')
  })

  it('uses saved portrait copy/photos safely with local selection controls', async () => {
    const content = createDefaultStorefrontContent()
    content.presentation.brand.portraits[0] = { name: 'Chase <story>', tagline: 'Our actual caption.', text: 'Our actual story.', image: 'https://example.test/chase.webp', alt: 'Our approved portrait' }
    const html = await render(BrandPageContent, { content })
    for (const value of ['Choose a portrait', 'Chase &lt;story&gt;', 'Our actual caption.', 'Our actual story.', 'https://example.test/chase.webp', 'Our approved portrait', 'aria-pressed="true"', 'aria-pressed="false"', 'aria-live="polite"']) expect(html).toContain(value)
    expect(html).not.toContain('Suggested personality copy, not a verified biography.')
  })

  it('keeps template and photo-failure states honest', async () => {
    expect(await render(BrandPageContent, { content: createDefaultStorefrontContent() })).toContain('Suggested personality copy, not a verified biography.')
    const html = await render(StorefrontPhoto, { image: '', alt: 'A missing photo', caption: 'Managed caption' })
    for (const value of ['Photo unavailable', 'A missing photo', 'Managed caption']) expect(html).toContain(value)
    expect(html).not.toContain('<img')
  })
  it('keeps preview navigation inert without disabling the local portrait selector', async () => {
    const html = await render(BrandPageContent, { content: createDefaultStorefrontContent(), preview: true })
    expect(html).toMatch(/<a[^>]*href="#brand-pair"[^>]*inert/)
    expect(html).toMatch(/<a[^>]*href="\/#shop"[^>]*inert/)
    expect(html).toMatch(/<button[^>]*aria-pressed="false"[^>]*>Evie<\/button>/)
  })

  it('places the actual contribution before the partner and keeps all fictional sections', async () => {
    const html = await render(CampaignPageContent, { campaign })
    expect(html.indexOf('campaign-impact-band')).toBeLessThan(html.indexOf('campaign-partner-layout'))
    for (const value of ['$7.00 per eligible order', 'Managed introduction.', 'Managed partner story.', 'Example partner', 'Everyday comfort', 'Foster support', 'Thoughtful introductions', 'no extra donation', 'Fictional example rule']) expect(html).toContain(value)
    expect(html).not.toContain('$2.00')
  })

  it('keeps percentage rules and inactive states distinct without fictional programmes on real campaigns', async () => {
    const html = await render(CampaignPageContent, { campaign: { ...campaign, name: 'Managed real campaign', donationType: 'PERCENT', donationValue: 12.5, isActive: false, status: 'PAUSED', donationGenerated: 19 } })
    for (const value of ['12.5% of eligible product sales', 'Giving is currently paused.', 'Purchases do not currently contribute.', '$19.00 generated', 'not confirmation of funds paid out']) expect(html).toContain(value)
    expect(html).not.toContain('Shop eligible treats')
    expect(html).not.toContain('Fictional programme example')
    expect(html).not.toContain('Meadow Haven')
  })

  it('keeps eligible catalog ordering, selected-size pricing and permanent test guards', async () => {
    const products = ['first', 'second', 'hidden'].map((id, index) => ({ id, name: 'Product ' + id, status: index === 2 ? 'draft' : 'active', isTestProduct: true, tags: [], variants: [{ size: '18 oz', price: 39.99, quantity: 0 }, { size: '6 oz', price: 14.99, quantity: 0 }] }))
    const html = await render(CampaignPageContent, { campaign: { ...campaign, productIds: ['second', 'first', 'hidden'] }, products, quickView: true })
    expect(html.indexOf('Product second')).toBeLessThan(html.indexOf('Product first'))
    expect(html).not.toContain('Product hidden')
    expect(html).toContain('$14.99')
    expect(html).toContain('Test product · not for sale')
    expect(html).toContain('Shop this treat')
  })

  it('keeps campaign edit handles and inert product previews', async () => {
    const html = await render(CampaignPageContent, { campaign, editable: true, activeSection: 'giving' })
    for (const value of ['Edit Giving &amp; schedule', 'campaign-section-selected', 'Edit Partner &amp; story', 'Edit Eligible treats']) expect(html).toContain(value)
    const content = createDefaultStorefrontContent()
    const fields = await render(AdminPresentationFields, { draft: content, area: 'brand' })
    for (const value of ['Portrait name and selection button', 'Personality introduction', 'Portrait story', 'Portrait photograph description']) expect(fields).toContain(value)
  })
})
