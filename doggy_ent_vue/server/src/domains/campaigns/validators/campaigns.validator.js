import {
  CAMPAIGN_DONATION_TYPE,
  CAMPAIGN_STATUS,
} from '../constants/campaigns.constants.js'

function failure(message) {
  const error = new Error(message)
  error.statusCode = 400
  return error
}

export function isSafeCampaignUrl(value) {
  if (!value) return true
  try {
    const url = new URL(value)
    return url.protocol === 'https:' && !url.username && !url.password
  } catch {
    return false
  }
}

export function validateCampaignInput(campaign) {
  if (!campaign.name || campaign.name.length > 160)
    return failure('Campaign name must contain 1 to 160 characters.')
  if (
    !Object.values(CAMPAIGN_STATUS).includes(
      String(campaign.status).toUpperCase(),
    )
  )
    return failure('Choose a valid campaign status.')
  const type = String(campaign.donationType).toUpperCase()
  if (!Object.values(CAMPAIGN_DONATION_TYPE).includes(type))
    return failure('Choose a valid donation type.')
  if (
    !Number.isFinite(campaign.donationValue) ||
    campaign.donationValue < 0 ||
    (type === 'PERCENT' && campaign.donationValue > 100)
  )
    return failure(
      'Enter a valid donation value. Percentages cannot exceed 100%.',
    )
  for (const field of ['startsAt', 'endsAt']) {
    if (campaign[field] && !Number.isFinite(Date.parse(campaign[field])))
      return failure('Enter valid campaign dates.')
  }
  if (
    campaign.startsAt &&
    campaign.endsAt &&
    Date.parse(campaign.endsAt) <= Date.parse(campaign.startsAt)
  )
    return failure('Campaign end must be after its start.')
  if (
    !isSafeCampaignUrl(campaign.image) ||
    !isSafeCampaignUrl(campaign.beneficiaryUrl)
  )
    return failure(
      'Image and beneficiary links must be valid HTTPS URLs without credentials.',
    )
  if (
    String(campaign.description || '').length > 600 ||
    String(campaign.story || '').length > 10000 ||
    String(campaign.imageAlt || '').length > 240 ||
    String(campaign.donationTarget || '').length > 240
  )
    return failure('Campaign content exceeds the allowed length.')
  if (
    campaign.publicPageEnabled &&
    (!String(campaign.description || '').trim() ||
      !String(campaign.donationTarget || '').trim())
  )
    return failure('A public page needs an introduction and a beneficiary.')
  if (campaign.publicPageEnabled && campaign.image && !campaign.imageAlt)
    return failure(
      'Add an image description before publishing the campaign page.',
    )
  return null
}
