<script setup>
import { computed, onMounted, ref } from 'vue'
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
const tab = ref('history')
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
    <AdminPageHeader title="Notifications" eyebrow="Communications" />
    <div v-if="error" class="admin-alert admin-error" role="alert">
      {{ error }}
    </div>
    <AdminMetrics :items="metrics" :loading="loading" />
    <div class="admin-segments mb-6">
      <button :aria-pressed="tab === 'history'" @click="tab = 'history'">
        Delivery history</button
      ><button :aria-pressed="tab === 'templates'" @click="tab = 'templates'">
        Template center
      </button>
    </div>
    <template v-if="tab === 'history'">
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
        are not real email sends.
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
              </td>
              <td data-label="Status">
                <span
                  class="admin-badge"
                  :class="{
                    'is-success': delivery.status === 'SENT',
                    'is-danger': delivery.status === 'FAILED',
                    'is-warning': delivery.status === 'PENDING',
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
    </template>
    <section v-else class="admin-form-section">
      <h2>Email template center</h2>
      <p class="admin-muted mt-3">Coming in a future phase.</p>
      <div class="grid gap-5 sm:grid-cols-2 mt-6">
        <div
          v-for="group in [
            'Account & security',
            'Order & tracking updates',
            'Customer support',
            'Promos & marketing',
          ]"
          :key="group"
        >
          <h3 class="font-medium">{{ group }}</h3>
          <p class="admin-muted mt-2">
            Template editing, previews, and audience approval are not connected
            yet.
          </p>
        </div>
      </div>
    </section>
  </section>
</template>
