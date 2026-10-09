import { describe, expect, it } from 'vitest'
import {
  toAccountProfileForm,
  toAccountProfilePayload,
} from '../../../src/domains/account/mappers/accountProfile.mapper.js'
import { validateAccountAddress } from '../../../src/domains/account/validators/account.validators.js'

const account = {
  profile: {
    firstName: 'Alex',
    lastName: 'Morgan',
    phone: '5550100',
    marketingOptIn: true,
    defaultAddress: {
      address1: 'Example Street',
      city: 'Sample City',
      state: 'CA',
      zip: '90001',
      country: 'US',
    },
  },
  notificationPreference: { orderUpdates: false, trackingUpdates: true, marketingEmails: true },
}
describe('focused profile editors', () => {
  it('preserves address and preferences while trimming personal details', () => {
    const payload = toAccountProfilePayload(account, 'personal', {
      firstName: ' Alex ',
      lastName: ' New ',
      phone: ' 5550200 ',
    })
    expect(payload.firstName).toBe('Alex')
    expect(payload.lastName).toBe('New')
    expect(payload.defaultAddress).toMatchObject(account.profile.defaultAddress)
    expect(payload.notificationPreference.orderUpdates).toBe(false)
    expect(payload.marketingOptIn).toBe(true)
    expect(account.profile.lastName).toBe('Morgan')
  })
  it('preserves personal details and opt-in when changing address', () => {
    const form = toAccountProfileForm(account)
    form.defaultAddress.address1 = ' Next Street '
    const payload = toAccountProfilePayload(account, 'address', form)
    expect(payload.defaultAddress.address1).toBe('Next Street')
    expect(payload.phone).toBe('5550100')
    expect(payload.marketingOptIn).toBe(true)
    expect(account.profile.defaultAddress.address1).toBe('Example Street')
  })
  it('synchronizes marketing opt-out without erasing profile or other preferences', () => {
    const form = toAccountProfileForm(account)
    form.marketingOptIn = false
    const payload = toAccountProfilePayload(account, 'preferences', form)
    expect(payload.marketingOptIn).toBe(false)
    expect(payload.notificationPreference.marketingEmails).toBe(false)
    expect(payload.notificationPreference.orderUpdates).toBe(false)
    expect(payload.defaultAddress).toMatchObject(account.profile.defaultAddress)
    expect(payload.firstName).toBe('Alex')
  })
  it('rejects incomplete addresses and accepts a complete address', () => {
    expect(validateAccountAddress({ address1: 'Street' })).toBe('City is required.')
    expect(validateAccountAddress(account.profile.defaultAddress)).toBe('')
  })
})
