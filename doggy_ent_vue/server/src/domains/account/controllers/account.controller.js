import { apiError } from '../../../shared/utils/apiError.js'
import {
  getAccountDashboard,
  getAccountOrderByReference,
  getAccountNotifications,
  getAccountOrders,
  getAccountProfile,
  updateAccountProfile,
} from '../services/account.service.js'

function handleAccountError(res, error, fallbackMessage) {
  const failure = apiError(error, fallbackMessage)
  return res.status(failure.statusCode).json({
    success: false,
    message: failure.message,
  })
}

export async function getAccountDashboardController(req, res) {
  try {
    const result = await getAccountDashboard(req.customerUser)

    return res.json({
      success: true,
      result,
    })
  }
  catch (error) {
    return handleAccountError(res, error, 'Unable to load account.')
  }
}

export async function getAccountProfileController(req, res) {
  try {
    const result = await getAccountProfile(req.customerUser)

    return res.json({
      success: true,
      result,
    })
  }
  catch (error) {
    return handleAccountError(res, error, 'Unable to load profile.')
  }
}

export async function updateAccountProfileController(req, res) {
  try {
    const result = await updateAccountProfile(
      req.customerUser,
      req.body,
    )

    return res.json({
      success: true,
      result,
    })
  }
  catch (error) {
    return handleAccountError(res, error, 'Unable to update profile.')
  }
}

export async function getAccountOrdersController(req, res) {
  try {
    const result = await getAccountOrders(req.customerUser)

    return res.json({
      success: true,
      result,
    })
  }
  catch (error) {
    return handleAccountError(res, error, 'Unable to load orders.')
  }
}

export async function getAccountOrderController(req, res) {
  try {
    const result = await getAccountOrderByReference(
      req.customerUser,
      req.params.reference,
    )

    return res.json({
      success: true,
      result,
    })
  }
  catch (error) {
    return handleAccountError(res, error, 'Unable to load order.')
  }
}

export async function getAccountNotificationsController(req, res) {
  try {
    const result = await getAccountNotifications(req.customerUser)

    return res.json({
      success: true,
      result,
    })
  }
  catch (error) {
    return handleAccountError(
      res,
      error,
      'Unable to load notification activity.',
    )
  }
}
