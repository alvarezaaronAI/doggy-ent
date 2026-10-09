import { describe, expect, it } from 'vitest'
import {
  buildAdminCampaignPayload,
  createEmptyAdminCampaignForm,
  mapCampaignToAdminCampaignForm,
} from '../../../src/domains/admin/mappers/adminCampaignForm.mapper.js'
import { validateAdminCampaignPayload } from '../../../src/domains/admin/validators/adminCampaign.validator.js'
import {
  getCampaignContributionLabel,
  getCampaignsForProduct,
  safeCampaignLink,
} from '../../../src/domains/campaigns/utils/campaignPresentation.js'

describe('campaign visual editor payloads', () => {
  it('round-trips all public content and preserves exact schedule instants on an unrelated edit', () => {
    const campaign = {
      name: 'Good company',
      slug: 'stable-link',
      story: 'Our story',
      image: 'https://images.example.test/dog.jpg',
      imageAlt: 'A dog',
      beneficiaryUrl: 'https://partner.example.test',
      description: 'An introduction',
      donationTarget: 'Partner',
      publicPageEnabled: true,
      featured: true,
      startsAt: '2026-10-09T09:45:32.123Z',
      endsAt: '2026-11-09T09:45:00.000Z',
      productIds: ['chicken'],
    }
    const form = mapCampaignToAdminCampaignForm(campaign)
    form.name = 'Renamed campaign'
    const payload = buildAdminCampaignPayload(form)
    expect(payload).toMatchObject({
      story: campaign.story,
      image: campaign.image,
      imageAlt: campaign.imageAlt,
      beneficiaryUrl: campaign.beneficiaryUrl,
      publicPageEnabled: true,
      featured: true,
      startsAt: campaign.startsAt,
      endsAt: campaign.endsAt,
    })
    expect(payload).not.toHaveProperty('slug')
    expect(payload).not.toHaveProperty('donationGenerated')
    form.startsDate = '2026-10-10'
    expect(buildAdminCampaignPayload(form).startsAt).toBe(
      new Date('2026-10-10T' + form.startsTime).toISOString(),
    )
  })
  it('keeps public visibility opt-in and rejects unsafe URLs and incomplete publishing', () => {
    const payload = buildAdminCampaignPayload({
      ...createEmptyAdminCampaignForm(),
      name: 'Giving',
    })
    expect(payload.publicPageEnabled).toBe(false)
    expect(validateAdminCampaignPayload(payload)).toBe('')
    expect(
      validateAdminCampaignPayload({ ...payload, publicPageEnabled: true }),
    ).toContain('introduction')
    expect(
      validateAdminCampaignPayload({ ...payload, donationValue: 101 }),
    ).toContain('100%')
    expect(
      validateAdminCampaignPayload({
        ...payload,
        image: 'javascript:alert(1)',
      }),
    ).toContain('HTTPS')
  })
})
describe('campaign customer presentation', () => {
  it('labels fixed giving per order, not per bag, and returns every active matched campaign', () => {
    expect(
      getCampaignContributionLabel({ donationType: 'FIXED', donationValue: 2 }),
    ).toBe('$2.00 per eligible order')
    expect(
      getCampaignContributionLabel({
        donationType: 'PERCENT',
        donationValue: 5,
      }),
    ).toBe('5% of eligible product sales')
    const campaigns = [
      { id: 'a', isActive: true, productIds: ['chicken'] },
      { id: 'b', isActive: true, productIds: ['chicken'] },
      { id: 'c', isActive: false, productIds: ['chicken'] },
    ]
    expect(
      getCampaignsForProduct(campaigns, 'chicken').map((c) => c.id),
    ).toEqual(['a', 'b'])
    for (const url of [
      'javascript:alert(1)',
      'http://example.test',
      'https://user:password@example.test',
    ])
      expect(safeCampaignLink(url)).toBe('')
  })
})
