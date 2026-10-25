import { beforeEach, describe, expect, it, vi } from 'vitest'

const repository = vi.hoisted(() => ({
  findCustomerWishlist: vi.fn(), saveCustomerWishlistItemWithinLimit: vi.fn(), deleteCustomerWishlistItem: vi.fn(),
}))
vi.mock('../../../src/domains/wishlist/repositories/wishlist.repository.js', () => repository)
const { getCustomerWishlist, saveCustomerWishlistItem, removeCustomerWishlistItem } = await import('../../../src/domains/wishlist/services/wishlist.service.js')
const { validateEmptyWishlistInput } = await import('../../../src/domains/wishlist/validators/wishlist.validator.js')
const productId = 'c' + 'a'.repeat(24)
const createdAt = new Date('2026-10-24T00:00:00Z')
const item = { productId, createdAt, userId: 'owner', product: { name: 'private product facts' } }

beforeEach(() => {
  vi.resetAllMocks()
  repository.findCustomerWishlist.mockResolvedValue([item])
  repository.saveCustomerWishlistItemWithinLimit.mockResolvedValue({ state: 'saved', item })
})

describe('owned wishlist service', () => {
  it('projects only product ID and original save date from list/save results', async () => {
    expect(await getCustomerWishlist('owner')).toEqual([{ productId, createdAt }])
    expect(await saveCustomerWishlistItem('owner', productId)).toEqual({ productId, createdAt })
    expect(repository.findCustomerWishlist).toHaveBeenCalledWith('owner')
    expect(repository.saveCustomerWishlistItemWithinLimit).toHaveBeenCalledWith('owner', productId)
    repository.findCustomerWishlist.mockResolvedValue([])
    expect(await getCustomerWishlist('owner')).toEqual([])
  })

  it('returns the same removal result for present or absent owned rows', async () => {
    repository.deleteCustomerWishlistItem.mockResolvedValueOnce({ count: 1 }).mockResolvedValueOnce({ count: 0 })
    expect(await removeCustomerWishlistItem('owner', productId)).toEqual({ removed: true })
    expect(await removeCustomerWishlistItem('owner', productId)).toEqual({ removed: true })
    expect(repository.deleteCustomerWishlistItem).toHaveBeenCalledWith('owner', productId)
  })

  it.each([undefined, null, '', ' ', {}, 123])('requires the session owner before any persistence: %j', async owner => {
    for (const action of [() => getCustomerWishlist(owner), () => saveCustomerWishlistItem(owner, productId), () => removeCustomerWishlistItem(owner, productId)]) {
      await expect(action()).rejects.toMatchObject({ statusCode: 401 })
    }
    for (const method of Object.values(repository)) expect(method).not.toHaveBeenCalled()
  })

  it.each([undefined, null, {}, [], '', 'not-an-id', 'c' + 'a'.repeat(25), 'C' + 'a'.repeat(24), productId + ' ', '../' + productId])('rejects malformed product IDs without persistence: %j', async id => {
    await expect(saveCustomerWishlistItem('owner', id)).rejects.toMatchObject({ statusCode: 400 })
    await expect(removeCustomerWishlistItem('owner', id)).rejects.toMatchObject({ statusCode: 400 })
    expect(repository.saveCustomerWishlistItemWithinLimit).not.toHaveBeenCalled()
    expect(repository.deleteCustomerWishlistItem).not.toHaveBeenCalled()
  })

  it('maps unavailable products and the exact cap to safe distinct errors', async () => {
    repository.saveCustomerWishlistItemWithinLimit.mockResolvedValueOnce({ state: 'unavailable' }).mockResolvedValueOnce({ state: 'limit' })
    await expect(saveCustomerWishlistItem('owner', productId)).rejects.toMatchObject({ statusCode: 404, message: 'Product not available.' })
    await expect(saveCustomerWishlistItem('owner', productId)).rejects.toMatchObject({ statusCode: 409, message: 'You can save up to 100 wishlist items.' })
  })

  it('accepts no query/body data beyond an empty object', () => {
    for (const value of [undefined, {}, Object.create(null)]) expect(() => validateEmptyWishlistInput(value)).not.toThrow()
    for (const value of [null, [], '', 0, true, new Date(), { userId: 'other' }, { productId }, { createdAt }, { limit: 1 }]) {
      expect(() => validateEmptyWishlistInput(value)).toThrow(expect.objectContaining({ statusCode: 400 }))
    }
  })
})
