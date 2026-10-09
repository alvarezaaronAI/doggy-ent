import rateLimit from 'express-rate-limit'

export function createRateLimiter({
  max,
  message,
  windowMs,
}) {
  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      message,
    },
  })
}

export const checkoutRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 80,
  message: 'Too many checkout requests. Please try again shortly.',
})

export const paymentRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: 'Too many payment attempts. Please try again shortly.',
})

export const customerAuthRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 80,
  message: 'Too many account requests. Please try again shortly.',
})

export const issueRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: 'Too many support requests. Please try again shortly.',
})

export const webhookRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: 'Too many webhook requests.',
})
