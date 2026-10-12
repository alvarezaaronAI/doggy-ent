import { beforeEach, describe, expect, it, vi } from 'vitest'
const db = vi.hoisted(() => ({ product: { findMany: vi.fn(), findUnique: vi.fn() }, $transaction: vi.fn() }))
const tx = vi.hoisted(() => ({ productVariant: { deleteMany: vi.fn() }, product: { update: vi.fn() } }))
vi.mock('../../../src/db/prisma.js', () => ({ prisma: db }))
vi.mock('../../../src/domains/media/services/mediaReferences.service.js', () => ({ assertMediaImagesExist: vi.fn() }))
const { fetchAllProducts, fetchProductBySlug, updateProductById } = await import('../../../src/domains/products/services/products.service.js')
const { validateProductPayload } = await import('../../../src/domains/products/validators/products.validator.js')
const input = { name: 'Treat', shortDescription: 'Description', category: 'Jerky', status: 'ACTIVE', image: '/photo.jpg', variants: [{ size: '6 oz', price: 14.99, quantity: 4 }, { size: '18 oz', price: 39.99, quantity: 2 }] }
beforeEach(() => {
  vi.resetAllMocks(); db.product.findMany.mockResolvedValue([])
  db.product.findUnique.mockResolvedValue({ id: 'product', variants: [{ size: '6 oz', isActive: false }, { size: '18 oz', isActive: true }] })
  db.$transaction.mockImplementation(callback => callback(tx))
})
describe('catalog visibility and safe product replacement', () => {
  it('filters unpublished catalog data only for public callers', async () => {
    await fetchAllProducts(); expect(db.product.findMany.mock.calls[0][0].where).toEqual({ status: { in: ['ACTIVE', 'OUT_OF_STOCK', 'COMING_SOON'] } })
    await fetchAllProducts({ includeUnpublished: true }); expect(db.product.findMany.mock.calls[1][0].where).toEqual({})
    for (const status of ['DRAFT', 'ARCHIVED']) { db.product.findUnique.mockResolvedValue({ status }); expect(await fetchProductBySlug('hidden')).toBeNull() }
  })
  it('puts variant deletion and replacement inside one transaction and preserves inactive sizes', async () => {
    tx.product.update.mockResolvedValue({ variants: [] }); await updateProductById('product', input)
    expect(db.$transaction).toHaveBeenCalledOnce(); expect(tx.productVariant.deleteMany).toHaveBeenCalledWith({ where: { productId: 'product' } })
    expect(tx.product.update.mock.calls[0][0].data.variants.create[0]).toMatchObject({ size: '6 oz', price: 1499, isActive: false })
    tx.product.update.mockRejectedValue({ code: 'P2002' }); await expect(updateProductById('product', input)).rejects.toMatchObject({ code: 'P2002' })
  })
  it('validates actual sizes and rejects negative, nonfinite, duplicate or fractional inventory', () => {
    expect(validateProductPayload(input)).toBeNull()
    for (const variant of [{ price: -1 }, { price: Infinity }, { quantity: 1.5 }, { quantity: 2_147_483_648 }, { size: '18 oz' }, { isActive: 'yes' }]) expect(validateProductPayload({ ...input, variants: [{ ...input.variants[0], ...variant }, input.variants[1]] })).toMatchObject({ statusCode: 400 })
    expect(validateProductPayload(null)).toMatchObject({ statusCode: 400 })
  })
})
