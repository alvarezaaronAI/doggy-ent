import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const root = vi.hoisted(() => ({
  wishlistItem: { findMany: vi.fn(), findUnique: vi.fn(), count: vi.fn(), create: vi.fn(), update: vi.fn(), deleteMany: vi.fn() },
  product: { findFirst: vi.fn() },
}))
const tx = vi.hoisted(() => ({
  wishlistItem: { findUnique: vi.fn(), count: vi.fn(), create: vi.fn(), update: vi.fn() },
  product: { findFirst: vi.fn() },
}))
const transaction = vi.hoisted(() => vi.fn())
vi.mock('../../../src/db/prisma.js', () => ({ prisma: { ...root, $transaction: transaction } }))
const { findCustomerWishlist, saveCustomerWishlistItemWithinLimit, deleteCustomerWishlistItem } = await import('../../../src/domains/wishlist/repositories/wishlist.repository.js')
const { WISHLIST_ITEM_SELECT } = await import('../../../src/domains/wishlist/mappers/wishlist.mapper.js')
const { WISHLIST_PUBLIC_PRODUCT_STATUSES } = await import('../../../src/domains/wishlist/constants/wishlist.constants.js')
const owner = 'owner', productId = 'c' + 'a'.repeat(24)
const createdAt = new Date('2026-10-24T00:00:00Z')
const item = { productId, createdAt }

beforeEach(() => {
  vi.resetAllMocks()
  transaction.mockImplementation(action => action(tx))
  tx.product.findFirst.mockResolvedValue({ id: productId })
  tx.wishlistItem.findUnique.mockResolvedValue(null)
  tx.wishlistItem.count.mockResolvedValue(99)
  tx.wishlistItem.create.mockResolvedValue(item)
})

afterEach(() => {
  for (const key of ['findUnique', 'count', 'create', 'update']) expect(root.wishlistItem[key]).not.toHaveBeenCalled()
  expect(root.product.findFirst).not.toHaveBeenCalled()
  expect(tx.wishlistItem.update).not.toHaveBeenCalled()
})

