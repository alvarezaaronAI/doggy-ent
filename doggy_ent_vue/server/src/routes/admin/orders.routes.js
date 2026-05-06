

import express from 'express'

import {
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  updatePaymentStatus,
  updateFulfillmentStatus,
  getOrderStats,
} from '../../services/admin/orders.service.js'
import { requireAdminAuth } from '../../middleware/auth/requireAdminAuth.js'

const router = express.Router()
router.use(requireAdminAuth)

router.get('/', async (req, res) => {
  try {
    const orders = await getAllOrders()
    return res.json({ success: true, orders })
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch orders.' })
  }
})

router.get('/stats', async (req, res) => {
  try {
    const stats = await getOrderStats()
    return res.json({ success: true, stats })
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch stats.' })
  }
})

router.get('/:orderId', async (req, res) => {
  try {
    const order = await getOrderById(req.params.orderId)

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' })
    }

    return res.json({ success: true, order })
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch order.' })
  }
})

router.patch('/:orderId/status', async (req, res) => {
  try {
    const order = await updateOrderStatus(req.params.orderId, req.body.status)
    return res.json({ success: true, order })
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to update order status.',
    })
  }
})

router.patch('/:orderId/payment-status', async (req, res) => {
  try {
    const order = await updatePaymentStatus(req.params.orderId, req.body.paymentStatus)
    return res.json({ success: true, order })
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to update payment status.',
    })
  }
})

router.patch('/:orderId/fulfillment-status', async (req, res) => {
  try {
    const order = await updateFulfillmentStatus(req.params.orderId, req.body.fulfillmentStatus)
    return res.json({ success: true, order })
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to update fulfillment status.',
    })
  }
})

export default router