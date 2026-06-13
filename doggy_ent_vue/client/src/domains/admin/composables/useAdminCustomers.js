import { computed, ref } from 'vue'
import {
  deactivateAdminCustomer,
  fetchAdminCustomerById,
  fetchAdminCustomers,
  queueAdminCustomerPasswordReset,
  queueAdminCustomerVerification,
  reactivateAdminCustomer,
} from '../api/adminCustomers.api.js'

export function useAdminCustomers() {
  const customers = ref([])
  const customer = ref(null)
  const loading = ref(false)
  const saving = ref(false)
  const error = ref('')
  const searchQuery = ref('')

  const filteredCustomers = computed(() => {
    const query = searchQuery.value.trim().toLowerCase()

    if (!query) {
      return customers.value
    }

    return customers.value.filter((item) => [
      item.name,
      item.email,
      item.role,
      item.status,
    ]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(query)))
  })

  async function loadCustomers() {
    loading.value = true
    error.value = ''

    try {
      customers.value = await fetchAdminCustomers()
    }
    catch (loadError) {
      error.value = loadError.message || 'Unable to load customers.'
    }
    finally {
      loading.value = false
    }
  }

  async function loadCustomer(customerId) {
    loading.value = true
    error.value = ''

    try {
      customer.value = await fetchAdminCustomerById(customerId)
    }
    catch (loadError) {
      error.value = loadError.message || 'Unable to load customer.'
    }
    finally {
      loading.value = false
    }
  }

  async function runCustomerAction(action) {
    saving.value = true
    error.value = ''

    try {
      customer.value = await action()
      return customer.value
    }
    catch (actionError) {
      error.value = actionError.message || 'Unable to update customer.'
      throw actionError
    }
    finally {
      saving.value = false
    }
  }

  return {
    customer,
    customers,
    deactivateCustomer: (customerId) =>
      runCustomerAction(() => deactivateAdminCustomer(customerId)),
    error,
    filteredCustomers,
    loadCustomer,
    loadCustomers,
    loading,
    queuePasswordReset: queueAdminCustomerPasswordReset,
    queueVerification: queueAdminCustomerVerification,
    reactivateCustomer: (customerId) =>
      runCustomerAction(() => reactivateAdminCustomer(customerId)),
    saving,
    searchQuery,
  }
}
