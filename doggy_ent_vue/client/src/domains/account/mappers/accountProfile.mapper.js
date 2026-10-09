import { NOTIFICATION_FIELDS } from '../constants/account.constants.js'

// The existing endpoint replaces these fields, rather than patching them.
export function toAccountProfileForm(account) {
  const profile = account?.profile || {}
  return {
    firstName: profile.firstName || '',
    lastName: profile.lastName || '',
    phone: profile.phone || '',
    marketingOptIn: Boolean(profile.marketingOptIn),
    preferredContactMethod: profile.preferredContactMethod || null,
    defaultAddress: {
      address1: '',
      address2: '',
      city: '',
      state: '',
      zip: '',
      country: 'US',
      ...(profile.defaultAddress || {}),
    },
    notificationPreference: Object.fromEntries([
      ...NOTIFICATION_FIELDS.map(({ key }) => [
        key,
        account?.notificationPreference?.[key] ?? true,
      ]),
      ['marketingEmails', Boolean(account?.notificationPreference?.marketingEmails)],
    ]),
  }
}

export function toAccountProfilePayload(account, section, values) {
  const payload = toAccountProfileForm(account)
  if (section === 'personal') {
    for (const key of ['firstName', 'lastName', 'phone'])
      payload[key] = String(values[key] || '').trim()
  } else if (section === 'address') {
    payload.defaultAddress = Object.fromEntries(
      Object.entries(values.defaultAddress).map(([key, value]) => [key, String(value || '').trim()])
    )
  } else if (section === 'preferences') {
    payload.marketingOptIn = Boolean(values.marketingOptIn)
    payload.notificationPreference = {
      ...values.notificationPreference,
      marketingEmails: payload.marketingOptIn,
    }
  }
  return payload
}
