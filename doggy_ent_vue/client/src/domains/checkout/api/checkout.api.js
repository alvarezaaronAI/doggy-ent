
async function parseCheckoutResponse(
  response,
  fallbackMessage,
) {
  let data = null

  try {
    data = await response.json()
  }
  catch {
    data = null
  }

  if (!response.ok || !data?.success) {
    throw new Error(
      data?.message || fallbackMessage,
    )
  }

  return data.result
}

async function postCheckoutRequest(
  endpoint,
  payload,
  fallbackMessage,
) {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  return parseCheckoutResponse(
    response,
    fallbackMessage,
  )
}


export async function submitCheckout({
  cartItems,
  promoCode,
  customer,
  shipping,
  stripePaymentIntentId,
}) {
  return postCheckoutRequest(
    '/api/checkout',
    {
      cartItems,
      promoCode,
      customerEmail: customer.email,
      customer,
      shipping,
      stripePaymentIntentId,
    },
    'Checkout failed.',
  )
}

export async function submitCheckoutPreview({
  cartItems,
  promoCode,
  customer,
  shipping,
}) {
  return postCheckoutRequest(
    '/api/checkout/preview',
    {
      cartItems,
      promoCode,
      customerEmail: customer.email,
      customer,
      shipping,
    },
    'Checkout preview failed.',
  )
}