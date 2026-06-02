import {
  normalizeOptionalString,
  slugify,
} from '../../../shared/utils/string.js'
import {
  CAMPAIGN_DEFAULTS,
} from '../constants/campaigns.constants.js'
import {
  calculateDonationAmount,
  normalizeProductIds,
} from '../utils/campaigns.utils.js'
import {
  normalizeCurrencyAmount,
} from '../../../shared/utils/money.js'

const nowISO = () => new Date().toISOString()

export function normalizeCampaignInput(input) {
  const now = nowISO()
  const name = String(input.name || '').trim()

  return {
    id: input.id,
    name,
    slug: slugify(name),

    description: input.description || '',
    image: input.image || null,
    featured: Boolean(input.featured),

    status: input.status || CAMPAIGN_DEFAULTS.STATUS,

    donationTarget: input.donationTarget || '',
    donationType:
      input.donationType || CAMPAIGN_DEFAULTS.DONATION_TYPE,
    donationValue: Number(input.donationValue ?? 0),

    productIds: normalizeProductIds(input.productIds),

    startsAt: normalizeOptionalString(input.startsAt),
    endsAt: normalizeOptionalString(input.endsAt),

    donationGenerated: Number(input.donationGenerated ?? 0),
    revenueGenerated: Number(input.revenueGenerated ?? 0),
    orderCount: Number(input.orderCount ?? 0),

    createdAt: input.createdAt || now,
    updatedAt: now,
  }
}

export function buildCampaignMutationData(campaign) {
  return {
    name: campaign.name,
    slug: campaign.slug,

    description: campaign.description,
    image: campaign.image,
    featured: campaign.featured,

    status: String(
      campaign.status,
    ).toUpperCase(),

    donationTarget: campaign.donationTarget,

    donationType: String(
      campaign.donationType,
    ).toUpperCase(),

    donationValue: campaign.donationValue,

    productIds: campaign.productIds,

    startsAt: campaign.startsAt
      ? new Date(campaign.startsAt)
      : null,

    endsAt: campaign.endsAt
      ? new Date(campaign.endsAt)
      : null,
  }
}

export function mapCampaignDonationPreview({
  campaign,
  cartItems,
}) {
  const matchedItems = cartItems.filter((item) =>
    campaign.productIds.includes(
      String(item.id || item.productId),
    ),
  )

  const matchedSubtotal = normalizeCurrencyAmount(
    matchedItems.reduce(
      (total, item) => (
        total
        + Number(item.price || 0)
        * Number(item.quantity || 0)
      ),
      0,
    ),
  )

  return {
    campaignId: campaign.id,
    campaignName: campaign.name,

    donationTarget:
      campaign.donationTarget,

    donationType:
      campaign.donationType,

    donationValue:
      campaign.donationValue,

    matchedSubtotal,

    donationAmount:
      calculateDonationAmount(
        campaign,
        matchedSubtotal,
      ),

    matchedProductIds: matchedItems.map(
      (item) => item.id || item.productId,
    ),
  }
}
