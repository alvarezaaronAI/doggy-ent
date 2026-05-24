
import {
  getAllPromos as getAllPromosService,
  getPromoAnalytics,
} from '../services/promos.service.js'

export async function getAllPromosController(
  request,
  reply,
) {
  try {
    const promos = await getAllPromosService()

    return reply.send(promos)
  }
  catch (error) {
    request.log.error(error)

    return reply.status(500).send({
      message: 'Unable to load promos.',
    })
  }
}

export async function getPromoAnalyticsController(
  request,
  reply,
) {
  try {
    const analytics = await getPromoAnalytics(
      request.params.promoId,
    )

    return reply.send(analytics)
  }
  catch (error) {
    request.log.error(error)

    const statusCode = error.statusCode || 500

    return reply.status(statusCode).send({
      message: error.message || 'Unable to load promo analytics.',
    })
  }
}
