import crypto from 'node:crypto'
import { ADMIN_GATEWAY_MAX_BYTES, getAdminGatewayConfig } from '../../../config/env.js'

const HEADER = 'x-shop-admin-gateway'

export function requireAdminGateway(req, res, next) {
  let config
  try { config = getAdminGatewayConfig() } catch { return deny(res) }
  if (!config.required) return next()

  const value = req.headers?.[HEADER]
  if (typeof value !== 'string' || value.length < 32 || value.length > ADMIN_GATEWAY_MAX_BYTES
    || /\s/.test(value) || Buffer.byteLength(value, 'utf8') > ADMIN_GATEWAY_MAX_BYTES) return deny(res)

  // Reject duplicate fields even when Node's parsed headers joined their values.
  let fields = 0
  for (let index = 0; index < (req.rawHeaders?.length || 0); index += 2) {
    if (req.rawHeaders[index].toLowerCase() === HEADER) fields += 1
  }
  if (fields > 1) return deny(res)

  const digest = input => crypto.createHash('sha256').update(input, 'utf8').digest()
  if (!crypto.timingSafeEqual(digest(value), digest(config.secret))) return deny(res)
  return next()
}

function deny(res) {
  res.set('Cache-Control', 'no-store')
  return res.status(403).json({ success: false, message: 'Forbidden.' })
}
