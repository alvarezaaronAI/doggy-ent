import { beforeEach, describe, expect, it, vi } from 'vitest'
import express from 'express'
import { validateProductImages } from '../../../src/domains/products/validators/productImages.validator.js'
const db = vi.hoisted(() => ({ product: { findUnique: vi.fn(), updateMany: vi.fn() } }))
const media = vi.hoisted(() => ({ assertMediaImagesExist: vi.fn() }))
const auth = vi.hoisted(() => ({ getAdminFromRequest: vi.fn() }))
vi.mock('../../../src/db/prisma.js', () => ({ prisma: db }))
vi.mock('../../../src/domains/media/services/mediaReferences.service.js', () => media)
vi.mock('../../../src/domains/auth/services/auth.service.js', () => auth)
const { saveProductImages } = await import('../../../src/domains/products/services/productImages.service.js')
const { default: routes } = await import('../../../src/domains/products/routes/products.routes.js')
const input = { image: 'https://example.test/main.webp', galleryImages: [{ image: 'https://example.test/detail.webp', alt: 'Detail angle' }], updatedAt: '2026-10-14T00:00:00Z' }
beforeEach(() => { vi.resetAllMocks(); db.product.findUnique.mockResolvedValue({ id: 'p', variants: [] }); db.product.updateMany.mockResolvedValue({ count: 1 }) })
describe('product-owned optional photographs', () => {
  it('accepts zero through four and rejects unsafe URLs, missing alt, business fields and invalid revisions', () => {
    for (let n = 0; n <= 4; n++) expect(validateProductImages({ ...input, galleryImages: Array(n).fill(input.galleryImages[0]) }).galleryImages).toHaveLength(n)
    for (const change of [{ price: 1 }, { galleryImages: Array(5).fill(input.galleryImages[0]) }, { galleryImages: [{ image: 'javascript:alert(1)', alt: 'bad' }] }, { galleryImages: [{ image: input.image, alt: ' ' }] }, { updatedAt: '' }, { image: 'https://user:pass@example.test' }]) expect(() => validateProductImages({ ...input, ...change })).toThrow()
  })
  it('updates only image fields under optimistic concurrency without replacing variants', async () => {
    await saveProductImages('p', input)
    expect(media.assertMediaImagesExist).toHaveBeenCalledWith([input.image, input.galleryImages[0].image])
    expect(db.product.updateMany).toHaveBeenCalledWith({ where: { id: 'p', updatedAt: new Date(input.updatedAt) }, data: { image: input.image, galleryImages: input.galleryImages } })
  })
  it('does not overwrite missing or concurrently modified records', async () => {
    db.product.findUnique.mockResolvedValueOnce(null)
    await expect(saveProductImages('missing', input)).rejects.toMatchObject({ statusCode: 404 })
    expect(db.product.updateMany).not.toHaveBeenCalled()
    db.product.updateMany.mockResolvedValueOnce({ count: 0 })
    await expect(saveProductImages('p', input)).rejects.toMatchObject({ statusCode: 409 })
  })
  it('requires admin authentication before processing an image edit', async () => {
    auth.getAdminFromRequest.mockResolvedValue(null)
    const app = express(); app.use(express.json()); app.use('/api/products', routes)
    const server = app.listen(0, '127.0.0.1'); await new Promise(resolve => server.once('listening', resolve))
    try { const response = await fetch(`http://127.0.0.1:${server.address().port}/api/products/p/images`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(input) }); expect(response.status).toBe(401); expect(db.product.updateMany).not.toHaveBeenCalled() }
    finally { await new Promise(resolve => server.close(resolve)) }
  })
})
