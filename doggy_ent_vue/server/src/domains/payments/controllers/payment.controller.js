

import { createStripePaymentIntent } from '../services/stripe.payment.js'
import { createNewOrder } from '../../orders/services/orders.service.js'

export const createPaymentIntent = async (req, res) => {
  try {
    const { items, amount } = req.body

    console.log('Incoming checkout request:', {
      items,
      amount,
    })

    const paymentIntent = await createStripePaymentIntent({
      amount,
    })

    const subtotal = Array.isArray(items)
      ? items.reduce((sum, item) => {
          return sum + Number(item.price || 0) * Number(item.quantity || 1)
        }, 0)
      : 0

    const createdOrder = await createNewOrder({
      subtotal,
      total: subtotal,
      currency: 'usd',
      stripePaymentIntentId: paymentIntent.id,
      items,
    })

    return res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      orderId: createdOrder.id,
      orderNumber: createdOrder.orderNumber,
    })
  } catch (error) {
    console.error('Payment controller error:', error)

    return res.status(500).json({
      success: false,
      message: 'Failed to create payment intent.',
    })
  }
}