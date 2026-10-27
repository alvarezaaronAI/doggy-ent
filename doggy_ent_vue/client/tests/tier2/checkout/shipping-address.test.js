import { describe, expect, it, vi } from 'vitest'
import { reactive, ref } from 'vue'
import { useCheckoutAddressReview } from '../../../src/domains/checkout/composables/useCheckoutAddressReview.js'

const address = () => reactive({ firstName: 'Alex', lastName: 'Morgan', address1: '123 Example Lane', address2: 'Unit 2', city: 'Sample City', state: 'CA', zip: '90001', country: 'US' })

describe('shipping address review without provider or payment work', () => {
  it('reviews the entered postal address then edits it without clearing any fields', async () => {
    const customer = address(), state = useCheckoutAddressReview(() => customer), original = { ...customer }
    const summaryFocus = vi.fn(), streetFocus = vi.fn()
    state.addressReview.value = { focus: summaryFocus }; state.streetField.value = { focus: streetFocus }
    await state.reviewAddress()
    expect(state.reviewing.value).toBe(true); expect(summaryFocus).toHaveBeenCalledOnce()
    expect(state.recipient.value).toBe('Alex Morgan'); expect(state.locality.value).toBe('Sample City, CA, 90001'); expect(state.countryName.value).toBe('United States')
    await state.editAddress()
    expect(state.reviewing.value).toBe(false); expect(streetFocus).toHaveBeenCalledOnce(); expect(customer).toEqual(original)
  })
  it('does not review unfinished fields and reacts to optional and replaced address data', async () => {
    const customer = ref(address()); customer.value.address1 = ''; customer.value.address2 = ''
    const state = useCheckoutAddressReview(customer)
    expect(state.complete.value).toBe(false); await state.reviewAddress(); expect(state.reviewing.value).toBe(false)
    expect(state.hasApartment.value).toBe(false); state.expandApartment(); expect(state.hasApartment.value).toBe(true)
    customer.value = { ...address(), country: 'CA', state: 'ON', city: 'Toronto', zip: 'M5V 2T6' }
    expect(state.complete.value).toBe(false); expect(state.countryName.value).toBe('Canada'); expect(state.locality.value).toBe('Toronto, ON, M5V 2T6')
    await state.reviewAddress(); expect(state.reviewing.value).toBe(false)
    expect(customer.value.country).toBe('CA'); expect(customer.value.state).toBe('ON')
  })
})
