import { prisma } from '../../../db/prisma.js'

export const RECEIPT_SETTINGS_ID = 'checkout-payment-receipt'

export function findReceiptSettings() {
  return prisma.checkoutReceiptSettings.findUnique({
    where: { id: RECEIPT_SETTINGS_ID },
    include: { template: true },
  })
}

export async function saveReceiptSettings({ mode, templateId, revision }, actor) {
  return prisma.$transaction(async tx => {
    if (mode !== 'DISABLED') {
      const template = await tx.emailTemplate.findFirst({
        where: { id: templateId, archived: false, event: 'ORDER_CONFIRMATION' },
      })
      if (!template) throw Object.assign(new Error('Choose a saved, active payment-confirmation template.'), { statusCode: 400 })
    }
    const data = { mode, templateId, updatedBy: actor }
    if (revision === 0) {
      try {
        return await tx.checkoutReceiptSettings.create({ data: { id: RECEIPT_SETTINGS_ID, ...data } })
      } catch (error) {
        if (error.code !== 'P2002') throw error
        throw Object.assign(new Error('Receipt settings changed. Reload before saving.'), { statusCode: 409 })
      }
    }
    const result = await tx.checkoutReceiptSettings.updateMany({
      where: { id: RECEIPT_SETTINGS_ID, revision },
      data: { ...data, revision: { increment: 1 } },
    })
    if (!result.count) throw Object.assign(new Error('Receipt settings changed. Reload before saving.'), { statusCode: 409 })
    return tx.checkoutReceiptSettings.findUnique({ where: { id: RECEIPT_SETTINGS_ID } })
  })
}

export function findQueuedReceipts({ includeLive = false, limit = 5 } = {}) {
  return prisma.emailDelivery.findMany({
    where: { automatic: true, event: 'ORDER_CONFIRMATION', status: 'QUEUED', provider: { in: includeLive ? ['MOCK', 'RESEND'] : ['MOCK'] } },
    orderBy: { createdAt: 'asc' },
    take: limit,
  })
}

export async function claimQueuedReceipt(id) {
  const result = await prisma.emailDelivery.updateMany({
    where: { id, automatic: true, event: 'ORDER_CONFIRMATION', status: 'QUEUED' },
    data: { status: 'PENDING' },
  })
  return result.count === 1
}
