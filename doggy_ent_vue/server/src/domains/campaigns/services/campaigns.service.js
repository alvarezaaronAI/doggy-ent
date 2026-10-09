import {
  buildCampaignMutationData,
  mapCampaign,
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
  findPublicCampaignBySlug,
  incrementCampaignUsageStats,
  recordOrderCampaignUsage,
  updateCampaignRecord,
} from '../repositories/campaigns.repository.js'
import {
  calculateDonationAmount,
  isCampaignActive,
} from '../utils/campaigns.utils.js'
import { normalizeCurrencyAmount } from '../../../shared/utils/money.js'
import { validateCampaignInput } from '../validators/campaigns.validator.js'
import {
  mapPublicCampaignPage,
  mapPublicCampaignSummary,
} from '../mappers/publicCampaign.mapper.js'

export async function getStorefrontCampaigns() {
  const campaigns = await findActiveCampaigns()
  return campaigns
    .filter(isCampaignActive)
    .sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)))
    .map(mapPublicCampaignSummary)
}

export async function getPublicCampaignPage(slug) {
  const campaign = await findPublicCampaignBySlug(slug)
  return campaign ? mapPublicCampaignPage(campaign) : null
}

export async function getAllCampaigns() {
  const campaigns = await findAllCampaigns()

  return campaigns.map(mapCampaign)
}

export async function getCampaignById(campaignId) {
  return findCampaignById(campaignId)
}

export async function createCampaign(input) {
  const campaign = normalizeCampaignInput({ ...input, slug: null })

  const validationError = validateCampaignInput(campaign)

  if (validationError) {
    throw validationError
  }

  const existingCampaign = await findCampaignBySlug(campaign.slug)

  if (existingCampaign) {
    const error = new Error('A campaign with this name already exists.')

    error.statusCode = 409
    throw error
  }

  return createCampaignRecord(buildCampaignMutationData(campaign))
}

export async function updateCampaignById(campaignId, input) {
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
    slug: existingCampaign.slug,
  })

  const validationError = validateCampaignInput(updatedCampaign)
  if (validationError) throw validationError

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

export async function getActiveCampaignsForCart(cartItems = []) {
  const itemProductIds = cartItems
    .map((item) => String(item.id || item.productId || '').trim())
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

    return productIds.some((productId) => itemProductIds.includes(productId))
  })
}

export async function previewCampaignDonations(cartItems = []) {
  const activeCampaigns = await getActiveCampaignsForCart(cartItems)

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
  orderId = null,
  donationAmount = null,
  matchedProductIds = [],
}) {
  const campaign = await findCampaignById(campaignId)

  if (!campaign) {
    return null
  }

  const normalizedSubtotal = normalizeCurrencyAmount(subtotal || 0)

  const normalizedDonationAmount = normalizeCurrencyAmount(
    donationAmount ?? calculateDonationAmount(campaign, normalizedSubtotal),
  )

  if (orderId) {
    return recordOrderCampaignUsage({
      campaignId,
      orderId,
      eligibleSubtotal: normalizedSubtotal,
      donationAmount: normalizedDonationAmount,
      matchedProductIds,
    })
  }

  return incrementCampaignUsageStats({
    campaignId,
    subtotal: normalizedSubtotal,
    donationAmount: normalizedDonationAmount,
  })
}
