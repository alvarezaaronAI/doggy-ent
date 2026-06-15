export function errorMiddleware(error, req, res, next) {
  if (res.headersSent) {
    return next(error)
  }

  const statusCode = error.statusCode || 500
  const message = statusCode >= 500
    ? 'An unexpected server error occurred.'
    : error.message || 'An unexpected server error occurred.'

  return res.status(statusCode).json({
    message,
  })
}
