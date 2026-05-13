

import { createStripePaymentIntent } from '../../services/payments/stripe.payment.js'

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

    return res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret,
    })
  } catch (error) {
    console.error('Payment controller error:', error)

    return res.status(500).json({
      success: false,
      message: 'Failed to create payment intent.',
    })
  }
}