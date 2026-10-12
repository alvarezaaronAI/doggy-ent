import { ref } from 'vue'
import { fetchAccountProfile } from '@domains/account/api/account.api.js'
const CUSTOMER_STORAGE_KEY = 'doggy-ent-checkout-customer'
export function useCheckoutIdentity() {
const customer = ref(loadSavedCustomer()), accountProfile = ref(null), accountProfileLoaded = ref(false), profilePrefilled = ref(false)
const isSignedInCheckout = { get value() { return Boolean(accountProfile.value?.id) } }
function getEmptyCustomer() {
  return {
    email: '',
    phone: '',
    deliveryNotes: '',
    firstName: '',
    lastName: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    zip: '',
    country: 'US',
    saveInfo: false,
    marketingOptIn: false,
  }
}

function loadSavedCustomer() {
  try {
    const savedCustomer = JSON.parse(localStorage.getItem(CUSTOMER_STORAGE_KEY) || 'null')
    return savedCustomer && typeof savedCustomer === 'object'
      ? { ...getEmptyCustomer(), ...savedCustomer }
      : getEmptyCustomer()
  } catch {
    return getEmptyCustomer()
  }
}

function saveCustomerForNextCheckout() {
  if (isSignedInCheckout.value) {
    localStorage.removeItem(CUSTOMER_STORAGE_KEY)
    return
  }

  if (!customer.value.saveInfo) {
    localStorage.removeItem(CUSTOMER_STORAGE_KEY)
    return
  }

  localStorage.setItem(CUSTOMER_STORAGE_KEY, JSON.stringify({
    email: customer.value.email,
    phone: customer.value.phone,
    firstName: customer.value.firstName,
    lastName: customer.value.lastName,
    address1: customer.value.address1,
    address2: customer.value.address2,
    city: customer.value.city,
    state: customer.value.state,
    zip: customer.value.zip,
    country: customer.value.country,
    saveInfo: true,
    marketingOptIn: customer.value.marketingOptIn,
  }))
}

function applyAccountProfileToCheckout(profile) {
  if (!profile) {
    return
  }

  const accountFields = {
    email: profile.email || '',
    firstName: profile.profile?.firstName || '',
    lastName: profile.profile?.lastName || '',
    phone: profile.profile?.phone || '',
    marketingOptIn: Boolean(profile.profile?.marketingOptIn),
    address1: profile.profile?.defaultAddress?.address1 || '',
    address2: profile.profile?.defaultAddress?.address2 || '',
    city: profile.profile?.defaultAddress?.city || '',
    state: profile.profile?.defaultAddress?.state || '',
    zip: profile.profile?.defaultAddress?.zip || '',
    country: profile.profile?.defaultAddress?.country || '',
  }

  let changed = false

  for (const [key, value] of Object.entries(accountFields)) {
    if (
      value !== ''
      && !String(customer.value[key] || '').trim()
    ) {
      customer.value[key] = value
      changed = true
    }
  }

  customer.value.saveInfo = false
  profilePrefilled.value = changed
}

async function loadCheckoutAccountProfile() {
  try {
    const profile = await fetchAccountProfile()
    accountProfile.value = profile
    applyAccountProfileToCheckout(profile)
  }
  catch {
    accountProfile.value = null
  }
  finally {
    accountProfileLoaded.value = true
  }
}
return { customer, accountProfile, accountProfileLoaded, profilePrefilled, saveCustomerForNextCheckout, loadCheckoutAccountProfile }
}
