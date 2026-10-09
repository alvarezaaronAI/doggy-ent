import { describe, expect, it, vi } from 'vitest'
const findFirst = vi.hoisted(() => vi.fn())
vi.mock('../../../src/db/prisma.js', () => ({
  prisma: { campaign: { findFirst } },
}))
const { findPublicCampaignBySlug } =
  await import('../../../src/domains/campaigns/repositories/campaigns.repository.js')
describe('public page repository visibility', () => {
  it('requires opt-in and excludes draft/archived records without loading any order relations', async () => {
    await findPublicCampaignBySlug('giving')
    expect(findFirst).toHaveBeenCalledWith({
      where: {
        slug: 'giving',
        publicPageEnabled: true,
        status: { in: ['ACTIVE', 'PAUSED', 'ENDED'] },
      },
    })
  })
})
