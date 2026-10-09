<script setup>
import { computed, onMounted } from 'vue'
import AdminCustomersTable from '../components/AdminCustomersTable.vue'
import AdminPageHeader from '../components/AdminPageHeader.vue'
import AdminIcon from '../components/AdminIcon.vue'
import AdminMetrics from '../components/AdminMetrics.vue'
import { useAdminCustomers } from '../composables/useAdminCustomers'
const {
  customers,
  error,
  filteredCustomers,
  loadCustomers,
  loading,
  searchQuery,
} = useAdminCustomers()
const metrics = computed(() => [
  {
    label: 'Customers',
    value: error.value ? 'Unavailable' : customers.value.length,
  },
  {
    label: 'Verified emails',
    value: error.value
      ? 'Unavailable'
      : customers.value.filter((c) => c.emailVerified).length,
  },
  {
    label: 'Active accounts',
    value: error.value
      ? 'Unavailable'
      : customers.value.filter((c) => c.status === 'ACTIVE').length,
  },
])
onMounted(loadCustomers)
</script>
<template>
  <section class="admin-page">
    <AdminPageHeader title="Customers" eyebrow="Customer care"
      ><button
        class="admin-icon-button"
        title="Refresh customers"
        aria-label="Refresh customers"
        :disabled="loading"
        @click="loadCustomers"
      >
        <AdminIcon name="refresh" /></button
    ></AdminPageHeader>
    <div v-if="error" class="admin-alert admin-error" role="alert">
      {{ error }}
    </div>
    <AdminMetrics :loading="loading" :items="metrics" />
    <div class="admin-filters">
      <label class="admin-field grow"
        >Search customers<input
          v-model="searchQuery"
          type="search"
          placeholder="Name, email, customer ID, role or account status"
      /></label>
    </div>
    <p class="admin-muted my-4">
      {{ filteredCustomers.length }} of {{ customers.length }} customers
    </p>
    <p v-if="loading" class="admin-state" role="status">Loading customers...</p>
    <AdminCustomersTable v-else :customers="filteredCustomers" />
  </section>
</template>
