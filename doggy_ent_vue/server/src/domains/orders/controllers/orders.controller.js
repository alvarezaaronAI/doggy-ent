import {
  fetchAdminOrders,
  fetchAdminOrderById,
  fetchAdminOrderStats,
  updateAdminOrderStatus,
} from '../services/orders.service.js'

function handleControllerError(res, error, message) {
  return res.status(error.statusCode || 500).json({
    message: error.message || message,
  })
}

export async function getAdminOrders(req, res) {
  try {
    const orders = await fetchAdminOrders()

    return res.status(200).json(orders)
  }
  catch (error) {
    return handleControllerError(
      res,
      error,
      'Unable to load orders.',
    )
  }
}

export async function getAdminOrderById(req, res) {
  try {
    const order = await fetchAdminOrderById(req.params.orderId)

    if (!order) {
      return res.status(404).json({
        message: 'Order not found.',
      })
    }

    return res.status(200).json(order)
  }
  catch (error) {
    return handleControllerError(
      res,
      error,
      'Unable to load order.',
    )
  }
}

export async function getAdminOrderStats(req, res) {
  try {
    const stats = await fetchAdminOrderStats()

    return res.status(200).json(stats)
  }
  catch (error) {
    return handleControllerError(
      res,
      error,
      'Unable to load order stats.',
    )
  }
}

export async function patchAdminOrderStatus(req, res) {
  try {
    const order = await updateAdminOrderStatus(
      req.params.orderId,
      req.body.status,
    )

    return res.status(200).json(order)
  }
  catch (error) {
    return handleControllerError(
      res,
      error,
      'Unable to update order status.',
    )
  }
}
