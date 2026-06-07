export function mapOrderItem(orderItem) {
  return {
    id: orderItem.id,
    productId: orderItem.productId,
    productName: orderItem.productName,
    productImage: orderItem.productImage,
    size: orderItem.size,
    sku: orderItem.sku,
    quantity: Number(orderItem.quantity || 0),
    unitPrice: Number(orderItem.unitPrice || 0),
    lineTotal: Number(orderItem.lineTotal || 0),
  }
}

export function mapOrderCampaignUsage(usage) {
  if (!usage) {
    return null
  }

  return {
    id: usage.id,
    orderId: usage.orderId,
    campaignId: usage.campaignId,
    campaignName: usage.campaign?.name || null,
    donationTarget: usage.campaign?.donationTarget || null,
    donationAmount: Number(usage.donationAmount || 0),
    eligibleSubtotal: Number(usage.eligibleSubtotal || 0),
    matchedProductIds: Array.isArray(usage.matchedProductIds)
      ? usage.matchedProductIds
      : [],
    createdAt: usage.createdAt,
    updatedAt: usage.updatedAt,
  }
}

export function mapOrderPromoUsage(usage) {
  if (!usage) {
    return null
  }

  return {
    id: usage.id,
    promoId: usage.promoId,
    promoCode: usage.promo?.code || null,
    promoName: usage.promo?.name || null,
    customerEmail: usage.customerEmail,
    discountAmount: Number(usage.discountAmount || 0),
    subtotalAmount: Number(usage.subtotalAmount || 0),
    redeemedAt: usage.redeemedAt,
  }
}

export function mapOrderStatusHistoryEntry(entry) {
  if (!entry) {
    return null
  }

  return {
    id: entry.id,
    orderId: entry.orderId,
    fromStatus: entry.fromStatus,
    toStatus: entry.toStatus,
    note: entry.note,
    changedByType: entry.changedByType,
    changedBy: entry.changedBy,
    createdAt: entry.createdAt,
  }
}

export function getOrderDonationAmount(order) {
  return Array.isArray(order?.campaignUsages)
    ? order.campaignUsages.reduce(
        (total, usage) => total + Number(usage.donationAmount || 0),
        0,
      )
    : 0
}

export function getCustomerOrderReference(order) {
  if (!order) {
    return null
  }

  if (order.orderNumber) {
    return order.orderNumber
  }

  return String(order.id || '').slice(-8).toUpperCase()
}

export function mapOrder(order) {
  if (!order) {
    return null
  }

  return {
    ...order,
    total: Number(order.total || 0),
    subtotal: Number(order.subtotal || 0),
    shippingAmount: Number(order.shippingAmount || 0),
    discountAmount: Number(order.discountAmount || 0),
    taxAmount: Number(order.taxAmount || 0),
    donationAmount: getOrderDonationAmount(order),
    customerReference: getCustomerOrderReference(order),
    promoUsage: mapOrderPromoUsage(order.promoUsage),
    statusHistory: Array.isArray(order.statusHistory)
      ? order.statusHistory
          .map(mapOrderStatusHistoryEntry)
          .filter(Boolean)
      : [],
    lastStatusChange: Array.isArray(order.statusHistory)
      ? mapOrderStatusHistoryEntry(order.statusHistory[0])
      : null,
    campaignAttributions: Array.isArray(order.campaignUsages)
      ? order.campaignUsages
          .map(mapOrderCampaignUsage)
          .filter(Boolean)
      : [],
    items: Array.isArray(order.items)
      ? order.items.map(mapOrderItem)
      : [],
  }
}

export function mapCustomerOrder(order) {
  const mappedOrder = mapOrder(order)

  if (!mappedOrder) {
    return null
  }

  return {
    orderNumber: mappedOrder.orderNumber,
    customerReference: mappedOrder.customerReference,
    customerName: mappedOrder.customerName,
    customerEmail: mappedOrder.customerEmail,
    status: mappedOrder.status,
    total: mappedOrder.total,
    subtotal: mappedOrder.subtotal,
    shippingAmount: mappedOrder.shippingAmount,
    discountAmount: mappedOrder.discountAmount,
    taxAmount: mappedOrder.taxAmount,
    donationAmount: mappedOrder.donationAmount,
    currency: mappedOrder.currency,
    createdAt: mappedOrder.createdAt,
    updatedAt: mappedOrder.updatedAt,
    items: mappedOrder.items,
    campaignAttributions: mappedOrder.campaignAttributions,
  }
}
