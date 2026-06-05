

export const createPaymentIntent = async ({
  cartItems,
  promoCode,
  customer,
  shipping,
}) => {
  try {
    const response = await fetch('/api/checkout/create-payment-intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        cartItems,
        promoCode,
        customerEmail: customer?.email,
        customer,
        shipping,
      }),
    })

    const data = await response.json()

    if (!response.ok || !data?.success) {
      throw new Error(
        data?.message || 'Unable to initialize payment.',
      )
    }

    return data
  } catch (error) {
    console.error('Frontend payment service error:', error)
    throw error
  }
}
