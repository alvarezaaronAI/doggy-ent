import { prisma } from '../../../db/prisma.js'

export async function runPromoTransaction(callback) {
  return prisma.$transaction(callback)
}

export async function getAllPromos() {
  return prisma.promo.findMany({
    where: {
      status: {
        not: 'ARCHIVED',
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })
}

export async function getPromoById(promoId) {
  return prisma.promo.findUnique({
    where: {
      id: promoId,
    },
  })
}

export async function getPromoByCode(code) {
  return prisma.promo.findFirst({
    where: {
      code,
      status: {
        not: 'ARCHIVED',
      },
    },
  })
}

export async function getActivePromoByCode(code) {
  return prisma.promo.findFirst({
    where: {
      code,
      status: 'ACTIVE',
    },
  })
}

export async function activateScheduledPromos(currentDate) {
  return prisma.promo.updateMany({
    where: {
      status: 'DRAFT',
      startsAt: {
        lte: currentDate,
      },
    },
    data: {
      status: 'ACTIVE',
    },
  })
}

export async function expireEndedPromos(currentDate) {
  return prisma.promo.updateMany({
    where: {
      status: 'ACTIVE',
      endsAt: {
        lte: currentDate,
      },
    },
    data: {
      status: 'EXPIRED',
    },
  })
}

export async function createPromo(data) {
  return prisma.promo.create({
    data,
  })
}

export async function updatePromoById(promoId, data) {
  return prisma.promo.update({
    where: {
      id: promoId,
    },
    data,
  })
}

export async function deletePromoById(promoId) {
  return prisma.promo.update({
    where: {
      id: promoId,
    },
    data: {
      status: 'ARCHIVED',
    },
  })
}

export async function createPromoUsage(data) {
  return prisma.promoUsage.create({
    data,
  })
}

export async function createPromoUsageTx(tx, data) {
  return tx.promoUsage.create({
    data,
  })
}

export async function incrementPromoUsageStats(
  promoId,
  subtotalAmount,
  discountAmount,
) {
  return prisma.promo.update({
    where: {
      id: promoId,
    },
    data: {
      usedCount: {
        increment: 1,
      },
      revenueGenerated: {
        increment: subtotalAmount,
      },
      discountGiven: {
        increment: discountAmount,
      },
    },
  })
}

export async function incrementPromoUsageStatsTx(
  tx,
  promoId,
  subtotalAmount,
  discountAmount,
) {
  return tx.promo.update({
    where: {
      id: promoId,
    },
    data: {
      usedCount: {
        increment: 1,
      },
      revenueGenerated: {
        increment: subtotalAmount,
      },
      discountGiven: {
        increment: discountAmount,
      },
    },
  })
}

export async function getPromoUsageCountByCustomer(
  promoId,
  customerEmail,
) {
  return prisma.promoUsage.count({
    where: {
      promoId,
      customerEmail,
    },
  })
}

export async function getPromoUsageCount(promoId) {
  return prisma.promoUsage.count({
    where: {
      promoId,
    },
  })
}

export async function getPromoUsageHistory(promoId) {
  return prisma.promoUsage.findMany({
    where: {
      promoId,
    },
    orderBy: {
      createdAt: 'desc',
    },
  })
}

export async function getPromoUsageSummary(promoId) {
  return prisma.promoUsage.aggregate({
    where: {
      promoId,
    },
    _count: {
      id: true,
    },
    _sum: {
      subtotalAmount: true,
      discountAmount: true,
    },
    _avg: {
      subtotalAmount: true,
    },
  })
}

export async function getPromoUsageByOrderId(orderId) {
  return prisma.promoUsage.findFirst({
    where: {
      orderId,
    },
  })
}

export async function getPromoUsageByOrderIdTx(tx, orderId) {
  return tx.promoUsage.findFirst({
    where: {
      orderId,
    },
  })
}
