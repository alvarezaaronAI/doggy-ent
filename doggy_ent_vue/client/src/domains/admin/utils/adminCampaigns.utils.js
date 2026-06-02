import {
  CAMPAIGN_STATUSES,
  CAMPAIGN_STATUS_CLASSES,
  DONATION_TYPES,
} from '../constants/adminCampaigns.constants'

export function normalizeCampaignStatus(status) {
  return String(status || '').toUpperCase()
}

export function normalizeDonationType(type) {
  return String(type || '').toUpperCase()
}

export function formatAdminCampaignPrice(value) {
  return `$${Number(value || 0).toFixed(2)}`
}

export function formatCampaignDonationRule(campaign) {
  if (normalizeDonationType(campaign.donationType) === DONATION_TYPES.PERCENT) {
    return `${Number(campaign.donationValue || 0)}% of selected product sales`
  }

  return `${formatAdminCampaignPrice(campaign.donationValue)} per matched order`
}

export function getCampaignStatusClass(status) {
  return CAMPAIGN_STATUS_CLASSES[normalizeCampaignStatus(status)]
    || CAMPAIGN_STATUS_CLASSES[CAMPAIGN_STATUSES.DRAFT]
}
