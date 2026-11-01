import { randomBytes } from 'node:crypto'
import { isDeepStrictEqual } from 'node:util'
import { prisma } from '../../../db/prisma.js'
import { validateTaxSnapshot } from '../../../shared/utils/taxSnapshot.js'
import { prepareCheckoutReceipt } from '../../emails/services/checkoutReceipt.service.js'
import { createOrderTx } from '../../orders/repositories/orders.repository.js'
import { mapOrder } from '../../orders/mappers/orders.mapper.js'

const orderInclude = {
  items: true,
  campaignUsages: { include: { campaign: true } },
  emailDeliveries: true,
  shipments: { include: { events: true } },
}
const failure = (code, message, statusCode = 409) => Object.assign(new Error(message), { code, statusCode })
const invalidSnapshot = () => failure('CHECKOUT_SNAPSHOT_INVALID', 'The saved checkout needs payment review. Do not pay again.')
const text = value => typeof value === 'string' && value.trim().length > 0

function cents(value) {
  const rounded = Math.round(value * 100)
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0
    || !Number.isSafeInteger(rounded) || Math.abs(value * 100 - rounded) > 0.000001) throw invalidSnapshot()
  return rounded
}

function assertPayment(attempt, paymentIntentId) {
  if (!attempt) throw failure('CHECKOUT_ATTEMPT_NOT_FOUND', 'The saved checkout is unavailable.', 404)
  if (!text(paymentIntentId) || attempt.paymentIntentId !== paymentIntentId) {
    throw failure('CHECKOUT_PAYMENT_MISMATCH', 'The payment does not match this saved checkout.')
  }
}

function assertLease(attempt, leaseToken) {
  const leaseUntil = new Date(attempt.leaseUntil).getTime()
  if (!text(leaseToken) || attempt.leaseToken !== leaseToken || !attempt.leaseUntil
    || !Number.isFinite(leaseUntil) || leaseUntil <= Date.now()) {
    throw failure('CHECKOUT_LEASE_LOST', 'Checkout recovery is already being handled. Try again shortly.', 503)
  }
}

