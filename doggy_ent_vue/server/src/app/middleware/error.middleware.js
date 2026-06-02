export function errorMiddleware(error, req, res, next) {
  if (res.headersSent) {
    return next(error)
  }

  const statusCode = error.statusCode || 500

  return res.status(statusCode).json({
    message:
      error.message ||
      'An unexpected server error occurred.',
  })
}
