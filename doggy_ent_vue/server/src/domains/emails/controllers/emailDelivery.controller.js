import { apiError } from '../../../shared/utils/apiError.js'
import {
  fetchAdminEmailDeliveries,
} from '../services/emailDelivery.service.js'

function handleEmailDeliveryError(res, error, fallbackMessage) {
  const failure = apiError(error, fallbackMessage)
  return res.status(failure.statusCode).json({
    success: false,
    message: failure.message,
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
