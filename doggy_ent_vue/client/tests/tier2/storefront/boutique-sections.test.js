import { describe, expect, it } from 'vitest'
import { createSSRApp } from 'vue'
import { renderToString } from 'vue/server-renderer'
import ProcessSection from '../../../src/domains/storefront/Home/sections/ProcessSection.vue'
import IngredientsAnalysisSection from '../../../src/domains/storefront/Home/sections/IngredientsAnalysisSection.vue'
import AboutBrandSection from '../../../src/domains/storefront/Home/sections/AboutBrandSection.vue'
import ReviewsPreviewSection from '../../../src/domains/storefront/Home/sections/ReviewsPreviewSection.vue'
import HomePageContent from '../../../src/domains/storefront/Home/HomePageContent.vue'
import { sectionSettings, createDefaultStorefrontContent } from '../../../src/domains/storefront/content/sectionCatalog.js'
import { SAMPLE_REVIEWS } from '../../../src/domains/storefront/constants/sampleReviews.js'

const render = (component, props) => renderToString(createSSRApp(component, props))

describe('selected Modern Boutique home sections', () => {
  it('keeps managed preparation copy, ordered steps and supplied image in the photo-led layout', async () => {
    const settings = sectionSettings('process', {
      title: 'Our <care> story', text: 'Managed introduction.', eyebrow: 'Made for their moments',
      image: 'https://example.test/preparation.jpg', imageAlt: 'Approved preparation image',
      items: [{ title: 'First step', text: 'Actual process information.' }, { title: 'Second step', text: 'More managed copy.' }],
    })
    const html = await render(ProcessSection, { settings })
    for (const value of ['home-care-layout', 'Our &lt;care&gt; story', 'Managed introduction.', 'First step', 'Actual process information.', 'Second step', 'Approved preparation image', 'https://example.test/preparation.jpg']) expect(html).toContain(value)
    expect(html).toContain('<ol')
    expect(html).toContain('href="/meet-chase-evie"')
    expect(html).not.toContain('not the actual kitchen')
    const fallback = await render(ProcessSection)
    expect(fallback).toContain('Illustrative preparation photo, not the actual kitchen.')
  })

  it('keeps real product ingredient and storage data and the detail action in the promise layout', async () => {
    const settings = sectionSettings('ingredients', { title: 'Managed promise', text: 'No blanket claims.' })
    const html = await render(IngredientsAnalysisSection, {
      settings, product: { ingredients: 'Stored recipe <details>', storageFeeding: 'Stored feeding instructions.', isTestProduct: true },
    })
    for (const value of ['home-ingredients-layout', 'home-ingredient-points', 'Managed promise', 'No blanket claims.', 'Stored recipe &lt;details&gt;', 'Stored feeding instructions.', 'Explore product details', 'Sample presentation;', 'href="/account/help"']) expect(html).toContain(value)
    expect(html).not.toContain('story-card')
    expect(html).not.toContain('Human-grade')
    const empty = await render(IngredientsAnalysisSection, { settings })
    expect(empty).not.toContain('Explore product details')
    expect(empty).toContain('href="/#shop"')
  })

  it('keeps managed brand copy, paragraphs, image/caption and actual story destination', async () => {
    const html = await render(AboutBrandSection, { settings: sectionSettings('brand', {
      title: 'Our own title', text: 'First paragraph.\n\nSecond paragraph.',
      image: 'https://example.test/our-pair.jpg', imageAlt: 'Our approved pair photograph', caption: 'Our own caption.',
      buttonLabel: 'Meet the pair', buttonUrl: '/meet-chase-evie',
    }) })
    for (const value of ['home-brand-layout', 'Our own title', 'First paragraph.', 'Second paragraph.', 'Our own caption.', 'Our approved pair photograph', 'https://example.test/our-pair.jpg', 'href="/meet-chase-evie"']) expect(html).toContain(value)
    expect(html).not.toContain('story-card')
  })

  it('preserves every review detail and fictional label rather than copying the mock testimonials', async () => {
    const html = await render(ReviewsPreviewSection, { settings: sectionSettings('gallery', { sampleReviews: true }) })
    expect(html).toContain('aria-roledescription="carousel"')
    expect(html).toContain('home-reviews-track')
    for (const review of SAMPLE_REVIEWS) {
      for (const value of [review.title, review.text, review.name, review.date, review.product, review.size]) expect(html).toContain(value)
    }
    expect(html.match(/class="home-review"/g)).toHaveLength(7)
    expect(html).toContain('fictional examples, not customer submissions')
    expect(html).toContain('Customer reviews · coming in future phase')
    expect(html).not.toContain('Verified purchase')
    expect(html).not.toContain('Alex M.')
  })

  it('preserves the photo gallery when sample reviews are disabled', async () => {
    const html = await render(ReviewsPreviewSection, { settings: sectionSettings('gallery', {
      sampleReviews: false, items: [{ image: 'https://example.test/pup.jpg', alt: 'A supplied pup image', text: 'A managed caption.' }],
    }) })
    expect(html).toContain('A supplied pup image')
    expect(html).toContain('A managed caption.')
    expect(html).not.toContain('home-review-carousel')
  })

  it('uses the same components in the editor but disables automatic review rotation', async () => {
    let autoplay
    const content = createDefaultStorefrontContent()
    content.sections = content.sections.filter(section => section.type === 'gallery')
    const app = createSSRApp(HomePageContent, { content, context: {}, editable: true })
    // Capture the actual child props without mounting browser timers or initializing providers.
    const original = ReviewsPreviewSection.setup
    ReviewsPreviewSection.setup = (props, context) => { autoplay = props.autoplay; return original(props, context) }
    try { await renderToString(app) } finally { ReviewsPreviewSection.setup = original }
    expect(autoplay).toBe(false)
  })
})
