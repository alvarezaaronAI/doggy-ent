import { describe, expect, it } from 'vitest'
import { createSSRApp } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { createMemoryHistory, createRouter } from 'vue-router'
import { createDefaultStorefrontContent, createSection, visibleStorefrontLinks } from '../../../src/domains/storefront/content/sectionCatalog.js'
import HomePageContent from '../../../src/domains/storefront/Home/HomePageContent.vue'
import { useProductVariants } from '../../../src/domains/products/composables/useProductVariants.js'
import AdminProductCanvas from '../../../src/domains/admin/components/AdminProductCanvas.vue'
import { createEmptyAdminProductForm } from '../../../src/domains/admin/mappers/adminProductForm.mapper.js'
import { getHomeFeaturedProduct } from '../../../src/domains/storefront/utils/homeContent.js'
import SiteHeader from '../../../src/app/layouts/SiteHeader.vue'
import ProductCollectionSection from '../../../src/domains/storefront/Home/sections/ProductCollectionSection.vue'
import AdminWebsiteFields from '../../../src/domains/admin/components/AdminWebsiteFields.vue'
const products = [{ id: 'p1', name: 'Real catalog treat', status: 'active', shortDescription: 'Catalog description', tags: [], variants: [{ size: '6 oz', price: 10, quantity: 10 }], ingredients: 'Catalog ingredients' }]
const context = { ...useProductVariants(), products, activeProducts: products, comingSoonProducts: [], getDisplayTags: p => p.tags || [], campaignsForProduct: () => [], availableCategories: ['Jerky'], availableProteins: ['Chicken'], selectedCategory: 'All', selectedProtein: 'All', selectedSort: 'featured', loadProducts: () => {}, loadCampaigns: () => {} }
async function render(component, props) {
  const router = createRouter({ history: createMemoryHistory(), routes: [{ path: '/:pathMatch(.*)*', component: { render: () => null } }] })
  await router.push('/')
  return renderToString(createSSRApp(component, props).use(router))
}
describe('shared storefront and product editor rendering', () => {
  it('renders upload controls beside images, contextual fields, and explicit changed markers', async () => {
    const content = createDefaultStorefrontContent()
    const fields = await render(AdminWebsiteFields, { draft: content, selected: 'hero', block: content.sections[0], products })
    expect(fields).toContain('Hero introduction')
    expect(fields).toContain('Upload image')
    expect(fields).toContain('Choose library')
    expect(fields).not.toContain('>Text<')
    const artwork = '/api/media/11111111-1111-4111-8111-111111111111'
    content.theme.backgroundImage = artwork
    content.sections.find(block => block.id === 'shop').settings.background = 'giving'
    const html = await render(HomePageContent, { content, context, editable: true, changedSections: ['shop'] })
    expect(html).toContain(artwork)
    expect(html).toContain('background-repeat:repeat-y')
    expect(html).toContain('background-color:#edf6f0')
    expect(html).toContain(' · Edited')
  })
  it('uses real internal navigation, safe external links, and hides search without a visible collection', async () => {
    const content = createDefaultStorefrontContent()
    content.header.links.push({ label: 'Partner story', href: 'HTTPS://example.test/story' })
    const html = await render(SiteHeader, { content, preview: true })
    expect(html).toContain('href="/#shop"')
    expect(html).toContain('href="HTTPS://example.test/story" target="_blank"')
    content.sections.find(block => block.id === 'shop').visible = false
    const withoutCollection = await render(SiteHeader, { content, preview: true })
    expect(withoutCollection).not.toContain('aria-label="Search treats"')
    expect(withoutCollection).not.toContain('href="/#shop"')
  })

  it('retains search/filter results in curated collections instead of showing excluded products', async () => {
    const section = createSection('collection', 'shop')
    section.settings.productIds = ['p1']
    const html = await render(ProductCollectionSection, { id: 'shop', settings: section.settings, context: { ...context, activeProducts: [] } })
    expect(html).toContain('No matching treats')
    expect(html).not.toContain('Real catalog treat')
  })
  it('retains all original content areas and real product fields', async () => {
    const html = await render(HomePageContent, { content: createDefaultStorefrontContent(), context })
    for (const id of ['hero', 'spotlight', 'shop', 'coming-soon', 'reviews', 'process', 'ingredients', 'about']) expect(html).toContain(`id="${id}"`)
    expect(html).not.toContain('id="faq"')
    expect(html).toContain('Catalog ingredients')
    expect(html).toContain('Catalog description')
    expect(html).not.toContain('home-edit-handle')
    expect(html).not.toContain('id="promise"')
  })
  it('renders edited content, hides sections and filters orphaned navigation', async () => {
    const content = createDefaultStorefrontContent()
    content.sections.find(block => block.id === 'reviews').visible = false
    const banner = createSection('banner', 'holiday-banner'); banner.settings.title = 'Holiday <special>'
    content.sections.unshift(banner)
    const html = await render(HomePageContent, { content, context })
    expect(html).toContain('Holiday &lt;special&gt;')
    expect(html).not.toContain('id="reviews"')
    expect(html.indexOf('id="holiday-banner"')).toBeLessThan(html.indexOf('id="hero"'))
    expect(visibleStorefrontLinks(content.header.links, content.sections).some(link => link.href === '/#reviews')).toBe(false)
    content.sections.find(block => block.id === 'ingredients').visible = false
    const withoutIngredients = await render(HomePageContent, { content, context })
    expect(withoutIngredients).not.toContain('href="/#ingredients"')
  })
  it('shows hidden-section edit handles and inerts shopping content in the editor', async () => {
    const content = createDefaultStorefrontContent(); content.sections[0].visible = false
    const html = await render(HomePageContent, { content, context, editable: true })
    expect(html).toContain('Hero · Hidden')
    expect(html).toContain('inert')
    expect(html).toContain('home-edit-handle')
  })
  it('uses selected catalog feature without allowing inactive product selection', () => {
    const content = createDefaultStorefrontContent(); content.sections.find(s => s.type === 'spotlight').settings.productId = 'p2'
    expect(getHomeFeaturedProduct(content, [...products, { id: 'p2', status: 'active' }]).id).toBe('p2')
    expect(getHomeFeaturedProduct(content, [...products, { id: 'p2', status: 'draft' }]).id).toBe('p1')
  })
  it('uses the actual ProductCard for drafts and ComingSoonCard for upcoming products', async () => {
    const form = { ...createEmptyAdminProductForm(), name: 'Editor treat', sixOzPrice: '10', eighteenOzPrice: '24', sixOzQuantity: '5', eighteenOzQuantity: '8' }
    const active = await render(AdminProductCanvas, { form: { ...form, status: 'active' } })
    expect(active).toContain('Editor treat')
    expect(active).toContain('Edit prices &amp; stock')
    expect(active).toContain('$10.00')
    expect(active).toContain('inert')
    const upcoming = await render(AdminProductCanvas, { form: { ...form, status: 'coming-soon' } })
    expect(upcoming).toContain('This product is not available yet')
    expect(upcoming).not.toContain('Add to Cart')
  })
})
