import { prisma } from '../../../db/prisma.js'

export async function findEmailDeliveryByDedupeKey(dedupeKey) {
  if (!dedupeKey) {
    return null
  }

  return prisma.emailDelivery.findUnique({
    where: {
      dedupeKey,
    },
  })
}

export async function createEmailDelivery(delivery) {
  return prisma.emailDelivery.create({
    data: {
      dedupeKey: delivery.dedupeKey,
      event: delivery.event,
      recipient: delivery.recipient,
      subject: delivery.subject,
      provider: delivery.provider,
      status: delivery.status,
      providerId: delivery.providerId || null,
      orderId: delivery.orderId || null,
      userId: delivery.userId || null,
      errorMessage: delivery.errorMessage || null,
      metadata: delivery.metadata || null,
      sentAt: delivery.sentAt || null,
    },
  })
}

export async function updateEmailDeliveryById(
  id,
  data,
) {
  return prisma.emailDelivery.update({
    where: {
      id,
    },
    data,
  })
}

export async function findRecentEmailDeliveries({
  limit = 25,
  orderId = null,
  userId = null,
  recipient = null,
  event = null,
  status = null,
} = {}) {
  return prisma.emailDelivery.findMany({
    where: {
      ...(orderId ? { orderId } : {}),
      ...(userId ? { userId } : {}),
      ...(recipient ? { recipient: { contains: recipient } } : {}),
      ...(event ? { event } : {}),
      ...(status ? { status } : {}),
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: limit,
  })
}

export async function getEmailDeliveryStats({
  event = null,
  status = null,
  limit = 25,
} = {}) {
  const where = {
    ...(event ? { event } : {}),
    ...(status ? { status } : {}),
  }

  const [total, sent, failed, mocked, pending, skipped, recent] =
    await Promise.all([
      prisma.emailDelivery.count({ where }),
      prisma.emailDelivery.count({ where: { ...where, status: 'SENT' } }),
      prisma.emailDelivery.count({ where: { ...where, status: 'FAILED' } }),
      prisma.emailDelivery.count({ where: { ...where, status: 'MOCKED' } }),
      prisma.emailDelivery.count({ where: { ...where, status: 'PENDING' } }),
      prisma.emailDelivery.count({ where: { ...where, status: 'SKIPPED' } }),
      findRecentEmailDeliveries({
        limit,
        event,
        status,
      }),
    ])

  return {
    total,
    sent,
    failed,
    mocked,
    pending,
    skipped,
    recent,
  }
}
