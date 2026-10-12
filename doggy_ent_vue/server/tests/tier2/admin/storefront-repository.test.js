import { beforeEach, describe, expect, it, vi } from 'vitest'
const db = vi.hoisted(() => ({ create: vi.fn(), updateManyAndReturn: vi.fn(), findUnique: vi.fn() }))
vi.mock('../../../src/db/prisma.js', () => ({ prisma: { storefrontContent: db } }))
const { writeStorefrontContent } = await import('../../../src/domains/storefront/repositories/storefront.repository.js')
beforeEach(() => vi.resetAllMocks())
describe('website optimistic concurrency repository', () => {
  it('guards initial concurrent creation with the unique singleton key', async () => {
    db.create.mockRejectedValue({ code: 'P2002' })
    expect(await writeStorefrontContent(0, { draft: {} })).toBeNull()
    expect(db.create).toHaveBeenCalledWith({ data: { id: 'home', revision: 1, draft: {} } })
  })
  it('updates only the exact expected revision and returns that write', async () => {
    db.updateManyAndReturn.mockResolvedValue([{ revision: 5 }])
    expect(await writeStorefrontContent(4, { draft: {} })).toEqual({ revision: 5 })
    expect(db.updateManyAndReturn).toHaveBeenCalledWith({ where: { id: 'home', revision: 4 }, data: { draft: {}, revision: { increment: 1 } } })
    expect(db.findUnique).not.toHaveBeenCalled()
  })
})
