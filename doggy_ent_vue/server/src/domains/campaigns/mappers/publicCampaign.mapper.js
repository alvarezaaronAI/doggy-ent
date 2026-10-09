import {
  isCampaignActive,
  normalizeProductIds,
} from '../utils/campaigns.utils.js'
import { isSafeCampaignUrl } from '../validators/campaigns.validator.js'

export function mapPublicCampaignSummary(campaign) {
  return {
    id: campaign.id,
    slug: campaign.slug,
    name: campaign.name,
    donationTarget: campaign.donationTarget,
    donationType: campaign.donationType,
    donationValue: Number(campaign.donationValue || 0),
    productIds: normalizeProductIds(campaign.productIds),
    pageAvailable: campaign.publicPageEnabled === true,
    isActive: isCampaignActive(campaign),
  }
}

export function mapPublicCampaignPage(campaign) {
  return {
    ...mapPublicCampaignSummary(campaign),
    description: campaign.description || '',
    story: campaign.story || '',
    image: isSafeCampaignUrl(campaign.image) ? campaign.image || null : null,
    imageAlt: campaign.imageAlt || '',
    beneficiaryUrl: isSafeCampaignUrl(campaign.beneficiaryUrl)
      ? campaign.beneficiaryUrl || null
      : null,
    startsAt: campaign.startsAt,
    endsAt: campaign.endsAt,
    status: campaign.status,
    donationGenerated: Number(campaign.donationGenerated || 0),
  }
}
