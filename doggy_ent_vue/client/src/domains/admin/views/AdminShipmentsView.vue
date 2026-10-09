<script setup>
import { computed, onMounted } from 'vue'
import AdminPageHeader from '../components/AdminPageHeader.vue'
import AdminMetrics from '../components/AdminMetrics.vue'
import { useAdminActivity } from '../composables/useAdminActivity'
import { fetchAdminShipments } from '../api/adminShipments.api'
import {
  formatAdminDate,
  formatAdminLabel,
} from '../utils/adminWorkspace.formatters'
const { data, filters, loading, error, load } = useAdminActivity(
  fetchAdminShipments,
  { status: '' },
  100,
)
const metrics = computed(() => [
  { label: 'Tracking records', value: data.value?.total ?? 'Unavailable' },
  { label: 'Shipped', value: data.value?.shipped ?? 'Unavailable' },
  { label: 'Delivered', value: data.value?.delivered ?? 'Unavailable' },
  { label: 'Needs review', value: data.value?.failed ?? 'Unavailable' },
])
onMounted(load)
</script>
<template>
  <section class="admin-page">
    <AdminPageHeader title="Shipments" eyebrow="Store operations" />
    <div v-if="error" class="admin-alert admin-error" role="alert">
      {{ error }}
    </div>
    <AdminMetrics :loading="loading" :items="metrics" />
    <div class="admin-row flex-wrap mb-6">
      <p class="admin-muted">Carrier tracking</p>
      <span
        class="admin-badge"
        :class="{ 'is-success': data?.providerConfigured }"
        >{{
          !data
            ? 'Provider status unavailable'
            : data.providerConfigured
              ? 'Shippo configured'
              : 'Manual tracking mode'
        }}</span
      >
    </div>
    <form class="admin-filters" @submit.prevent="load">
      <label class="admin-field grow"
        >Shipment status<select
          aria-label="Shipment status"
          v-model="filters.status"
        >
          <option value="">All statuses</option>
          <option
            v-for="status in [
              'UNKNOWN',
              'PRE_TRANSIT',
              'TRANSIT',
              'OUT_FOR_DELIVERY',
              'DELIVERED',
              'RETURNED',
              'FAILURE',
            ]"
            :key="status"
            :value="status"
          >
            {{ formatAdminLabel(status) }}
          </option>
        </select></label
      ><button class="admin-button" :disabled="loading">
        {{ loading ? 'Loading...' : 'Apply filters' }}
      </button>
    </form>
    <p class="admin-muted my-5">
      Latest {{ data?.recent?.length || 0 }} tracking records
    </p>
    <p v-if="loading" class="admin-state" role="status">Loading shipments...</p>
    <div v-else-if="data?.recent?.length" class="admin-table-wrap">
      <table class="admin-table">
        <thead>
          <tr>
            <th>Order</th>
            <th>Carrier / tracking</th>
            <th>Status</th>
            <th>Delivery &amp; activity</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="shipment in data.recent" :key="shipment.id">
            <td data-label="Order">
              <RouterLink
                v-if="shipment.orderId"
                class="admin-link font-semibold"
                :to="'/admin/orders/' + shipment.orderId"
                >{{
                  shipment.order?.customerReference ||
                  shipment.order?.orderNumber ||
                  shipment.orderId
                }}</RouterLink
              >
              <p class="admin-muted text-xs">
                {{ shipment.order?.customerName }}
              </p>
              <p class="admin-muted text-xs">
                {{ shipment.order?.customerEmail }}
              </p>
            </td>
            <td data-label="Tracking">
              <p class="font-medium">{{ shipment.carrier }}</p>
              <p>{{ shipment.trackingNumber }}</p>
            </td>
            <td data-label="Status">
              <span
                class="admin-badge"
                :class="{
                  'is-success': shipment.shipmentStatus === 'DELIVERED',
                  'is-danger': shipment.shipmentStatus === 'FAILURE',
                  'is-info': shipment.shipmentStatus === 'TRANSIT',
                }"
                >{{ formatAdminLabel(shipment.shipmentStatus) }}</span
              >
            </td>
            <td data-label="Activity">
              <p class="admin-muted text-xs">
                Synced {{ formatAdminDate(shipment.lastSyncedAt) }}
              </p>
              <p class="admin-muted text-xs">
                Estimated {{ formatAdminDate(shipment.estimatedDelivery) }}
              </p>
              <p v-if="shipment.deliveredAt" class="admin-muted text-xs">
                Delivered {{ formatAdminDate(shipment.deliveredAt) }}
              </p>
              <details v-if="shipment.events?.length" class="mt-3">
                <summary class="admin-link cursor-pointer">
                  Carrier events ({{ shipment.events.length }})
                </summary>
                <ol class="admin-timeline mt-3">
                  <li
                    v-for="event in shipment.events"
                    :key="event.id || event.status + event.occurredAt"
                  >
                    <p>{{ formatAdminLabel(event.status) }}</p>
                    <p class="admin-muted text-xs">
                      {{ event.location }} ·
                      {{ formatAdminDate(event.occurredAt) }}
                    </p>
                  </li>
                </ol>
              </details>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <p v-else class="admin-state">
      {{
        error
          ? 'Shipment history unavailable. Apply filters to retry.'
          : 'No shipments match these filters.'
      }}
    </p>
  </section>
</template>
