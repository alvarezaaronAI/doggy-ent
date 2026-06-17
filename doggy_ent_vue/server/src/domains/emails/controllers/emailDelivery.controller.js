import {
  fetchAdminEmailDeliveries,
} from '../services/emailDelivery.service.js'

function handleEmailDeliveryError(res, error, fallbackMessage) {
  return res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || fallbackMessage,
  })
}

export async function getAdminEmailDeliveriesController(req, res) {
  try {
    const result = await fetchAdminEmailDeliveries({
      event: req.query.event,
      status: req.query.status,
      limit: req.query.limit,
    })

    return res.json({
      success: true,
      result,
    })
  }
  catch (error) {
    return handleEmailDeliveryError(
      res,
      error,
      'Unable to load notification activity.',
    )
  }
}
