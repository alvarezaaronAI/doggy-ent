import {
  addAdminOrderIssueMessage,
  createOrderIssueForCustomer,
  getAdminOrderIssues,
  getCustomerOrderIssue,
  getInternalIssues,
  listCustomerOrderIssues,
  updateInternalIssueAsAdmin,
  updateOrderIssueAsAdmin,
} from '../services/support.service.js'

function sendError(res, error, fallbackMessage) {
  return res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || fallbackMessage,
  })
}

export async function listCustomerOrderIssuesController(req, res) {
  try {
    const result = await listCustomerOrderIssues(req.customerUser)

    return res.json({
      success: true,
      result,
    })
  }
  catch (error) {
    return sendError(res, error, 'Unable to load order issues.')
  }
}

export async function getCustomerOrderIssueController(req, res) {
  try {
    const result = await getCustomerOrderIssue(
      req.customerUser,
      req.params.caseNumber,
    )

    return res.json({
      success: true,
      result,
    })
  }
  catch (error) {
    return sendError(res, error, 'Unable to load order issue.')
  }
}

export async function createCustomerOrderIssueController(req, res) {
  try {
    const result = await createOrderIssueForCustomer({
      user: req.customerUser,
      reference: req.params.reference,
      input: req.body,
    })

    return res.status(201).json({
      success: true,
      result,
    })
  }
  catch (error) {
    return sendError(res, error, 'Unable to create order issue.')
  }
}

export async function listAdminOrderIssuesController(req, res) {
  try {
    const result = await getAdminOrderIssues(req.query)

    return res.json({
      success: true,
      result,
    })
  }
  catch (error) {
    return sendError(res, error, 'Unable to load order issues.')
  }
}

export async function updateAdminOrderIssueController(req, res) {
  try {
    const result = await updateOrderIssueAsAdmin(
      req.params.caseNumber,
      req.body,
    )

    return res.json({
      success: true,
      result,
    })
  }
  catch (error) {
    return sendError(res, error, 'Unable to update order issue.')
  }
}

export async function addAdminOrderIssueMessageController(req, res) {
  try {
    const result = await addAdminOrderIssueMessage(
      req.params.caseNumber,
      req.body,
    )

    return res.status(201).json({
      success: true,
      result,
    })
  }
  catch (error) {
    return sendError(res, error, 'Unable to add order issue message.')
  }
}

export async function listAdminInternalIssuesController(req, res) {
  try {
    const result = await getInternalIssues(req.query)

    return res.json({
      success: true,
      result,
    })
  }
  catch (error) {
    return sendError(res, error, 'Unable to load internal issues.')
  }
}

export async function updateAdminInternalIssueController(req, res) {
  try {
    const result = await updateInternalIssueAsAdmin(
      req.params.caseNumber,
      req.body,
    )

    return res.json({
      success: true,
      result,
    })
  }
  catch (error) {
    return sendError(res, error, 'Unable to update internal issue.')
  }
}
