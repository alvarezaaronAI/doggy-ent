import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import express from 'express'
const auth = vi.hoisted(() => ({ getAdminFromSession: vi.fn(), getSessionCookieName: () => 'admin-session' }))
const media = vi.hoisted(() => ({ getMediaLibrary: vi.fn(), uploadImage: vi.fn(), editMediaDetails: vi.fn(), getPublicImage: vi.fn() }))
vi.mock('../../../src/domains/auth/services/auth.service.js', () => auth)
vi.mock('../../../src/domains/media/services/media.service.js', () => media)
const { default: routes } = await import('../../../src/domains/media/routes/media.routes.js')
let server, origin
beforeEach(async () => {
  vi.resetAllMocks(); auth.getAdminFromSession.mockResolvedValue(null)
  const app = express(); app.use(express.json({ limit: '100kb' })); app.use((req, _res, next) => { req.cookies = {}; next() }); app.use('/api', routes)
  app.use((error, _req, res, _next) => res.status(error.statusCode || 500).json({ message: error.message }))
  server = app.listen(0, '127.0.0.1'); await new Promise(resolve => server.once('listening', resolve)); origin = `http://127.0.0.1:${server.address().port}`
})
afterEach(async () => { if (server) await new Promise(resolve => server.close(resolve)) })
describe('admin image storage authorization and serving', () => {
  it('protects library, uploads and metadata edits, before processing bytes', async () => {
    for (const [method, path] of [['GET', '/admin/media'], ['POST', '/admin/media'], ['PATCH', '/admin/media/asset']]) expect((await fetch(origin + '/api' + path, { method })).status).toBe(401)
    expect(media.uploadImage).not.toHaveBeenCalled()
  })
  it('accepts raw raster bytes over the normal JSON limit with authenticated uploads', async () => {
    auth.getAdminFromSession.mockResolvedValue({ email: 'admin@example.test' }); media.uploadImage.mockResolvedValue({ asset: { url: '/api/media/id' }, reused: false })
    const response = await fetch(origin + '/api/admin/media', { method: 'POST', headers: { 'Content-Type': 'image/png', 'X-File-Name': 'photo.png', 'X-Media-Folder': 'website' }, body: Buffer.alloc(120 * 1024) })
    expect(response.status).toBe(201); expect(response.headers.get('cache-control')).toBe('no-store')
    expect(media.uploadImage.mock.calls[0][0]).toHaveLength(120 * 1024)
    expect(media.uploadImage.mock.calls[0][1]).toEqual({ type: 'image/png', filename: 'photo.png', folder: 'website' })
  })
  it('rejects oversized raw uploads without processing them', async () => {
    auth.getAdminFromSession.mockResolvedValue({ email: 'admin@example.test' })
    const response = await fetch(origin + '/api/admin/media', { method: 'POST', headers: { 'Content-Type': 'image/png' }, body: Buffer.alloc(8 * 1024 * 1024 + 1) })
    expect(response.status).toBe(413); expect((await response.json()).message).toContain('8 MB')
    expect(media.uploadImage).not.toHaveBeenCalled()
  })
  it('serves public inert WebP with cache headers and thumbnail selection', async () => {
    media.getPublicImage.mockResolvedValue({ bytes: Buffer.from('webp-pixels'), mimeType: 'image/webp', etag: '"hash"' })
    const response = await fetch(origin + '/api/media/asset/thumbnail')
    expect(response.status).toBe(200); expect(response.headers.get('content-type')).toBe('image/webp')
    expect(response.headers.get('x-content-type-options')).toBe('nosniff'); expect(response.headers.get('cache-control')).toContain('immutable')
    expect(media.getPublicImage).toHaveBeenCalledWith('asset', true)
    const cached = await fetch(origin + '/api/media/asset', { headers: { 'If-None-Match': '"hash"', 'Cache-Control': 'max-age=0' } })
    expect(cached.status).toBe(304)
  })
})
