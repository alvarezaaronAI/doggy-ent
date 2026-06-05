import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

function normalizeStripeAmount(amount) {
  return Math.round(Number(amount || 0) * 100)
}

export const createStripePaymentIntent = async ({ amount, currency = 'usd' }) => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: normalizeStripeAmount(amount),
      currency,
      automatic_payment_methods: {
        enabled: true,
      },
    })

    return paymentIntent
  } catch (error) {
    console.error('Stripe payment intent error:', error)
    throw error
  }
}

export async function retrieveStripePaymentIntent(
  stripePaymentIntentId,
) {
  if (!stripePaymentIntentId) {
    throw new Error(
      'Stripe payment intent ID is required.',
    )
  }

  try {
    return await stripe.paymentIntents.retrieve(
      stripePaymentIntentId,
    )
  } catch (error) {
    console.error(
      'Stripe payment intent retrieval error:',
      error,
    )

    throw error
  }
}

export async function validateStripePaymentIntent({
  stripePaymentIntentId,
  expectedAmount,
  expectedCurrency = 'usd',
}) {
  const paymentIntent =
    await retrieveStripePaymentIntent(
      stripePaymentIntentId,
    )

  if (!paymentIntent) {
    const error = new Error(
      'Stripe payment intent was not found.',
    )

    error.statusCode = 404

    throw error
  }

  if (paymentIntent.status !== 'succeeded') {
    const error = new Error(
      'Stripe payment has not completed successfully.',
    )

    error.statusCode = 400

    throw error
  }

  const normalizedExpectedAmount =
    normalizeStripeAmount(expectedAmount)

  if (
    Number(paymentIntent.amount_received || 0)
    !== normalizedExpectedAmount
  ) {
    const error = new Error(
      'Stripe payment amount mismatch detected.',
    )

    error.statusCode = 400

    throw error
  }

  if (
    String(paymentIntent.currency || '')
      .toLowerCase()
    !== String(expectedCurrency || 'usd')
      .toLowerCase()
  ) {
    const error = new Error(
      'Stripe payment currency mismatch detected.',
    )

    error.statusCode = 400

    throw error
  }

  return paymentIntent
}
