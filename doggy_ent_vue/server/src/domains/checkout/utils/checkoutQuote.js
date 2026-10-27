import { createHash } from 'node:crypto'
import { normalizeUsAddress } from '../../../shared/utils/usAddress.js'

export function checkoutQuoteHash({ cartItems, discountAmount, shippingAmount, shipping, customer, promoCode }) {
  const items = cartItems.map(item => ({
    id: item.productId || item.id,
    sku: item.sku || item.variant?.sku,
    size: item.size,
    quantity: item.quantity,
    amount: Math.round(Number(item.price) * 100),
  })).sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)))
  const quote = {
    items,
    discount: Math.round(discountAmount * 100),
    shipping: Math.round(shippingAmount * 100),
    delivery: [shipping?.method, shipping?.carrier, shipping?.service, shipping?.rateId, shipping?.provider],
    address: normalizeUsAddress(customer),
    promo: String(promoCode || '').trim().toUpperCase(),
  }
  return createHash('sha256').update(JSON.stringify(quote)).digest('hex')
}

export function checkoutChangedAfterPayment() {
  return Object.assign(new Error('Checkout details changed after payment started. If payment completed, do not pay again; contact support with your payment reference.'), { statusCode: 409 })
}
