<script setup>
import { computed, onMounted } from 'vue'
import AdminPageHeader from '../components/AdminPageHeader.vue'
import AdminMetrics from '../components/AdminMetrics.vue'
import { useAdminActivity } from '../composables/useAdminActivity'
import { fetchAdminNotifications } from '../api/adminNotifications.api'
import {
  formatAdminLabel,
  formatAdminDate,
} from '../utils/adminWorkspace.formatters'
const { data, filters, loading, error, load } = useAdminActivity(
  fetchAdminNotifications,
  { event: '', status: '' },
  75,
)
const metrics = computed(() =>
  ['total', 'sent', 'failed', 'mocked', 'pending', 'skipped'].map((key) => ({
    label: formatAdminLabel(key),
    value: data.value?.[key] ?? 'Unavailable',
  })),
)
onMounted(load)
</script>
<template>
  <section class="admin-page">
    <AdminPageHeader title="Notifications" eyebrow="Communications">
      <RouterLink class="admin-button" to="/admin/email-templates">
        Email templates
      </RouterLink>
    </AdminPageHeader>
    <div v-if="error" class="admin-alert admin-error" role="alert">
      {{ error }}
    </div>
    <AdminMetrics :items="metrics" :loading="loading" />
    <section aria-labelledby="delivery-history-title">
      <h2 id="delivery-history-title" class="mb-5">Delivery history</h2>
      <form class="admin-filters" @submit.prevent="load">
        <label class="admin-field grow"
          >Event<input v-model="filters.event" placeholder="ORDER_CONFIRMATION"
        /></label>
        <label class="admin-field"
          >Delivery status<select
            aria-label="Delivery status"
            v-model="filters.status"
          >
            <option value="">All statuses</option>
            <option
              v-for="status in [
                'SENT',
                'FAILED',
                'MOCKED',
                'PENDING',
                'QUEUED',
                'SKIPPED',
              ]"
              :key="status"
              :value="status"
            >
              {{ formatAdminLabel(status) }}
            </option>
          </select></label
        >
        <button class="admin-button" :disabled="loading">
          {{ loading ? 'Loading...' : 'Apply filters' }}
        </button>
      </form>
      <p class="admin-muted my-5">
        Latest {{ data?.recent?.length || 0 }} delivery records. Mocked records
        are not real email sends. Sent means accepted by the provider, not confirmed inbox delivery.
      </p>
      <p v-if="loading" class="admin-state" role="status">
        Loading delivery history...
      </p>
      <div v-else-if="data?.recent?.length" class="admin-table-wrap">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Recipient</th>
              <th>Event / subject</th>
              <th>Status</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="delivery in data.recent" :key="delivery.id">
              <td data-label="Recipient">{{ delivery.recipient }}</td>
              <td data-label="Event">
                <p class="font-medium">
                  {{ formatAdminLabel(delivery.event) }}
                </p>
                <p class="admin-muted text-xs">{{ delivery.subject }}</p>
                <span v-if="delivery.automatic === true && delivery.event === 'ORDER_CONFIRMATION'" class="admin-badge mt-2">Automatic receipt</span>
              </td>
              <td data-label="Status">
                <span
                  class="admin-badge"
                  :class="{
                    'is-success': delivery.status === 'SENT',
                    'is-danger': delivery.status === 'FAILED',
                    'is-warning': ['PENDING', 'QUEUED'].includes(delivery.status),
                  }"
                  >{{ formatAdminLabel(delivery.status) }}</span
                >
              </td>
              <td data-label="Created">
                {{ formatAdminDate(delivery.createdAt) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p v-else class="admin-state">
        {{
          error
            ? 'Delivery history unavailable. Apply filters to retry.'
            : 'No deliveries match these filters.'
        }}
      </p>
    </section>
  </section>
</template>