function buildFrozenOrder(attempt) {
  const snapshot = attempt.snapshot
  const customer = snapshot?.customer
  const preview = snapshot?.preview
  const pricing = preview?.pricing
  if (snapshot?.version !== 1 || !customer || !pricing || !Array.isArray(snapshot.items)
    || snapshot.items.length < 1 || snapshot.items.length > 100 || !Array.isArray(preview.campaigns)
    || !text(customer.email) || !customer.email.includes('@')
    || !text(`${customer.firstName || ''} ${customer.lastName || ''}`)
    || (attempt.userId != null && !text(attempt.userId))
    || !/^[a-z]{3}$/.test(attempt.currency || '') || !Number.isSafeInteger(attempt.amountCents)) throw invalidSnapshot()

  const items = snapshot.items.map(item => {
    if (!item || !['productId', 'variantId', 'sku', 'size', 'name'].every(key => text(item[key]))
      || !Number.isSafeInteger(item.quantity) || item.quantity < 1 || item.quantity > 999
      || !Number.isSafeInteger(cents(item.price) * item.quantity)) throw invalidSnapshot()
    return {
      productId: item.productId, variantId: item.variantId, sku: item.sku, size: item.size,
      productName: item.name, productImage: item.image || null,
      quantity: item.quantity, unitPrice: item.price, lineTotal: cents(item.price) * item.quantity / 100,
    }
  })
  const subtotal = cents(pricing.subtotal)
  const discount = cents(pricing.discountAmount)
  const total = cents(pricing.total)
  if (items.reduce((sum, item) => sum + cents(item.lineTotal), 0) !== subtotal || discount > subtotal
    || subtotal - discount + cents(pricing.shippingAmount) + cents(pricing.taxAmount) !== total
    || total !== attempt.amountCents) throw invalidSnapshot()

  const email = customer.email.trim().toLowerCase()
  const promo = preview.promo
  const agreement = snapshot.promoAgreement
  const validLimit = value => value === null || Number.isSafeInteger(value) && value >= 0
  if (promo && (promo.valid !== true || !agreement || !text(agreement.promoId) || !text(agreement.code)
    || agreement.code !== promo.code || !validLimit(agreement.usageLimitTotal)
    || !validLimit(agreement.usageLimitPerCustomer) || cents(promo.discountAmount) !== discount)) throw invalidSnapshot()
  if (!promo && (discount !== 0 || agreement != null)) throw invalidSnapshot()
  const campaignIds = new Set()
  const campaigns = preview.campaigns.map(campaign => {
    if (!campaign || !['campaignId', 'campaignName', 'donationTarget'].every(key => text(campaign[key]))
      || campaignIds.has(campaign.campaignId) || !['FIXED', 'PERCENT'].includes(campaign.donationType)
      || !Number.isFinite(campaign.donationValue) || campaign.donationValue < 0
      || !Array.isArray(campaign.matchedProductIds) || !campaign.matchedProductIds.length
      || campaign.matchedProductIds.some(id => !text(id) || !items.some(item => item.productId === id))) throw invalidSnapshot()
    campaignIds.add(campaign.campaignId)
    const matchedProductIds = [...new Set(campaign.matchedProductIds)]
    const matchedCents = items.filter(item => matchedProductIds.includes(item.productId)).reduce((sum, item) => sum + cents(item.lineTotal), 0)
    if (cents(campaign.matchedSubtotal) !== matchedCents) throw invalidSnapshot()
    cents(campaign.donationAmount)
    return {
      campaignId: campaign.campaignId, campaignName: campaign.campaignName,
      donationTarget: campaign.donationTarget, donationType: campaign.donationType,
      donationValue: campaign.donationValue, eligibleSubtotal: campaign.matchedSubtotal,
      donationAmount: campaign.donationAmount, matchedProductIds,
    }
  })
  const taxSnapshot = preview.taxSnapshot ? validateTaxSnapshot(preview.taxSnapshot) : null
  if (taxSnapshot && cents(taxSnapshot.taxAmount) !== cents(pricing.taxAmount)) throw invalidSnapshot()
  const shipping = preview.shipping || {}
  const attributionSnapshot = {
    version: 1,
    promo: promo ? {
      promoId: agreement.promoId, promoCode: agreement.code, promoName: agreement.name || agreement.code,
      customerEmail: email, discountAmount: promo.discountAmount, subtotalAmount: pricing.subtotal,
      usageLimitTotal: agreement.usageLimitTotal, usageLimitPerCustomer: agreement.usageLimitPerCustomer,
    } : null,
    campaigns,
  }
  return {
    orderNumber: `DGE-${Date.now()}-${randomBytes(6).toString('hex').toUpperCase()}`,
    userId: attempt.userId || null,
    customerName: `${customer.firstName || ''} ${customer.lastName || ''}`.trim(),
    customerEmail: email, customerPhone: customer.phone || null,
    deliveryNotes: customer.deliveryNotes || null,
    address1: customer.address1 || null, address2: customer.address2 || null,
    city: customer.city || null, state: customer.state || null, zip: customer.zip || null,
    country: customer.country || null,
    marketingOptIn: customer.marketingOptIn === true, saveInfo: customer.saveInfo === true,
    status: 'PAID', currency: attempt.currency, stripePaymentIntentId: attempt.paymentIntentId,
    subtotal: pricing.subtotal, total: pricing.total, discountAmount: pricing.discountAmount,
    shippingAmount: pricing.shippingAmount, taxAmount: pricing.taxAmount, taxSnapshot,
    shippingMethod: shipping.method || null, shippingCarrier: shipping.carrier || null,
    shippingService: shipping.service || null, shippingRateId: shipping.rateId || null,
    shippingRateProvider: shipping.provider || null,
    items, attributionSnapshot,
    donationAmount: campaigns.reduce((sum, campaign) => sum + cents(campaign.donationAmount), 0) / 100,
    campaignAttributions: campaigns,
  }
}

async function recordAttributionTx(tx, order, attribution) {
  if (attribution.promo) {
    const frozen = attribution.promo
    const promo = await tx.promo.findUnique({ where: { id: frozen.promoId } })
    if (!promo) throw failure('CHECKOUT_PROMO_UNAVAILABLE', 'The saved promo needs payment review. Do not pay again.')
    const totalCount = await tx.promoUsage.count({ where: { promoId: promo.id } })
    const customerCount = await tx.promoUsage.count({ where: { promoId: promo.id, customerEmail: frozen.customerEmail } })
    const usedCount = Math.max(totalCount, promo.usedCount)
    if ((frozen.usageLimitTotal != null && usedCount >= frozen.usageLimitTotal)
      || (frozen.usageLimitPerCustomer != null && customerCount >= frozen.usageLimitPerCustomer)) {
      throw failure('CHECKOUT_PROMO_LIMIT', 'The saved promo needs payment review. Do not pay again.')
    }
    await tx.promoUsage.create({ data: {
      promoId: promo.id, orderId: order.id, customerEmail: frozen.customerEmail,
      discountAmount: frozen.discountAmount, subtotalAmount: frozen.subtotalAmount,
    } })
    await tx.promo.update({ where: { id: promo.id }, data: {
      usedCount: { increment: 1 }, revenueGenerated: { increment: frozen.subtotalAmount },
      discountGiven: { increment: frozen.discountAmount },
    } })
  }
  for (const frozen of [...attribution.campaigns].sort((a, b) => a.campaignId.localeCompare(b.campaignId))) {
    const campaign = await tx.campaign.findUnique({ where: { id: frozen.campaignId } })
    if (!campaign) throw failure('CHECKOUT_CAMPAIGN_UNAVAILABLE', 'The saved giving attribution needs payment review. Do not pay again.')
    await tx.orderCampaignUsage.create({ data: {
      campaignId: frozen.campaignId, orderId: order.id, eligibleSubtotal: frozen.eligibleSubtotal,
      donationAmount: frozen.donationAmount, matchedProductIds: frozen.matchedProductIds,
    } })
    await tx.campaign.update({ where: { id: frozen.campaignId }, data: {
      orderCount: { increment: 1 }, revenueGenerated: { increment: frozen.eligibleSubtotal },
      donationGenerated: { increment: frozen.donationAmount },
    } })
  }
}

