import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import express from 'express'
import {
  mapPublicCampaignPage,
  mapPublicCampaignSummary,
} from '../../../src/domains/campaigns/mappers/publicCampaign.mapper.js'
import { normalizeCampaignInput } from '../../../src/domains/campaigns/mappers/campaigns.mapper.js'
import { validateCampaignInput } from '../../../src/domains/campaigns/validators/campaigns.validator.js'

const repo = vi.hoisted(() => ({
  findPublicCampaignBySlug: vi.fn(),
  findActiveCampaigns: vi.fn(),
  findAllCampaigns: vi.fn(),
  findCampaignById: vi.fn(),
  findCampaignBySlug: vi.fn(),
  createCampaignRecord: vi.fn(),
  updateCampaignRecord: vi.fn(),
  deleteCampaignRecord: vi.fn(),
  incrementCampaignUsageStats: vi.fn(),
  recordOrderCampaignUsage: vi.fn(),
}))
vi.mock(
  '../../../src/domains/campaigns/repositories/campaigns.repository.js',
  () => repo,
)
vi.mock('../../../src/domains/auth/services/auth.service.js', () => ({
  getSessionCookieName: () => 'admin-session',
  getAdminFromSession: async () => null,
}))
const { default: routes } =
  await import('../../../src/domains/campaigns/routes/campaigns.routes.js')
const { updateCampaignById, getStorefrontCampaigns } =
  await import('../../../src/domains/campaigns/services/campaigns.service.js')
let server
const campaign = {
  id: 'campaign-1',
  slug: 'giving',
  name: 'Giving',
  description: 'An introduction',
  donationTarget: 'Partner',
  story: 'A story',
  publicPageEnabled: true,
  status: 'ACTIVE',
  donationType: 'PERCENT',
  donationValue: 5,
  productIds: ['chicken'],
  image: null,
  donationGenerated: 12,
}
beforeEach(() => vi.resetAllMocks())
afterEach(async () => {
  if (server) {
    await new Promise((resolve) => server.close(resolve))
    server = null
  }
})
describe('safe public campaigns', () => {
  it('allowlists public fields and never returns customer/order attribution or internal revenue', () => {
    const row = {
      ...campaign,
      orderUsages: [
        {
          orderId: 'private-order',
          order: { customerEmail: 'private@example.test' },
        },
      ],
      orderAttributions: ['private-attribution'],
      revenueGenerated: 900,
      orderCount: 3,
      privateCanary: 'secret-canary',
    }
    const output = JSON.stringify(mapPublicCampaignPage(row))
    for (const sensitive of [
      'private-order',
      'private@example.test',
      'private-attribution',
      'secret-canary',
      'revenueGenerated',
      'orderCount',
    ])
      expect(output).not.toContain(sensitive)
    expect(mapPublicCampaignSummary(row).pageAvailable).toBe(true)
    expect(mapPublicCampaignPage(row).story).toBe('A story')
  })
  it('publishes only currently active summaries and keeps legacy giving independent of public page visibility', async () => {
    repo.findActiveCampaigns.mockResolvedValue([
      campaign,
      { ...campaign, id: 'legacy', publicPageEnabled: false },
      { ...campaign, id: 'featured', featured: true },
      { ...campaign, id: 'future', startsAt: new Date(Date.now() + 86400000) },
      { ...campaign, id: 'ended', endsAt: new Date(Date.now() - 86400000) },
      { ...campaign, id: 'paused', status: 'PAUSED' },
    ])
    expect(
      (await getStorefrontCampaigns()).map((row) => [
        row.id,
        row.pageAvailable,
      ]),
    ).toEqual([
      ['featured', true],
      ['campaign-1', true],
      ['legacy', false],
    ])
  })
  it('permits safe public reads but retains admin authorization on every management route', async () => {
    repo.findPublicCampaignBySlug.mockResolvedValue(campaign)
    repo.findActiveCampaigns.mockResolvedValue([campaign])
    const app = express()
    app.use(express.json())
    app.use((req, res, next) => {
      req.cookies = {}
      next()
    })
    app.use('/api/campaigns', routes)
    server = app.listen(0, '127.0.0.1')
    await new Promise((resolve) => server.once('listening', resolve))
    const origin = 'http://127.0.0.1:' + server.address().port
    expect((await fetch(origin + '/api/campaigns/public')).status).toBe(200)
    expect((await fetch(origin + '/api/campaigns/public/giving')).status).toBe(
      200,
    )
    for (const [method, path] of [
      ['GET', ''],
      ['GET', '/campaign-1'],
      ['POST', ''],
      ['PUT', '/campaign-1'],
      ['DELETE', '/campaign-1'],
      ['POST', '/record-usage'],
    ])
      expect(
        (await fetch(origin + '/api/campaigns' + path, { method })).status,
      ).toBe(401)
    repo.findPublicCampaignBySlug.mockResolvedValue(null)
    expect((await fetch(origin + '/api/campaigns/public/missing')).status).toBe(
      404,
    )
  })
  it('retains public links on rename and validates updates before repository writes', async () => {
    repo.findCampaignById.mockResolvedValue(campaign)
    await updateCampaignById(campaign.id, {
      name: 'New name',
      slug: 'attacker-link',
    })
    expect(repo.updateCampaignRecord).toHaveBeenCalledWith(
      campaign.id,
      expect.objectContaining({ name: 'New name', slug: 'giving' }),
    )
    repo.updateCampaignRecord.mockClear()
    await expect(
      updateCampaignById(campaign.id, { donationValue: 101 }),
    ).rejects.toThrow('100%')
    expect(repo.updateCampaignRecord).not.toHaveBeenCalled()
  })
  it('validates publication content, dates, enums, and safe HTTPS links', () => {
    expect(validateCampaignInput(normalizeCampaignInput(campaign))).toBeNull()
    for (const change of [
      { status: 'INVALID' },
      { donationType: 'INVALID' },
      { donationValue: -1 },
      { startsAt: 'invalid' },
      { startsAt: '2026-10-10', endsAt: '2026-10-09' },
      { image: 'javascript:alert(1)' },
      { beneficiaryUrl: 'https://user:pass@example.test' },
      { description: '' },
      { image: 'https://images.example.test/dog.jpg', imageAlt: '' },
    ])
      expect(
        validateCampaignInput(
          normalizeCampaignInput({ ...campaign, ...change }),
        )?.statusCode,
      ).toBe(400)
  })
})
