

import express from 'express'

import {
  getAdminOrderById,
  getAdminOrders,
  getAdminOrderStats,
} from '../controllers/orders.controller.js'

const router = express.Router()

router.get('/', getAdminOrders)
router.get('/:orderId', getAdminOrderById)
router.get('/stats', getAdminOrderStats)

export default router