export function mapPromoAnalytics({
  promo,
  usageHistory,
  usageSummary,
}) {
  const totalUses = Number(
    usageSummary?._count?.id || 0,
  )

  const totalRevenue = Number(
    usageSummary?._sum?.subtotalAmount || 0,
  )

  const totalDiscountGiven = Number(
    usageSummary?._sum?.discountAmount || 0,
  )

  const averageOrderValue = Number(
    usageSummary?._avg?.subtotalAmount || 0,
  )

  return {
    promo,

    summary: {
      totalUses,
      totalRevenue,
      totalDiscountGiven,
      averageOrderValue,
    },

    usages: usageHistory.map((usage) => ({
      id: usage.id,
      orderId: usage.orderId,
      customerEmail: usage.customerEmail,
      subtotalAmount: Number(
        usage.subtotalAmount || 0,
      ),
      discountAmount: Number(
        usage.discountAmount || 0,
      ),
      redeemedAt: usage.redeemedAt,
      createdAt: usage.redeemedAt,
    })),
  }
}

export function buildPromoMutationData(promo) {
  return {
    code: promo.code,
    name: promo.name,

    type: promo.type,
    status: promo.status,

    discountType: promo.discountType,
    discountValue: promo.discountValue,

    minimumSubtotal: promo.minimumSubtotal,
    usageLimitTotal: promo.usageLimitTotal,
    usageLimitPerCustomer: promo.usageLimitPerCustomer,

    assignedCustomerEmail: promo.assignedCustomerEmail,
    referralOwnerName: promo.referralOwnerName,

    usedCount: promo.usedCount,
    revenueGenerated: promo.revenueGenerated,
    discountGiven: promo.discountGiven,

    startsAt: promo.startsAt,
    endsAt: promo.endsAt,
  }
}
