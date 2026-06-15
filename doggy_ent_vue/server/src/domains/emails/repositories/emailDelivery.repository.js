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
