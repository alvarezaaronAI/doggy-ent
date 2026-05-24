
async function parseCheckoutResponse(
  response,
  fallbackMessage,
) {
  let data = null

  try {
    data = await response.json()
  } catch {
    data = null
  }

  if (!response.ok || !data?.success) {
    throw new Error(
      data?.message || fallbackMessage,
    )
  }

  return data.result
}


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

  return parseCheckoutResponse(
    response,
    'Checkout failed.',
  )
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

  return parseCheckoutResponse(
    response,
    'Checkout preview failed.',
  )
}