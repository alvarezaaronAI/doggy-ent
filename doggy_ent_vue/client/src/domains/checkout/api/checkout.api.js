

export async function submitCheckout({
  cartItems,
  promoCode,
  customer,
  shipping,
  stripePaymentIntentId,
}) {
  const response = await fetch('/api/checkout', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      cartItems,
      promoCode,
      customerEmail: customer.email,
      customer,
      shipping,
      stripePaymentIntentId,
    }),
  })

  const data = await response.json()

  if (!response.ok || !data.success) {
    throw new Error(
      data.message || 'Checkout failed.',
    )
  }

  return data
}

export async function submitCheckoutPreview({
  cartItems,
  promoCode,
  customer,
  shipping,
}) {
  const response = await fetch('/api/checkout/preview', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      cartItems,
      promoCode,
      customerEmail: customer.email,
      customer,
      shipping,
    }),
  })

  const data = await response.json()

  if (!response.ok || !data.success) {
    throw new Error(
      data.message || 'Checkout preview failed.',
    )
  }

  return data
}