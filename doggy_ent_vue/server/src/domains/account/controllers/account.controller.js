import {
  getAccountDashboard,
  getAccountOrderByReference,
  getAccountOrders,
  getAccountProfile,
  updateAccountProfile,
} from '../services/account.service.js'

function handleAccountError(res, error, fallbackMessage) {
  return res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || fallbackMessage,
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
