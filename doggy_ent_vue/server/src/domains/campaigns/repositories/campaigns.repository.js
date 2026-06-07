import { prisma } from '../../../db/prisma.js'
import {
  CAMPAIGN_STATUS,
} from '../constants/campaigns.constants.js'

export async function findAllCampaigns() {
  return prisma.campaign.findMany({
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      orderUsages: {
        orderBy: {
          createdAt: 'desc',
        },
        take: 5,
        include: {
          order: true,
        },
      },
    },
  })
}

export async function findCampaignById(campaignId) {
  return prisma.campaign.findUnique({
    where: {
      id: campaignId,
    },
  })
}

export async function findCampaignBySlug(slug) {
  return prisma.campaign.findUnique({
    where: {
      slug,
    },
  })
}

export async function findActiveCampaigns() {
  return prisma.campaign.findMany({
    where: {
      status: CAMPAIGN_STATUS.ACTIVE,
    },
  })
}

export async function createCampaignRecord(data) {
  return prisma.campaign.create({
    data,
  })
}

export async function updateCampaignRecord(campaignId, data) {
  return prisma.campaign.update({
    where: {
      id: campaignId,
    },

    data,
  })
}

export async function deleteCampaignRecord(campaignId) {
  return prisma.campaign.delete({
    where: {
      id: campaignId,
    },
  })
}

export async function incrementCampaignUsageStats({
  campaignId,
  subtotal,
  donationAmount,
}) {
  return prisma.campaign.update({
    where: {
      id: campaignId,
    },

    data: {
      orderCount: {
        increment: 1,
      },

      revenueGenerated: {
        increment: subtotal,
      },

      donationGenerated: {
        increment: donationAmount,
      },
    },
  })
}

export async function recordOrderCampaignUsage({
  campaignId,
  orderId,
  eligibleSubtotal,
  donationAmount,
  matchedProductIds = [],
}) {
  return prisma.$transaction(async (tx) => {
    const existingUsage =
      await tx.orderCampaignUsage.findUnique({
        where: {
          orderId_campaignId: {
            orderId,
            campaignId,
          },
        },
        include: {
          campaign: true,
        },
      })

    if (existingUsage) {
      return existingUsage
    }

    const usage = await tx.orderCampaignUsage.create({
      data: {
        orderId,
        campaignId,
        eligibleSubtotal,
        donationAmount,
        matchedProductIds,
      },
      include: {
        campaign: true,
      },
    })

    await tx.campaign.update({
      where: {
        id: campaignId,
      },

      data: {
        orderCount: {
          increment: 1,
        },

        revenueGenerated: {
          increment: eligibleSubtotal,
        },

        donationGenerated: {
          increment: donationAmount,
        },
      },
    })

    return usage
  })
}
