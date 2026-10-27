export const US_STATES = Object.freeze('AL AK AZ AR CA CO CT DE DC FL GA HI ID IL IN IA KS KY LA ME MD MA MI MN MS MO MT NE NV NH NJ NM NY NC ND OH OK OR PA RI SC SD TN TX UT VT VA WA WV WI WY'.split(' '))

const invalidAddress = message => Object.assign(new Error(message), { statusCode: 400, code: 'INVALID_US_DESTINATION' })

function text(value, maxLength) {
  if (value == null) return ''
  if (typeof value !== 'string' || value.length > maxLength || /[\u0000-\u001f\u007f]/.test(value)) {
    throw invalidAddress('Review your shipping address.')
  }
  return value.trim().replace(/\s+/g, ' ')
}

// Accept checkout fields and the normalized Stripe address, without carrying contact data.
export function normalizeUsAddress(customer = {}) {
  const country = text(customer?.country, 60).toUpperCase()
  return {
    country: country === 'UNITED STATES' ? 'US' : country,
    state: text(customer?.state, 2).toUpperCase(),
    city: text(customer?.city, 80),
    line1: text(customer?.address1 ?? customer?.line1, 200),
    line2: text(customer?.address2 ?? customer?.line2, 200),
    postal_code: text(customer?.zip ?? customer?.postal_code, 10),
  }
}

export function assertUsDestination(customer, { allowIncomplete = true } = {}) {
  const address = normalizeUsAddress(customer)
  if (address.country && address.country !== 'US') throw invalidAddress('Shipping is available within the United States only.')
  if (address.state && !US_STATES.includes(address.state)) throw invalidAddress('Choose a valid US state or District of Columbia.')
  if (address.postal_code && !/^\d{5}(?:-\d{4})?$/.test(address.postal_code)) throw invalidAddress('Enter a valid US ZIP code.')
  if (!allowIncomplete && !['country', 'state', 'city', 'line1', 'postal_code'].every(key => address[key])) {
    throw invalidAddress('Complete your US shipping address before payment.')
  }
  return address
}
