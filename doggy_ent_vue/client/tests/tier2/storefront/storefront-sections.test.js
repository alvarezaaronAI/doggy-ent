import { describe, expect, it } from 'vitest'
import { createSSRApp, h } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { createMemoryHistory, createRouter } from 'vue-router'
import StorefrontHero from '../../../src/domains/storefront/components/StorefrontHero.vue'
import HeroSection from '../../../src/domains/storefront/Home/sections/HeroSection.vue'
import NextDropsSection from '../../../src/domains/storefront/Home/sections/NextDropsSection.vue'
import { BRAND_STORY_PATH } from '../../../src/domains/storefront/constants/brandContent.js'

const renderDrops = (props = {}) =>
  renderToString(
    createSSRApp(NextDropsSection, { getDisplayTags: () => [], ...props }),
  )

describe('storefront section presentation', () => {
  it('uses the actual featured product for hero copy, tags and shopping destination', async () => {
    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/', component: { render: () => null } },
        { path: BRAND_STORY_PATH, component: { render: () => null } },
      ],
    })
    await router.push('/')
    const html = await renderToString(
      createSSRApp(HeroSection, {
        product: {
          name: 'Salmon Jerky',
          shortDescription: 'The stored product introduction.',
          tags: ['Limited batch'],
        },
      }).use(router),
    )
    expect(html).toContain('Small-Batch Dog Treats')
    expect(html).toContain('Shop Salmon Jerky')
    expect(html).toContain('href="#spotlight"')
    expect(html).toContain('The stored product introduction.')
    expect(html).toContain('Limited batch')
    expect(html).not.toContain('Shop Chicken')
    expect(html).not.toContain('Human-grade')
    expect(html).not.toContain('Fast Shipping')
    expect(html).not.toContain('30-Day Promise')
  })
  it('renders an accessible hero with escaped content and real action slots', async () => {
    const html = await renderToString(
      createSSRApp({
        render: () =>
          h(
            StorefrontHero,
            {
              title: 'Chase & Evie <story>',
              description: 'Good treats. Good company.',
              image: 'https://images.example.test/template.jpg',
              imageAlt: 'Illustrative dog photography',
            },
            { default: () => h('a', { href: '#shop' }, 'Shop all treats') },
          ),
      }),
    )
    expect(html).toContain('<h1')
    expect(html).toContain('Chase &amp; Evie &lt;story&gt;')
    expect(html).toContain('alt="Illustrative dog photography"')
    expect(html).toContain('fetchpriority="high"')
    expect(html).toContain('href="#shop"')
  })

  it('does not present an empty upcoming catalog while loading', async () => {
    const html = await renderDrops({ loading: true })
    expect(html).toContain('role="status"')
    expect(html).toContain('Loading upcoming treats...')
    expect(html).not.toContain('More good things are on the way.')
  })

  it('distinguishes a failed catalog request from an empty catalog', async () => {
    const html = await renderDrops({ error: 'Treats could not be loaded.' })
    expect(html).toContain('role="alert"')
    expect(html).toContain('Treats could not be loaded.')
    expect(html).toContain('Try again')
    expect(html).not.toContain('More good things are on the way.')
  })

  it('offers ordinary shopping when no upcoming products exist', async () => {
    const html = await renderDrops()
    expect(html).toContain('More good things are on the way.')
    expect(html).toContain('href="#shop"')
    expect(html).not.toContain('View upcoming treat')
  })

  it('renders actual upcoming products without offering purchase or live notifications', async () => {
    const html = await renderDrops({
      products: [
        {
          id: 'upcoming',
          name: 'Training Bites',
          shortDescription: 'A future treat.',
          image: '',
          category: 'Training',
          protein: 'Chicken',
          cut: 'Breast',
        },
      ],
    })
    expect(html).toContain('Training Bites')
    expect(html).toContain('View upcoming treat')
    expect(html).toContain('This product is not available yet')
    expect(html).toContain('Breast')
    expect(html).not.toContain('More good things are on the way.')
    expect(html).not.toContain('Add to Cart')
    expect(html).toContain('disabled')
    expect(html).toContain('Launch notifications: coming in a future phase.')
  })
})
