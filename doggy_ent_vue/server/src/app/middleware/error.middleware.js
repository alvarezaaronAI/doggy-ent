import {
  recordInternalIssue,
} from '../../domains/support/services/support.service.js'

export async function errorMiddleware(error, req, res, next) {
  if (res.headersSent) {
    return next(error)
  }

  const statusCode = error.statusCode || 500
  let issueReference = null

  if (statusCode >= 500) {
    try {
      const issue = await recordInternalIssue({
        category: 'SERVER_EXCEPTION',
        severity: 'HIGH',
        source: 'express-error-middleware',
        summary: error.message || 'Unexpected server error',
        safeDetails: 'A server-owned operation failed unexpectedly.',
        route: `${req.method} ${req.originalUrl}`,
        customerId: req.customerUser?.id || null,
      })
      issueReference = issue?.caseNumber || null
    }
    catch {
      issueReference = null
    }
  }

  const message = statusCode >= 500
    ? 'An unexpected server error occurred.'
    : error.message || 'An unexpected server error occurred.'

  return res.status(statusCode).json({
    message,
    ...(issueReference ? { issueReference } : {}),
  })
}
