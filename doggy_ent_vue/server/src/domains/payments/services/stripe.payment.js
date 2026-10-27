import { logOperationalFailure } from '../../../shared/utils/operationalLog.js'
import { assertPaymentRequestMode, paymentUnavailable } from '../config/payment.config.js'
import { getVerifiedStripeContext } from './paymentEnvironment.service.js'

function normalizeStripeAmount(amount) {
  return Math.round(Number(amount || 0) * 100)
}

export const createStripePaymentIntent = async ({ amount, currency = 'usd', paymentMode }) => {
  try {
    assertPaymentRequestMode(paymentMode)
    const { stripe, mode } = await getVerifiedStripeContext({ forCreation: true })
    const paymentIntent = await stripe.paymentIntents.create({
      amount: normalizeStripeAmount(amount),
      currency,
      automatic_payment_methods: {
        enabled: true,
      },
    })

    if (typeof paymentIntent?.livemode !== 'boolean' || paymentIntent.livemode !== (mode === 'live')) throw paymentUnavailable()
    return paymentIntent
  } catch (error) {
    logOperationalFailure('PAYMENT_INTENT_CREATE_FAILED', error)
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
    const { stripe, mode } = await getVerifiedStripeContext()
    const paymentIntent = await stripe.paymentIntents.retrieve(
      stripePaymentIntentId,
    )
    if (paymentIntent && (typeof paymentIntent.livemode !== 'boolean' || paymentIntent.livemode !== (mode === 'live'))) throw paymentUnavailable()
    return paymentIntent
  } catch (error) {
    logOperationalFailure('PAYMENT_INTENT_RETRIEVE_FAILED', error)
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
