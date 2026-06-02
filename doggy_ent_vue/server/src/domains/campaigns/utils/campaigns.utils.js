import {
  normalizeCurrencyAmount,
} from '../../../shared/utils/money.js'
import {
  CAMPAIGN_DONATION_TYPE,
  CAMPAIGN_STATUS,
} from '../constants/campaigns.constants.js'

export function normalizeProductIds(productIds) {
  if (!Array.isArray(productIds)) return []

  return [
    ...new Set(
      productIds
        .map((id) => String(id).trim())
        .filter(Boolean),
    ),
  ]
}

export function isCampaignActive(campaign) {
  if (!campaign || campaign.status !== CAMPAIGN_STATUS.ACTIVE) {
    return false
  }

  const currentTime = Date.now()

  const startsAt = campaign.startsAt
    ? Date.parse(campaign.startsAt)
    : null

  const endsAt = campaign.endsAt
    ? Date.parse(campaign.endsAt)
    : null

  if (startsAt && currentTime < startsAt) {
    return false
  }

  if (endsAt && currentTime > endsAt) {
    return false
  }

  return true
}

export function calculateDonationAmount(campaign, subtotal) {
  const safeSubtotal = normalizeCurrencyAmount(
    subtotal || 0,
  )

  if (campaign.donationType === CAMPAIGN_DONATION_TYPE.PERCENT) {
    return normalizeCurrencyAmount(
      safeSubtotal
      * (Number(campaign.donationValue || 0) / 100),
    )
  }

  return normalizeCurrencyAmount(
    campaign.donationValue || 0,
  )
}
