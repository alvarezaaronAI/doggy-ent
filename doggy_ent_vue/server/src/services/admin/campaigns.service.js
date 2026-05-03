

const nowISO = () => new Date().toISOString()

const campaigns = [
  {
    id: 'campaign-la-dogs-may-drive',
    name: 'LA Dogs May Drive',
    description: 'A limited-time donation campaign supporting LA Dogs Shelter.',

    status: 'active', // draft | active | paused | ended

    donationTarget: 'LA Dogs Shelter',
    donationType: 'percent', // fixed | percent
    donationValue: 5,

    productIds: [],

    startsAt: null,
    endsAt: null,

    donationGenerated: 0,
    revenueGenerated: 0,
    orderCount: 0,

    createdAt: nowISO(),
    updatedAt: nowISO(),
  },
]

function slugify(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function normalizeOptionalString(value) {
  const normalized = String(value || '').trim()
  return normalized || null
}

function normalizeProductIds(productIds) {
  if (!Array.isArray(productIds)) return []

  return [...new Set(productIds.map((id) => String(id).trim()).filter(Boolean))]
}

function normalizeCampaignInput(input) {
  const now = nowISO()
  const name = String(input.name || '').trim()
  const fallbackId = name ? `campaign-${slugify(name)}` : `campaign-${Date.now()}`

  return {
    id: input.id || fallbackId,
    name,
    description: input.description || '',

    status: input.status || 'draft',

    donationTarget: input.donationTarget || '',
    donationType: input.donationType || 'percent',
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

function isCampaignActive(campaign) {
  if (!campaign || campaign.status !== 'active') return false

  const currentTime = Date.now()
  const startsAt = campaign.startsAt ? Date.parse(campaign.startsAt) : null
  const endsAt = campaign.endsAt ? Date.parse(campaign.endsAt) : null

  if (startsAt && currentTime < startsAt) return false
  if (endsAt && currentTime > endsAt) return false

  return true
}

function calculateDonationAmount(campaign, subtotal) {
  const safeSubtotal = Number(subtotal || 0)

  if (campaign.donationType === 'percent') {
    return safeSubtotal * (Number(campaign.donationValue || 0) / 100)
  }

  return Number(campaign.donationValue || 0)
}

export async function getAllCampaigns() {
  return campaigns
}

export async function getCampaignById(campaignId) {
  return campaigns.find((campaign) => campaign.id === campaignId) || null
}

export async function createCampaign(input) {
  const campaign = normalizeCampaignInput(input)

  if (!campaign.name) {
    const error = new Error('Campaign name is required.')
    error.statusCode = 400
    throw error
  }

  if (campaigns.find((currentCampaign) => currentCampaign.id === campaign.id)) {
    const error = new Error('A campaign with this name already exists.')
    error.statusCode = 409
    throw error
  }

  campaigns.push(campaign)
  return campaign
}

export async function updateCampaignById(campaignId, input) {
  const campaignIndex = campaigns.findIndex((campaign) => campaign.id === campaignId)

  if (campaignIndex === -1) {
    const error = new Error('Campaign not found.')
    error.statusCode = 404
    throw error
  }

  const updatedCampaign = normalizeCampaignInput({
    ...campaigns[campaignIndex],
    ...input,
    id: campaignId,
  })

  campaigns[campaignIndex] = updatedCampaign
  return updatedCampaign
}

export async function deleteCampaignById(campaignId) {
  const campaignIndex = campaigns.findIndex((campaign) => campaign.id === campaignId)

  if (campaignIndex === -1) {
    const error = new Error('Campaign not found.')
    error.statusCode = 404
    throw error
  }

  const [deletedCampaign] = campaigns.splice(campaignIndex, 1)
  return deletedCampaign
}

export async function getActiveCampaignsForCart(cartItems = []) {
  const itemProductIds = cartItems.map((item) => String(item.id || item.productId || '').trim()).filter(Boolean)

  return campaigns.filter((campaign) => {
    if (!isCampaignActive(campaign)) return false
    if (!campaign.productIds.length) return false

    return campaign.productIds.some((productId) => itemProductIds.includes(productId))
  })
}

export async function previewCampaignDonations(cartItems = []) {
  const activeCampaigns = await getActiveCampaignsForCart(cartItems)

  return activeCampaigns.map((campaign) => {
    const matchedItems = cartItems.filter((item) => campaign.productIds.includes(String(item.id || item.productId)))
    const matchedSubtotal = matchedItems.reduce(
      (total, item) => total + Number(item.price || 0) * Number(item.quantity || 0),
      0
    )

    return {
      campaignId: campaign.id,
      campaignName: campaign.name,
      donationTarget: campaign.donationTarget,
      donationType: campaign.donationType,
      donationValue: campaign.donationValue,
      matchedSubtotal,
      donationAmount: calculateDonationAmount(campaign, matchedSubtotal),
      matchedProductIds: matchedItems.map((item) => item.id || item.productId),
    }
  })
}

export async function recordCampaignDonationUsage({ campaignId, subtotal }) {
  const campaign = campaigns.find((currentCampaign) => currentCampaign.id === campaignId)
  if (!campaign) return null

  const donationAmount = calculateDonationAmount(campaign, subtotal)

  campaign.orderCount += 1
  campaign.revenueGenerated += Number(subtotal || 0)
  campaign.donationGenerated += donationAmount
  campaign.updatedAt = nowISO()

  return campaign
}