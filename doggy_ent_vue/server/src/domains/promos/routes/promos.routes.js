

import {
  getAllPromosController,
  getPromoAnalyticsController,
} from '../controllers/promos.controller.js'

export default async function promoRoutes(
  fastify,
) {
  fastify.get(
    '/admin/promos',
    getAllPromosController,
  )

  fastify.get(
    '/admin/promos/:promoId/analytics',
    getPromoAnalyticsController,
  )
}