import {
  addOrUpdateOrderTracking,
  refreshOrderTracking,
} from '../services/shipping.service.js'

function handleShippingError(res, error, fallbackMessage) {
  return res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || fallbackMessage,
  })
}

export async function putAdminOrderTracking(req, res) {
  try {
    const result = await addOrUpdateOrderTracking(
      req.params.orderId,
      req.body,
    )

    return res.json({
      success: true,
      ...result,
    })
  }
  catch (error) {
    return handleShippingError(
      res,
      error,
      'Unable to update tracking.',
    )
  }
}

export async function postAdminOrderTrackingRefresh(req, res) {
  try {
    const result = await refreshOrderTracking(req.params.orderId)

    return res.json({
      success: true,
      ...result,
    })
  }
  catch (error) {
    return handleShippingError(
      res,
      error,
      'Unable to refresh tracking.',
    )
  }
}

export async function postShippoWebhook(req, res) {
  const webhookSecret = String(
    process.env.SHIPPO_WEBHOOK_SECRET || '',
  ).trim()

  if (webhookSecret) {
    const providedSecret = String(
      req.get('x-shippo-webhook-secret')
      || req.get('x-webhook-secret')
      || '',
    ).trim()

    if (providedSecret !== webhookSecret) {
      return res.status(401).json({
        success: false,
        message: 'Invalid webhook secret.',
      })
    }
  }

  return res.json({
    success: true,
    received: true,
    message: 'Shippo webhook received. Automatic order matching is reserved until payload shape is verified in deployment.',
  })
}
