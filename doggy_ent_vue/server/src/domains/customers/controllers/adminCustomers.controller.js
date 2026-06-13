import {
  deactivateAdminCustomer,
  fetchAdminCustomerById,
  fetchAdminCustomers,
  queueAdminCustomerPasswordReset,
  queueAdminCustomerVerification,
  reactivateAdminCustomer,
} from '../services/adminCustomers.service.js'

function handleCustomerError(res, error, fallbackMessage) {
  return res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || fallbackMessage,
  })
}

export async function getAdminCustomersController(req, res) {
  try {
    const customers = await fetchAdminCustomers()

    return res.json({
      success: true,
      result: customers,
    })
  }
  catch (error) {
    return handleCustomerError(
      res,
      error,
      'Unable to load customers.',
    )
  }
}

export async function getAdminCustomerController(req, res) {
  try {
    const customer = await fetchAdminCustomerById(
      req.params.customerId,
    )

    return res.json({
      success: true,
      result: customer,
    })
  }
  catch (error) {
    return handleCustomerError(
      res,
      error,
      'Unable to load customer.',
    )
  }
}

export async function deactivateAdminCustomerController(req, res) {
  try {
    const customer = await deactivateAdminCustomer(
      req.params.customerId,
    )

    return res.json({
      success: true,
      result: customer,
    })
  }
  catch (error) {
    return handleCustomerError(
      res,
      error,
      'Unable to deactivate customer.',
    )
  }
}

export async function reactivateAdminCustomerController(req, res) {
  try {
    const customer = await reactivateAdminCustomer(
      req.params.customerId,
    )

    return res.json({
      success: true,
      result: customer,
    })
  }
  catch (error) {
    return handleCustomerError(
      res,
      error,
      'Unable to reactivate customer.',
    )
  }
}

export async function queueCustomerVerificationController(req, res) {
  try {
    const result = await queueAdminCustomerVerification(
      req.params.customerId,
    )

    return res.json({
      success: true,
      result,
    })
  }
  catch (error) {
    return handleCustomerError(
      res,
      error,
      'Unable to queue verification email.',
    )
  }
}

export async function queueCustomerPasswordResetController(req, res) {
  try {
    const result = await queueAdminCustomerPasswordReset(
      req.params.customerId,
    )

    return res.json({
      success: true,
      result,
    })
  }
  catch (error) {
    return handleCustomerError(
      res,
      error,
      'Unable to queue password reset email.',
    )
  }
}
