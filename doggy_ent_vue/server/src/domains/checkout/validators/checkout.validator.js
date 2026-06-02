export function validateCheckoutSubmissionState({
  stripePaymentIntentId,
}) {
  const normalizedPaymentIntentId = String(
    stripePaymentIntentId || '',
  ).trim()

  if (!normalizedPaymentIntentId) {
    const error = new Error(
      'A completed payment is required before checkout.',
    )

    error.statusCode = 400

    throw error
  }
}

export function validateRequiredCheckoutFields({
  customer = {},
}) {
  const requiredFields = [
    {
      key: 'firstName',
      label: 'First name',
    },
    {
      key: 'lastName',
      label: 'Last name',
    },
    {
      key: 'email',
      label: 'Email address',
    },
    {
      key: 'address1',
      label: 'Shipping address',
    },
    {
      key: 'city',
      label: 'City',
    },
    {
      key: 'state',
      label: 'State',
    },
    {
      key: 'zip',
      label: 'ZIP code',
    },
    {
      key: 'country',
      label: 'Country',
    },
  ]

  for (const field of requiredFields) {
    const value = String(
      customer[field.key] || '',
    ).trim()

    if (!value) {
      const error = new Error(
        `${field.label} is required.`,
      )

      error.statusCode = 400

      throw error
    }
  }

  const normalizedEmail = String(
    customer.email || '',
  ).trim()

  if (!normalizedEmail.includes('@')) {
    const error = new Error(
      'A valid email address is required.',
    )

    error.statusCode = 400

    throw error
  }
}

export function validateFinalizedCheckoutPreview(
  checkoutPreview,
) {
  if (!checkoutPreview?.pricing) {
    const error = new Error(
      'Checkout pricing preview is required.',
    )

    error.statusCode = 400

    throw error
  }

  if (
    Number(checkoutPreview.pricing.total || 0)
    <= 0
  ) {
    const error = new Error(
      'Checkout total must be greater than zero.',
    )

    error.statusCode = 400

    throw error
  }
}
