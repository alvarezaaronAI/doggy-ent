export function mapEmailDelivery(delivery) {
  if (!delivery) {
    return null
  }

  return {
    id: delivery.id,
    event: delivery.event,
    recipient: delivery.recipient,
    subject: delivery.subject,
    provider: delivery.provider,
    status: delivery.status,
    orderId: delivery.orderId,
    userId: delivery.userId,
    errorMessage: delivery.errorMessage,
    sentAt: delivery.sentAt,
    createdAt: delivery.createdAt,
    updatedAt: delivery.updatedAt,
  }
}

export function mapEmailDeliveryStats(stats) {
  return {
    total: Number(stats?.total || 0),
    sent: Number(stats?.sent || 0),
    failed: Number(stats?.failed || 0),
    mocked: Number(stats?.mocked || 0),
    pending: Number(stats?.pending || 0),
    skipped: Number(stats?.skipped || 0),
    recent: Array.isArray(stats?.recent)
      ? stats.recent.map(mapEmailDelivery).filter(Boolean)
      : [],
  }
}
