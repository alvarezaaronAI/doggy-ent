import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createDefaultStorefrontContent } from '../../../src/domains/storefront/content/sectionCatalog.js'

const api = vi.hoisted(() => ({ fetchStorefrontContent: vi.fn() }))
vi.mock('../../../src/domains/storefront/api/storefrontContent.api.js', () => api)
beforeEach(() => { vi.resetModules(); vi.clearAllMocks() })

describe('published storefront content cache', () => {
  it('keeps shopping usable with defaults on an unavailable content API', async () => {
    api.fetchStorefrontContent.mockRejectedValue(new Error('Unavailable'))
    const { useStorefrontContent } = await import('../../../src/domains/storefront/composables/useStorefrontContent.js')
    const state = useStorefrontContent()
    await state.loadContent({ force: true })
    expect(state.content.value.sections).toHaveLength(10)
    expect(state.contentError.value).toBe('Unavailable')
  })

  it('retains a valid published presentation after an invalid later response', async () => {
    const published = createDefaultStorefrontContent()
    published.sections[0].settings.title = 'Published heading'
    api.fetchStorefrontContent.mockResolvedValueOnce({ content: published }).mockResolvedValueOnce({ content: { version: 99 } })
    const { useStorefrontContent } = await import('../../../src/domains/storefront/composables/useStorefrontContent.js')
    const state = useStorefrontContent()
    await state.loadContent({ force: true })
    await state.loadContent({ force: true })
    expect(state.content.value.sections[0].settings.title).toBe('Published heading')
    expect(state.contentError.value).toBeTruthy()
  })

  it('does not let an older public read overwrite a successful admin publication', async () => {
    let resolveRead
    api.fetchStorefrontContent.mockImplementation(() => new Promise(resolve => { resolveRead = resolve }))
    const { useStorefrontContent } = await import('../../../src/domains/storefront/composables/useStorefrontContent.js')
    const state = useStorefrontContent()
    const request = state.loadContent({ force: true })
    const published = createDefaultStorefrontContent()
    published.sections[0].settings.title = 'New publication'
    state.usePublishedContent(published)
    resolveRead({ content: createDefaultStorefrontContent() })
    await request
    expect(state.content.value.sections[0].settings.title).toBe('New publication')
  })
})
