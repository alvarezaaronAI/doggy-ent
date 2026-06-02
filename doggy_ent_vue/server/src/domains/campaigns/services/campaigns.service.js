import {
  buildCampaignMutationData,
  mapCampaignDonationPreview,
  normalizeCampaignInput,
} from '../mappers/campaigns.mapper.js'
import {
  createCampaignRecord,
  deleteCampaignRecord,
  findActiveCampaigns,
  findAllCampaigns,
  findCampaignById,
  findCampaignBySlug,
  incrementCampaignUsageStats,
  updateCampaignRecord,
} from '../repositories/campaigns.repository.js'
import {
  calculateDonationAmount,
  isCampaignActive,
} from '../utils/campaigns.utils.js'
import {
  normalizeCurrencyAmount,
} from '../../../shared/utils/money.js'
import {
  validateCampaignInput,
} from '../validators/campaigns.validator.js'

export async function getAllCampaigns() {
  return findAllCampaigns()
}

export async function getCampaignById(campaignId) {
  return findCampaignById(campaignId)
}

export async function createCampaign(input) {
  const campaign = normalizeCampaignInput(input)

  const validationError = validateCampaignInput(campaign)

  if (validationError) {
    throw validationError
  }

  const existingCampaign = await findCampaignBySlug(
    campaign.slug,
  )

  if (existingCampaign) {
    const error = new Error(
      'A campaign with this name already exists.',
    )

    error.statusCode = 409
    throw error
  }

  return createCampaignRecord(
    buildCampaignMutationData(campaign),
  )
}

export async function updateCampaignById(
  campaignId,
  input,
) {
  const existingCampaign = await findCampaignById(campaignId)

  if (!existingCampaign) {
    const error = new Error('Campaign not found.')
    error.statusCode = 404
    throw error
  }

  const updatedCampaign = normalizeCampaignInput({
    ...existingCampaign,
    ...input,
    id: campaignId,
  })

  return updateCampaignRecord(
    campaignId,
    buildCampaignMutationData(updatedCampaign),
  )
}

export async function deleteCampaignById(campaignId) {
  const existingCampaign = await findCampaignById(campaignId)

  if (!existingCampaign) {
    const error = new Error('Campaign not found.')
    error.statusCode = 404
    throw error
  }

  return deleteCampaignRecord(campaignId)
}

export async function getActiveCampaignsForCart(
  cartItems = [],
) {
  const itemProductIds = cartItems
    .map((item) =>
      String(item.id || item.productId || '').trim(),
    )
    .filter(Boolean)

  const campaigns = await findActiveCampaigns()

  return campaigns.filter((campaign) => {
    if (!isCampaignActive(campaign)) {
      return false
    }

    const productIds = Array.isArray(campaign.productIds)
      ? campaign.productIds
      : []

    if (!productIds.length) {
      return false
    }

    return productIds.some((productId) =>
      itemProductIds.includes(productId),
    )
  })
}

export async function previewCampaignDonations(
  cartItems = [],
) {
  const activeCampaigns =
    await getActiveCampaignsForCart(cartItems)

  return activeCampaigns.map((campaign) =>
    mapCampaignDonationPreview({
      campaign,
      cartItems,
    }),
  )
}

export async function recordCampaignDonationUsage({
  campaignId,
  subtotal,
}) {
  const campaign = await findCampaignById(campaignId)

  if (!campaign) {
    return null
  }

  const normalizedSubtotal = normalizeCurrencyAmount(
    subtotal || 0,
  )

  const donationAmount = calculateDonationAmount(
    campaign,
    normalizedSubtotal,
  )

  return incrementCampaignUsageStats({
    campaignId,
    subtotal: normalizedSubtotal,
    donationAmount,
  })
}
