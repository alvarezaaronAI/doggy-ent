import { formatCurrency } from '@shared/utils/currency.js'

export function getCampaignContributionLabel(campaign) {
  return String(campaign?.donationType).toUpperCase() === 'FIXED'
    ? `${formatCurrency(Number(campaign?.donationValue || 0))} per eligible order`
    : `${Number(campaign?.donationValue || 0)}% of eligible product sales`
}

export function getCampaignsForProduct(campaigns, productId) {
  return (Array.isArray(campaigns) ? campaigns : []).filter(
    (campaign) =>
      campaign.isActive &&
      Array.isArray(campaign.productIds) &&
      campaign.productIds.includes(String(productId)),
  )
}

export function safeCampaignLink(value) {
  if (!value) return ''
  try {
    const url = new URL(value)
    return url.protocol === 'https:' && !url.username && !url.password
      ? url.href
      : ''
  } catch {
    return ''
  }
}
