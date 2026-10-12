const safeCodes = new Set(['P2002', 'P2025', 'P2034', 'ECONNREFUSED', 'ETIMEDOUT', 'ECONNRESET'])
export function logOperationalFailure(event, error) {
  console.error(JSON.stringify({ event, code: safeCodes.has(error?.code) ? error.code : 'UNEXPECTED',
    ...(Number.isInteger(error?.statusCode) ? { status: error.statusCode } : {}) }))
}

export function logAdminAction(req, status) {
  console.info(JSON.stringify({ event: 'ADMIN_WRITE', actorId: req.admin.id, method: req.method,
    route: `${req.baseUrl || ''}${req.route?.path || ''}`, status }))
}
