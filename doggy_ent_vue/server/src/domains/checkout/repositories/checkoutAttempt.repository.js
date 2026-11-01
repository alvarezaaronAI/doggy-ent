import { randomUUID } from 'node:crypto'
import { prisma } from '../../../db/prisma.js'

export const findAttempt = id => prisma.checkoutAttempt.findUnique({ where: { id } })
export const findPromoAgreement = code => prisma.promo.findUnique({
  where: { code }, select: { id: true, code: true, name: true, discountType: true, discountValue: true, usageLimitTotal: true, usageLimitPerCustomer: true },
})
export async function insertAttempt(data) {
  try { return await prisma.checkoutAttempt.create({ data }) }
  catch (error) {
    if (error.code !== 'P2002') throw error
    const existing = await findAttempt(data.id)
    if (!existing) throw error
    return existing
  }
}
export async function claimAttempt(id, now = new Date()) {
  const leaseToken = randomUUID()
  const claimed = await prisma.checkoutAttempt.updateMany({
    where: { id, OR: [{ leaseUntil: null }, { leaseUntil: { lt: now } }] },
    data: { leaseToken, leaseUntil: new Date(now.getTime() + 60000) },
  })
  return claimed.count ? leaseToken : null
}
export async function updateClaimedAttempt(id, leaseToken, data) {
  return prisma.checkoutAttempt.updateMany({ where: { id, leaseToken, leaseUntil: { gt: new Date() } }, data })
}
export const releaseAttempt = (id, leaseToken) => prisma.checkoutAttempt.updateMany({ where: { id, leaseToken }, data: { leaseToken: null, leaseUntil: null } })
export const listRecoverableAttempts = (now = new Date()) => prisma.checkoutAttempt.findMany({
  where: { paymentIntentId: { not: null }, status: { in: ['PREPARED', 'OPEN', 'PROCESSING', 'PAID_PENDING_ORDER', 'EXPIRED'] }, nextRetryAt: { lte: now } },
  orderBy: { nextRetryAt: 'asc' }, take: 20, select: { id: true },
})
export async function saveVerifiedEvent(data) {
  try { await prisma.stripePaymentEvent.create({ data }) }
  catch (error) { if (error.code !== 'P2002') throw error }
}
export const listPendingEvents = () => prisma.stripePaymentEvent.findMany({ where: { status: 'PENDING', attempt: { nextRetryAt: { lte: new Date() } } }, orderBy: { receivedAt: 'asc' }, take: 20 })
export const finishEvents = (attemptId, status = 'PROCESSED') => prisma.stripePaymentEvent.updateMany({
  where: { attemptId, status: 'PENDING' }, data: { status, processedAt: new Date() },
})
export const ignoreEvent = id => prisma.stripePaymentEvent.update({ where: { id }, data: { status: 'IGNORED', processedAt: new Date() } })
export const listRecoveryCases = () => prisma.checkoutAttempt.findMany({
  where: { OR: [{ status: 'PAID_REVIEW' }, { status: 'PAID_PENDING_ORDER' }, { retryCount: { gte: 3 }, status: { notIn: ['COMPLETED', 'CANCELED'] } }] },
  orderBy: { updatedAt: 'desc' }, take: 50,
  select: { id: true, status: true, amountCents: true, currency: true, paymentMode: true, paymentIntentId: true, stripeAccountId: true, orderId: true, lastErrorCode: true, retryCount: true, paidAt: true, createdAt: true, updatedAt: true },
})
