export function isCustomerApiPath(path) {
  return /^\/api\/(?:customer-auth|account|checkout)(?:\/|\?|$)/.test(path)
}

export function isAllowedCustomerRequest(path, method) {
  if (/[\\%]/.test(path) || path.includes('//')) return false
  const read = method === 'GET' || method === 'HEAD'
  if (read && ['/api/customer-auth/get-session', '/api/customer-auth/readiness'].includes(path)) return true
  if (method === 'POST' && ['/api/customer-auth/sign-in/email', '/api/customer-auth/sign-up/email', '/api/customer-auth/sign-out', '/api/customer-auth/request-password-reset', '/api/customer-auth/reset-password', '/api/customer-auth/send-verification-email'].includes(path)) return true
  if (read && ['/api/account', '/api/account/', '/api/account/profile', '/api/account/notifications', '/api/account/orders', '/api/account/issues', '/api/account/pets', '/api/account/wishlist'].includes(path)) return true
  if (path === '/api/account/profile' && method === 'PUT') return true
  if (path === '/api/account/pets' && method === 'POST') return true
  if (read && /^\/api\/account\/(?:orders|issues)\/[a-zA-Z0-9_-]+$/.test(path)) return true
  if (method === 'POST' && /^\/api\/account\/orders\/[a-zA-Z0-9_-]+\/issues$/.test(path)) return true
  if (['PUT', 'DELETE'].includes(method) && /^\/api\/account\/(?:pets|wishlist)\/[a-zA-Z0-9_-]+$/.test(path)) return true
  if (method === 'PATCH' && /^\/api\/account\/pets\/[a-zA-Z0-9_-]+\/archive$/.test(path)) return true
  if ((read || ['PUT', 'DELETE'].includes(method)) && /^\/api\/account\/pets\/[a-zA-Z0-9_-]+\/photo$/.test(path)) return true
  if (read && ['/api/checkout/shipping-options', '/api/checkout/payment-configuration'].includes(path)) return true
  if (method === 'POST' && ['/api/checkout', '/api/checkout/', '/api/checkout/shipping-rates', '/api/checkout/preview', '/api/checkout/create-payment-intent'].includes(path)) return true
  if (read && /^\/api\/checkout\/(?:orders|attempts)\/[a-zA-Z0-9_-]+$/.test(path)) return true
  return method === 'POST' && /^\/api\/checkout\/attempts\/[a-zA-Z0-9_-]+\/(?:finalize|cancel)$/.test(path)
}
