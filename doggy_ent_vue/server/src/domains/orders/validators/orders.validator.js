import {
  ORDER_STATUSES,
} from '../constants/orders.constants.js'

export function validateOrderStatus(status) {
  const normalizedStatus = String(status || '')
    .trim()
    .toUpperCase()

  if (ORDER_STATUSES.includes(normalizedStatus)) {
    return normalizedStatus
  }

  const error = new Error('Invalid order status.')
  error.statusCode = 400

  throw error
}
