import { timingSafeEqual } from 'node:crypto'
import { apiError } from '../../../shared/utils/apiError.js'
import {
  addOrUpdateOrderTracking,
  fetchAdminShipmentOverview,
  refreshOrderTracking,
} from '../services/shipping.service.js'

function handleShippingError(res, error, fallbackMessage) {
  const failure = apiError(error, fallbackMessage)
  return res.status(failure.statusCode).json({
    success: false,
    message: failure.message,
  })
}

export async function putAdminOrderTracking(req, res) {
  try {
    const result = await addOrUpdateOrderTracking(
      req.params.orderId,
      req.body,
      req.admin,
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
    const result = await refreshOrderTracking(req.params.orderId, req.admin)

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

export async function getAdminShipmentsController(req, res) {
  try {
    const result = await fetchAdminShipmentOverview({
      status: req.query.status,
      limit: req.query.limit,
    })

    return res.json({
      success: true,
      result,
    })
  }
  catch (error) {
    return handleShippingError(
      res,
      error,
      'Unable to load shipments.',
    )
  }
}

export async function postShippoWebhook(req, res) {
  const webhookSecret = String(
    process.env.SHIPPO_WEBHOOK_SECRET || '',
  ).trim()

  if (!webhookSecret) {
    return res.status(503).json({ success: false, message: 'Tracking webhook is not configured.' })
  }
  if (webhookSecret) {
    const providedSecret = String(
      req.get('x-shippo-webhook-secret')
      || req.get('x-webhook-secret')
      || '',
    ).trim()

    const received = Buffer.from(providedSecret), expected = Buffer.from(webhookSecret)
    if (received.length !== expected.length || !timingSafeEqual(received, expected)) {
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