describe('bounded wishlist persistence', () => {
  it('lists only owned IDs/dates, newest first with a deterministic tie break and hard 100-row bound', async () => {
    root.wishlistItem.findMany.mockResolvedValue([])
    expect(await findCustomerWishlist(owner)).toEqual([])
    expect(root.wishlistItem.findMany).toHaveBeenCalledWith({
      where: { userId: owner }, select: { productId: true, createdAt: true },
      orderBy: [{ createdAt: 'desc' }, { productId: 'asc' }], take: 100,
    })
    expect(WISHLIST_ITEM_SELECT).toEqual({ productId: true, createdAt: true })
  })

  it('checks public visibility, duplicate and cap then inserts only the owned key, all inside Serializable', async () => {
    expect(await saveCustomerWishlistItemWithinLimit(owner, productId)).toEqual({ state: 'saved', item })
    expect(transaction).toHaveBeenCalledWith(expect.any(Function), { isolationLevel: 'Serializable' })
    expect(tx.product.findFirst).toHaveBeenCalledWith({ where: { id: productId, status: { in: ['ACTIVE', 'OUT_OF_STOCK', 'COMING_SOON'] } }, select: { id: true } })
    expect(tx.wishlistItem.findUnique).toHaveBeenCalledWith({ where: { userId_productId: { userId: owner, productId } }, select: WISHLIST_ITEM_SELECT })
    expect(tx.wishlistItem.count).toHaveBeenCalledWith({ where: { userId: owner } })
    expect(tx.wishlistItem.create).toHaveBeenCalledWith({ data: { userId: owner, productId }, select: WISHLIST_ITEM_SELECT })
    const calls = [tx.product.findFirst, tx.wishlistItem.findUnique, tx.wishlistItem.count, tx.wishlistItem.create].map(method => method.mock.invocationCallOrder[0])
    expect(calls).toEqual([...calls].sort((a, b) => a - b))
  })

  it('treats a duplicate as success even at capacity without refreshing its save date', async () => {
    tx.wishlistItem.findUnique.mockResolvedValue(item)
    tx.wishlistItem.count.mockResolvedValue(100)
    expect(await saveCustomerWishlistItemWithinLimit(owner, productId)).toEqual({ state: 'saved', item })
    expect(tx.wishlistItem.count).not.toHaveBeenCalled()
    expect(tx.wishlistItem.create).not.toHaveBeenCalled()
  })

  it('does not save hidden/missing products or expose their existence through different results', async () => {
    tx.product.findFirst.mockResolvedValue(null)
    expect(await saveCustomerWishlistItemWithinLimit(owner, productId)).toEqual({ state: 'unavailable' })
    expect(tx.wishlistItem.findUnique).not.toHaveBeenCalled()
    expect(tx.wishlistItem.count).not.toHaveBeenCalled()
    expect(tx.wishlistItem.create).not.toHaveBeenCalled()
  })

  it.each([100, 101])('refuses a new item at count %i', async count => {
    tx.wishlistItem.count.mockResolvedValue(count)
    expect(await saveCustomerWishlistItemWithinLimit(owner, productId)).toEqual({ state: 'limit' })
    expect(tx.wishlistItem.create).not.toHaveBeenCalled()
  })

  it.each(['P2034', 'P2002'])('restarts the whole transaction after %s and rechecks a winning duplicate', async code => {
    transaction.mockImplementationOnce(async action => { await action(tx); throw { code } })
    tx.wishlistItem.findUnique.mockResolvedValueOnce(null).mockResolvedValueOnce(item)
    expect(await saveCustomerWishlistItemWithinLimit(owner, productId)).toEqual({ state: 'saved', item })
    expect(transaction).toHaveBeenCalledTimes(2)
    expect(tx.product.findFirst).toHaveBeenCalledTimes(2)
    expect(tx.wishlistItem.findUnique).toHaveBeenCalledTimes(2)
    expect(tx.wishlistItem.create).toHaveBeenCalledTimes(1)
  })

  it('rechecks capacity after rollback instead of blindly repeating the insert', async () => {
    transaction.mockImplementationOnce(async action => { await action(tx); throw { code: 'P2034' } })
    tx.wishlistItem.count.mockResolvedValueOnce(99).mockResolvedValueOnce(100)
    expect(await saveCustomerWishlistItemWithinLimit(owner, productId)).toEqual({ state: 'limit' })
    expect(tx.wishlistItem.create).toHaveBeenCalledTimes(1)
    expect(tx.wishlistItem.count).toHaveBeenCalledTimes(2)
  })

  it('rechecks visibility after a serialization conflict', async () => {
    transaction.mockImplementationOnce(async action => { await action(tx); throw { code: 'P2034' } })
    tx.product.findFirst.mockResolvedValueOnce({ id: productId }).mockResolvedValueOnce(null)
    expect(await saveCustomerWishlistItemWithinLimit(owner, productId)).toEqual({ state: 'unavailable' })
    expect(tx.wishlistItem.create).toHaveBeenCalledTimes(1)
  })

  it.each(['P2034', 'P2002'])('bounds %s retries to three total attempts and returns a safe conflict', async code => {
    transaction.mockRejectedValue({ code, message: 'private database details' })
    await expect(saveCustomerWishlistItemWithinLimit(owner, productId)).rejects.toMatchObject({ statusCode: 409, message: 'Wishlist changed. Please try again.' })
    expect(transaction).toHaveBeenCalledTimes(3)
  })

  it('allows two failed attempts then success, maps disappearing foreign keys, and never retries unknown failures', async () => {
    transaction.mockRejectedValueOnce({ code: 'P2034' }).mockRejectedValueOnce({ code: 'P2002' })
    expect(await saveCustomerWishlistItemWithinLimit(owner, productId)).toEqual({ state: 'saved', item })
    transaction.mockClear().mockRejectedValueOnce({ code: 'P2003' })
    expect(await saveCustomerWishlistItemWithinLimit(owner, productId)).toEqual({ state: 'unavailable' })
    expect(transaction).toHaveBeenCalledTimes(1)
    const failure = new Error('storage unavailable')
    transaction.mockClear().mockRejectedValue(failure)
    await expect(saveCustomerWishlistItemWithinLimit(owner, productId)).rejects.toBe(failure)
    expect(transaction).toHaveBeenCalledTimes(1)
  })

  it('deletes with both owner and product, including when the product is no longer public', async () => {
    root.wishlistItem.deleteMany.mockResolvedValue({ count: 0 })
    await deleteCustomerWishlistItem(owner, productId)
    expect(root.wishlistItem.deleteMany).toHaveBeenCalledWith({ where: { userId: owner, productId } })
    expect(transaction).not.toHaveBeenCalled()
    expect(tx.product.findFirst).not.toHaveBeenCalled()
  })
})

