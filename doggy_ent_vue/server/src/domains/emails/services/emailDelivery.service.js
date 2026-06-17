import {
  findRecentEmailDeliveries,
  getEmailDeliveryStats,
} from '../repositories/emailDelivery.repository.js'
import {
  mapEmailDelivery,
  mapEmailDeliveryStats,
} from '../mappers/emailDelivery.mapper.js'

export async function fetchAdminEmailDeliveries({
  event = null,
  status = null,
  limit = 50,
} = {}) {
  const stats = await getEmailDeliveryStats({
    event: event ? String(event).trim() : null,
    status: status ? String(status).trim().toUpperCase() : null,
    limit: Math.min(Math.max(Number(limit) || 50, 1), 100),
  })

  return mapEmailDeliveryStats(stats)
}

export async function fetchCustomerEmailDeliveries(user) {
  const deliveries = await findRecentEmailDeliveries({
    limit: 20,
    userId: user.id,
  })

  return deliveries.map(mapEmailDelivery).filter(Boolean)
}
