import { ref } from 'vue'
import { fetchAdminCustomers } from '../api/adminCustomers.api.js'
import { fetchAdminNotifications } from '../api/adminNotifications.api.js'
import {
  fetchAdminOrders,
  fetchAdminOrderStats,
} from '../api/adminOrders.api.js'
import { fetchAdminShipments } from '../api/adminShipments.api.js'
import {
  fetchAdminInternalIssues,
  fetchAdminOrderIssues,
} from '../api/adminSupport.api.js'

export function useAdminOverview() {
  const activity = ref({})
  const loading = ref(false)
  const errors = ref([])
  async function load() {
    if (loading.value) return
    loading.value = true
    errors.value = []
    const sources = {
      orders: fetchAdminOrders,
      stats: fetchAdminOrderStats,
      customers: fetchAdminCustomers,
      notifications: () => fetchAdminNotifications({ limit: 10 }),
      shipments: () => fetchAdminShipments({ limit: 10 }),
      support: fetchAdminOrderIssues,
      internal: fetchAdminInternalIssues,
    }
    const keys = Object.keys(sources)
    const results = await Promise.allSettled(keys.map((key) => sources[key]()))
    const next = {}
    results.forEach((result, index) => {
      const key = keys[index]
      if (result.status === 'fulfilled') next[key] = result.value
      else
        errors.value.push(
          `Unable to load ${key === 'stats' ? 'order totals' : key} data.`,
        )
    })
    activity.value = next
    loading.value = false
  }
  return { activity, errors, loading, load }
}
