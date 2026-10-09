export const SHIPPING_OPTIONS = Object.freeze({
  standard: {
    method: 'standard',
    label: 'Standard shipping',
    description: 'Estimated arrival in 3-5 business days.',
    price: 5.99,
  },
  priority: {
    method: 'priority',
    label: 'Priority shipping',
    description: 'Estimated arrival in 1-2 business days.',
    price: 11.99,
  },
})

export const DEFAULT_SHIPPING_METHOD = 'standard'