// Optimistic snapshots model commit/rollback and fresh retries, not a real PostgreSQL test.
function optimisticStore(initialRows, { failCommit = false } = {}) {
  let rows = structuredClone(initialRows), revision = 0, rollbacks = 0
  transaction.mockImplementation(async action => {
    const snapshot = structuredClone(rows), startedAt = revision
    let changed = false
    const result = await action({
      product: { findFirst: async ({ where }) => WISHLIST_PUBLIC_PRODUCT_STATUSES.includes('ACTIVE') ? { id: where.id } : null },
      wishlistItem: {
        findUnique: async ({ where: { userId_productId: key } }) => snapshot.find(row => row.userId === key.userId && row.productId === key.productId) || null,
        count: async ({ where }) => snapshot.filter(row => row.userId === where.userId).length,
        create: async ({ data }) => {
          const saved = { ...data, createdAt }
          snapshot.push(saved)
          changed = true
          return saved
        },
      },
    })
    if (failCommit || revision !== startedAt) {
      rollbacks++
      throw failCommit ? new Error('commit unavailable') : { code: 'P2034' }
    }
    if (changed) { rows = snapshot; revision++ }
    return result
  })
  return { rows: () => rows, rollbacks: () => rollbacks }
}

describe('wishlist concurrent transaction shape', () => {
  it('keeps exactly 100 owned rows when several different saves compete for the last slot', async () => {
    const initial = Array.from({ length: 99 }, (_, index) => ({ userId: owner, productId: 'c' + String(index).padStart(24, '0'), createdAt }))
    const store = optimisticStore(initial)
    const results = await Promise.all(['b', 'c', 'd', 'e'].map(letter => saveCustomerWishlistItemWithinLimit(owner, 'c' + letter.repeat(24))))
    expect(results.filter(result => result.state === 'saved')).toHaveLength(1)
    expect(results.filter(result => result.state === 'limit')).toHaveLength(3)
    expect(store.rows()).toHaveLength(100)
    expect(store.rollbacks()).toBe(3)
  })

  it('returns one original date and one row for competing duplicate saves', async () => {
    const store = optimisticStore([])
    const results = await Promise.all(Array.from({ length: 4 }, () => saveCustomerWishlistItemWithinLimit(owner, productId)))
    expect(results.every(result => result.state === 'saved' && result.item.createdAt.getTime() === createdAt.getTime())).toBe(true)
    expect(store.rows()).toEqual([{ userId: owner, productId, createdAt }])
    expect(store.rollbacks()).toBe(3)
  })

  it('does not retain callback writes when commit fails and has no root-write fallback', async () => {
    const store = optimisticStore([], { failCommit: true })
    await expect(saveCustomerWishlistItemWithinLimit(owner, productId)).rejects.toThrow('commit unavailable')
    expect(store.rows()).toEqual([])
    expect(store.rollbacks()).toBe(1)
    expect(transaction).toHaveBeenCalledTimes(1)
  })
})
