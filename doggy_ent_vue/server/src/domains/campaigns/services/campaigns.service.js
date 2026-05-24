import { prisma } from '../../../db/prisma.js'

const nowISO = () => new Date().toISOString()

function normalizeCurrencyAmount(value) {
  return Number(
    Number(value || 0).toFixed(2),
  )
}

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

  return [
    ...new Set(
      productIds
        .map((id) => String(id).trim())
        .filter(Boolean),
    ),
  ]
}

function normalizeCampaignInput(input) {
  const now = nowISO()
  const name = String(input.name || '').trim()

  return {
    id: input.id,
    name,
    slug: slugify(name),

    description: input.description || '',
    image: input.image || null,
    featured: Boolean(input.featured),

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
  if (!campaign || campaign.status !== 'ACTIVE') {
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

function calculateDonationAmount(campaign, subtotal) {
  const safeSubtotal = normalizeCurrencyAmount(
    subtotal || 0,
  )

  if (campaign.donationType === 'PERCENT') {
    return normalizeCurrencyAmount(
      safeSubtotal
      * (Number(campaign.donationValue || 0) / 100),
    )
  }

  return normalizeCurrencyAmount(
    campaign.donationValue || 0,
  )
}

export async function getAllCampaigns() {
  return prisma.campaign.findMany({
    orderBy: {
      createdAt: 'desc',
    },
  })
}

export async function getCampaignById(campaignId) {
  return prisma.campaign.findUnique({
    where: {
      id: campaignId,
    },
  })
}

export async function createCampaign(input) {
  const campaign = normalizeCampaignInput(input)

  if (!campaign.name) {
    const error = new Error('Campaign name is required.')
    error.statusCode = 400
    throw error
  }

  const existingCampaign = await prisma.campaign.findUnique({
    where: {
      slug: campaign.slug,
    },
  })

  if (existingCampaign) {
    const error = new Error(
      'A campaign with this name already exists.',
    )

    error.statusCode = 409
    throw error
  }

  return prisma.campaign.create({
    data: {
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
    },
  })
}

export async function updateCampaignById(
  campaignId,
  input,
) {
  const existingCampaign = await prisma.campaign.findUnique({
    where: {
      id: campaignId,
    },
  })

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

  return prisma.campaign.update({
    where: {
      id: campaignId,
    },

    data: {
      name: updatedCampaign.name,
      slug: updatedCampaign.slug,

      description: updatedCampaign.description,
      image: updatedCampaign.image,
      featured: updatedCampaign.featured,

      status: String(
        updatedCampaign.status,
      ).toUpperCase(),

      donationTarget:
        updatedCampaign.donationTarget,

      donationType: String(
        updatedCampaign.donationType,
      ).toUpperCase(),

      donationValue:
        updatedCampaign.donationValue,

      productIds:
        updatedCampaign.productIds,

      startsAt: updatedCampaign.startsAt
        ? new Date(updatedCampaign.startsAt)
        : null,

      endsAt: updatedCampaign.endsAt
        ? new Date(updatedCampaign.endsAt)
        : null,
    },
  })
}

export async function deleteCampaignById(campaignId) {
  const existingCampaign = await prisma.campaign.findUnique({
    where: {
      id: campaignId,
    },
  })

  if (!existingCampaign) {
    const error = new Error('Campaign not found.')
    error.statusCode = 404
    throw error
  }

  return prisma.campaign.delete({
    where: {
      id: campaignId,
    },
  })
}

export async function getActiveCampaignsForCart(
  cartItems = [],
) {
  const itemProductIds = cartItems
    .map((item) =>
      String(item.id || item.productId || '').trim(),
    )
    .filter(Boolean)

  const campaigns = await prisma.campaign.findMany({
    where: {
      status: 'ACTIVE',
    },
  })

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

  return activeCampaigns.map((campaign) => {
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
  })
}

export async function recordCampaignDonationUsage({
  campaignId,
  subtotal,
}) {
  const campaign = await prisma.campaign.findUnique({
    where: {
      id: campaignId,
    },
  })

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

  return prisma.campaign.update({
    where: {
      id: campaignId,
    },

    data: {
      orderCount: {
        increment: 1,
      },

      revenueGenerated: {
        increment: normalizedSubtotal,
      },

      donationGenerated: {
        increment: donationAmount,
      },
    },
  })
}
