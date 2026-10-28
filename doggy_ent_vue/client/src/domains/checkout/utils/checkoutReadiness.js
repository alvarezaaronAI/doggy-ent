import { isUSShippingDestination } from '../constants/shippingDestinations.js'

export function hasCompleteDeliveryAddress(customer = {}) {
  return isUSShippingDestination(customer)
    && ['firstName', 'lastName', 'address1', 'city', 'state', 'zip'].every(key => String(customer[key] || '').trim())
    && /^\d{5}(?:-\d{4})?$/.test(String(customer.zip || '').trim())
}

export function buildPaymentReadiness({ steps = [], quoteReady = false, loading = false, deliveryLoading = false, error = '', cardComplete = false, empty = false, paid = false } = {}) {
  const labels = { contact: 'Contact', shipping: 'Address', delivery: 'Delivery' }
  const progress = ['contact', 'shipping', 'delivery'].map(id => ({ id, label: labels[id], complete: Boolean(steps.find(step => step.id === id)?.complete), ...(id === 'delivery' ? { busy: deliveryLoading && !paid } : {}) }))
  progress.push({ id: 'total', label: 'Total', complete: paid || (quoteReady && !loading && !error), busy: loading && !paid })
  const missing = progress.find(step => !step.complete)
  const actions = { contact: 'Add contact details', shipping: 'Complete delivery address', delivery: 'Choose delivery', total: error ? 'Retry order total' : 'Update order total' }
  const canEnterPayment = !empty && progress.every(step => step.complete)
  return {
    steps: progress,
    canEnterPayment,
    phase: empty ? 'bag' : missing?.id || 'ready',
    action: empty ? { step: 'bag', label: 'Return to your bag' }
      : missing ? { step: missing.id, label: actions[missing.id], busy: Boolean(missing.busy), ...(missing.busy ? { busyLabel: missing.id === 'delivery' ? 'Updating delivery' : 'Updating your total' } : {}) }
        : cardComplete ? null : { step: 'payment', label: 'Enter payment details' },
    error: Boolean(error),
  }
}
