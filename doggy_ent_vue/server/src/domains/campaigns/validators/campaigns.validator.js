export function validateCampaignInput(campaign) {
  if (campaign.name) {
    return null
  }

  const error = new Error('Campaign name is required.')
  error.statusCode = 400

  return error
}
