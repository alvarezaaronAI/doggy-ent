

export const createPaymentIntent = async ({ items, amount }) => {
  try {
    const response = await fetch('/api/checkout/create-payment-intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        items,
        amount,
      }),
    })

    const data = await response.json()

    return data
  } catch (error) {
    console.error('Frontend payment service error:', error)
    throw error
  }
}