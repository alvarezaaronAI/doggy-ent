import { computed, nextTick, ref, toValue } from 'vue'
import { hasCompleteDeliveryAddress } from '../utils/checkoutReadiness.js'

export function useCheckoutAddressReview(customer) {
  const reviewing = ref(false), apartmentOpen = ref(false)
  const addressReview = ref(null), streetField = ref(null)
  const value = () => toValue(customer)
  const hasApartment = computed(() => apartmentOpen.value || Boolean(value().address2))
  const complete = computed(() => hasCompleteDeliveryAddress(value()))
  const recipient = computed(() => [value().firstName, value().lastName].filter(Boolean).join(' '))
  const locality = computed(() => [value().city, value().state, value().zip].filter(Boolean).join(', '))
  const countryName = computed(() => ({ US: 'United States', CA: 'Canada' })[value().country] || value().country)

  async function reviewAddress() {
    if (!complete.value) return
    reviewing.value = true
    await nextTick()
    addressReview.value?.focus()
  }
  async function editAddress() {
    reviewing.value = false
    await nextTick()
    streetField.value?.focus()
  }
  function expandApartment() { apartmentOpen.value = true }

  return { reviewing, addressReview, streetField, hasApartment, complete, recipient, locality, countryName, reviewAddress, editAddress, expandApartment }
}
