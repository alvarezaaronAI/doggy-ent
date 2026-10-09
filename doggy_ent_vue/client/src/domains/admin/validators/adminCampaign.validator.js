import { safeCampaignLink } from '@campaigns/utils/campaignPresentation.js'

export function validateAdminCampaignPayload(payload) {
  if (!payload.name) return 'Add a campaign name.'
  if (
    !Number.isFinite(payload.donationValue) ||
    payload.donationValue < 0 ||
    (payload.donationType === 'PERCENT' && payload.donationValue > 100)
  )
    return 'Enter a valid contribution. Percentages cannot exceed 100%.'
  if (
    payload.startsAt &&
    payload.endsAt &&
    Date.parse(payload.endsAt) <= Date.parse(payload.startsAt)
  )
    return 'Campaign end must be after its start.'
  for (const key of ['image', 'beneficiaryUrl']) {
    if (payload[key] && !safeCampaignLink(payload[key]))
      return 'Use valid HTTPS image and partner links without credentials.'
  }
  if (
    payload.publicPageEnabled &&
    (!payload.description || !payload.donationTarget)
  )
    return 'A public page needs an introduction and a beneficiary.'
  if (payload.publicPageEnabled && payload.image && !payload.imageAlt)
    return 'Add an image description before publishing.'
  return ''
}
