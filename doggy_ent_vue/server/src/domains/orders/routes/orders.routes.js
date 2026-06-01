import express from 'express'

import {
  getAdminOrderById,
  getAdminOrders,
  getAdminOrderStats,
} from '../controllers/orders.controller.js'

const router = express.Router()

router.get('/', getAdminOrders)
router.get('/stats', getAdminOrderStats)
router.get('/:orderId', getAdminOrderById)

export default router