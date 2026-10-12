const invalid = () => Object.assign(new Error('Check your profile fields and notification preferences.'), { statusCode: 400 })
export function validateAccountProfile(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw invalid()
  for (const [field, max] of Object.entries({ firstName: 100, lastName: 100, phone: 40 })) {
    if (input[field] != null && (typeof input[field] !== 'string' || input[field].length > max)) throw invalid()
  }
  if (input.marketingOptIn != null && typeof input.marketingOptIn !== 'boolean') throw invalid()
  if (input.defaultAddress != null) {
    if (typeof input.defaultAddress !== 'object' || Array.isArray(input.defaultAddress)) throw invalid()
    for (const [field, max] of Object.entries({ address1: 200, address2: 200, city: 100, state: 64, zip: 20, country: 2 })) {
      const value = input.defaultAddress[field]
      if (value != null && (typeof value !== 'string' || value.length > max)) throw invalid()
    }
  }
  if (input.notificationPreference != null) {
    if (typeof input.notificationPreference !== 'object' || Array.isArray(input.notificationPreference)) throw invalid()
    for (const key of ['orderUpdates', 'trackingUpdates', 'reviewRequests', 'loyaltyNotifications', 'referralNotifications', 'marketingEmails']) {
      if (input.notificationPreference[key] != null && typeof input.notificationPreference[key] !== 'boolean') throw invalid()
    }
  }
}