// Caller owns verified provider evidence and recovery/review state after rollback.
export async function finalizeCheckoutAttempt(attemptId, { paymentIntentId, leaseToken } = {}) {
  const preparedAttempt = await prisma.checkoutAttempt.findUnique({ where: { id: attemptId } })
  let orderInput, preparationError
  try {
    assertPayment(preparedAttempt, paymentIntentId)
    if (preparedAttempt.status !== 'COMPLETED') {
      assertLease(preparedAttempt, leaseToken)
      try { orderInput = buildFrozenOrder(preparedAttempt) }
      catch { throw invalidSnapshot() }
      try { orderInput.receiptDelivery = await prepareCheckoutReceipt(orderInput) }
      catch { throw failure('CHECKOUT_RECEIPT_PREPARATION_FAILED', 'Payment is received; the saved receipt needs recovery. Do not pay again.', 503) }
    }
  }
  catch (error) { preparationError = error }

  for (let retry = 0; retry < 3; retry++) {
    try {
      return await prisma.$transaction(async tx => {
        const attempt = await tx.checkoutAttempt.findUnique({ where: { id: attemptId } })
        assertPayment(attempt, paymentIntentId)
        if (attempt.status === 'COMPLETED') {
          const saved = attempt.orderId ? await tx.order.findUnique({ where: { id: attempt.orderId }, include: orderInclude }) : null
          if (!saved || saved.stripePaymentIntentId !== paymentIntentId) throw failure('CHECKOUT_ORDER_CONFLICT', 'The saved order needs payment review. Do not pay again.')
          return mapOrder(saved)
        }
        assertLease(attempt, leaseToken)
        if (attempt.status !== 'PAID_PENDING_ORDER' || !attempt.paidAt) {
          throw failure('CHECKOUT_PAYMENT_NOT_READY', 'The saved payment is still being checked. Do not pay again.', 503)
        }
        if (preparationError) throw preparationError
        if (!orderInput || !isDeepStrictEqual(attempt.snapshot, preparedAttempt.snapshot)
          || ['inputHash', 'amountCents', 'currency', 'paymentMode', 'stripeAccountId'].some(key => attempt[key] !== preparedAttempt[key])) throw invalidSnapshot()
        if (attempt.userId !== preparedAttempt.userId) throw failure('CHECKOUT_FINALIZATION_BUSY', 'The saved checkout changed. Try recovery again; do not pay again.', 503)
        if (attempt.orderId || await tx.order.findUnique({ where: { stripePaymentIntentId: paymentIntentId } })) {
          throw failure('CHECKOUT_ORDER_CONFLICT', 'The payment already has an order that needs review. Do not pay again.')
        }
        // Claim the attempt before touching shared stock or promo capacity.
        const now = new Date()
        const claimed = await tx.checkoutAttempt.updateMany({
          where: { id: attemptId, paymentIntentId, leaseToken, leaseUntil: { gt: now }, status: { not: 'COMPLETED' }, orderId: null },
          data: { updatedAt: now },
        })
        if (claimed.count !== 1) throw failure('CHECKOUT_LEASE_LOST', 'Checkout recovery is already being handled. Try again shortly.', 503)
        const order = await createOrderTx(tx, orderInput)
        await recordAttributionTx(tx, order, orderInput.attributionSnapshot)
        await tx.checkoutAttempt.update({ where: { id: attemptId }, data: {
          status: 'COMPLETED', orderId: order.id, paidAt: attempt.paidAt || now, completedAt: new Date(),
          leaseToken: null, leaseUntil: null, lastErrorCode: null,
        } })
        return mapOrder(await tx.order.findUnique({ where: { id: order.id }, include: orderInclude }))
      }, { isolationLevel: 'Serializable' })
    }
    catch (error) {
      if (!['P2034', 'P2002'].includes(error.code)) throw error
      if (retry === 2) throw failure('CHECKOUT_FINALIZATION_BUSY', 'Payment recovery is busy. Try again shortly; do not pay again.', 503)
    }
  }
}
