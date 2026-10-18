import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import express from 'express'
import { createDefaultStorefrontContent } from '../../../src/domains/storefront/content/sectionCatalog.js'
import { validateStorefrontContent, isSafeContentUrl } from '../../../src/domains/storefront/content/contentValidation.js'
import { projectStorefrontContent } from '../../../src/domains/storefront/content/contentProjection.js'
const repo = vi.hoisted(() => ({ findStorefrontContent: vi.fn(), writeStorefrontContent: vi.fn() }))
const media = vi.hoisted(() => ({ countMediaIds: vi.fn() }))
const auth = vi.hoisted(() => ({ getAdminFromRequest: vi.fn(), getSessionCookieName: () => 'admin-session' }))
vi.mock('../../../src/domains/storefront/repositories/storefront.repository.js', () => repo)
vi.mock('../../../src/domains/media/repositories/media.repository.js', () => media)
vi.mock('../../../src/domains/auth/services/auth.service.js', () => auth)
const { getAdminStorefrontContent, getPublicStorefrontContent, saveStorefrontContent } = await import('../../../src/domains/storefront/services/storefront.service.js')
const { default: routes } = await import('../../../src/domains/storefront/routes/storefront.routes.js')
let server
beforeEach(() => { vi.resetAllMocks(); auth.getAdminFromRequest.mockResolvedValue(null) })
afterEach(async () => { if (server) { await new Promise(resolve => server.close(resolve)); server = null } })
describe('website content validation and publishing', () => {
  it('starts from the existing complete storefront without creating a record', async () => {
    repo.findStorefrontContent.mockResolvedValue(null)
    const draft = await getAdminStorefrontContent()
    expect(draft.revision).toBe(0)
    expect(draft.draft.sections).toHaveLength(11)
    expect(validateStorefrontContent(draft.draft)).toBe('')
    expect(await getPublicStorefrontContent()).toEqual({ content: null })
    expect(repo.writeStorefrontContent).not.toHaveBeenCalled()
  })
  it('returns only published allowlisted fields, never draft/editor metadata', async () => {
    const published = createDefaultStorefrontContent()
    published.internalCanary = 'private-setting'
    repo.findStorefrontContent.mockResolvedValue({ draft: { title: 'unpublished-canary' }, published, revision: 4, updatedBy: 'private-actor' })
    const output = JSON.stringify(await getPublicStorefrontContent())
    for (const field of ['unpublished-canary', 'private-setting', 'private-actor', 'revision']) expect(output).not.toContain(field)
  })
  it('saves a draft without touching the published snapshot', async () => {
    const content = createDefaultStorefrontContent()
    repo.writeStorefrontContent.mockResolvedValue({ draft: content, revision: 2 })
    await saveStorefrontContent({ revision: 1, content })
    expect(repo.writeStorefrontContent).toHaveBeenCalledWith(1, { draft: projectStorefrontContent(content) })
  })
  it('publishes the validated snapshot atomically and retains the same draft', async () => {
    const content = createDefaultStorefrontContent()
    repo.writeStorefrontContent.mockResolvedValue({ draft: content, published: content, revision: 3 })
    await saveStorefrontContent({ revision: 2, content }, true)
    expect(repo.writeStorefrontContent).toHaveBeenCalledWith(2, { draft: projectStorefrontContent(content), published: projectStorefrontContent(content), publishedAt: expect.any(Date) })
  })
  it('rejects concurrent edits instead of overwriting newer content', async () => {
    repo.writeStorefrontContent.mockResolvedValue(null)
    await expect(saveStorefrontContent({ revision: 1, content: createDefaultStorefrontContent() })).rejects.toMatchObject({ statusCode: 409 })
  })
  it('checks portrait uploads in the selected media library before saving', async () => {
    const id = '11111111-1111-4111-8111-111111111111'
    const content = createDefaultStorefrontContent()
    content.presentation.brand.portraits[0].image = '/api/media/' + id
    media.countMediaIds.mockResolvedValue(0)
    await expect(saveStorefrontContent({ revision: 0, content })).rejects.toMatchObject({ statusCode: 400 })
    expect(repo.writeStorefrontContent).not.toHaveBeenCalled()
    expect(media.countMediaIds).toHaveBeenCalledWith([id])
    media.countMediaIds.mockResolvedValue(1)
    repo.writeStorefrontContent.mockResolvedValue({ draft: content, revision: 1 })
    await expect(saveStorefrontContent({ revision: 0, content })).resolves.toMatchObject({ revision: 1 })
  })
  it('rejects unsafe URLs, custom scripts/settings, duplicate anchors, incomplete images, and hidden-all pages before writing', async () => {
    for (const change of [
      doc => { doc.header.links[0].href = 'javascript:alert(1)' },
      doc => { doc.sections[0].settings.image = 'https://images.example.test/dog.jpg'; doc.sections[0].settings.imageAlt = '' },
      doc => { doc.sections[1].id = doc.sections[0].id },
      doc => { doc.sections[0].settings.html = '<script>canary</script>' },
      doc => { doc.sections.forEach(block => { block.visible = false }) },
      doc => { doc.theme.backgroundImage = 'data:image/svg+xml,canary' },
      doc => { doc.footer.social.instagram = 'https://example.test/profile' },
    ]) {
      const content = createDefaultStorefrontContent(); change(content)
      await expect(saveStorefrontContent({ revision: 0, content })).rejects.toMatchObject({ statusCode: 400 })
    }
    expect(repo.writeStorefrontContent).not.toHaveBeenCalled()
    for (const url of ['//evil.test', '/admin', '/api/auth/me', '/foo/../api/auth/me', '/%61dmin', '/%2fadmin', '/%2561dmin', 'https://user:pass@example.test']) expect(isSafeContentUrl(url)).toBe(false)
    for (const url of ['/#shop', '/meet-chase-evie', '/campaigns/example', 'https://example.test/story']) expect(isSafeContentUrl(url)).toBe(true)
  })
  it('protects every editor endpoint while allowing public published reads', async () => {
    repo.findStorefrontContent.mockResolvedValue(null)
    const app = express(); app.use(express.json()); app.use((req, _res, next) => { req.cookies = {}; next() }); app.use('/api', routes)
    app.use((error, _req, res, _next) => res.status(error.statusCode || 500).json({ message: error.message }))
    server = app.listen(0, '127.0.0.1'); await new Promise(resolve => server.once('listening', resolve))
    const origin = `http://127.0.0.1:${server.address().port}`
    const publicRead = await fetch(origin + '/api/storefront/content')
    expect(publicRead.status).toBe(200)
    expect(publicRead.headers.get('cache-control')).toBe('no-store')
    for (const [method, path] of [['GET', '/admin/storefront'], ['PUT', '/admin/storefront/draft'], ['PUT', '/admin/storefront/publish']]) expect((await fetch(origin + '/api' + path, { method })).status).toBe(401)
    auth.getAdminFromRequest.mockResolvedValue({ email: 'admin@example.test' })
    repo.writeStorefrontContent.mockResolvedValue({ draft: createDefaultStorefrontContent(), revision: 1 })
    const saved = await fetch(origin + '/api/admin/storefront/draft', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ revision: 0, content: createDefaultStorefrontContent() }) })
    expect(saved.status).toBe(200)
  })
})
