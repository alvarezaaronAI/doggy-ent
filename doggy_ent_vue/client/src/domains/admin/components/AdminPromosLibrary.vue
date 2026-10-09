<script setup>
import {
  PROMO_STATUS_OPTIONS,
  PROMO_TYPE_OPTIONS,
} from '@promos/constants/promo.constants'
import {
  formatPromoDiscount,
  formatPromoUsageLimit,
  formatPromoStatus,
  formatPromoType,
} from '@promos/utils/promo.utils'
import AdminIcon from './AdminIcon.vue'
defineProps({
  filteredPromos: { type: Array, required: true },
  promos: { type: Array, required: true },
  promoGroups: Array,
  isLoading: Boolean,
})
const promoSearchQuery = defineModel('promoSearchQuery', {
  type: String,
  required: true,
})
const promoTypeFilter = defineModel('promoTypeFilter', {
  type: String,
  required: true,
})
const promoStatusFilter = defineModel('promoStatusFilter', {
  type: String,
  required: true,
})
const emit = defineEmits([
  'analytics',
  'clear-filters',
  'delete',
  'edit',
  'refresh',
  'test',
])
</script>
<template>
  <section>
    <div class="admin-filters">
      <label class="admin-field grow"
        >Search promos<input
          v-model="promoSearchQuery"
          type="search"
          placeholder="Code, name, email or referral owner"
      /></label>
      <label class="admin-field"
        >Type<select aria-label="Type" v-model="promoTypeFilter">
          <option value="all">All types</option>
          <option
            v-for="o in PROMO_TYPE_OPTIONS"
            :key="o.value"
            :value="o.value"
          >
            {{ o.label }}
          </option>
        </select></label
      >
      <label class="admin-field"
        >Status<select aria-label="Status" v-model="promoStatusFilter">
          <option value="all">All statuses</option>
          <option
            v-for="o in PROMO_STATUS_OPTIONS"
            :key="o.value"
            :value="o.value"
          >
            {{ o.label }}
          </option>
        </select></label
      >
      <button
        class="admin-icon-button"
        title="Refresh promos"
        aria-label="Refresh promos"
        :disabled="isLoading"
        @click="emit('refresh')"
      >
        <AdminIcon name="refresh" />
      </button>
      <button class="admin-link" @click="emit('clear-filters')">Clear</button>
    </div>
    <p class="admin-muted my-4">
      {{ filteredPromos.length }} of {{ promos.length }} codes
    </p>
    <p v-if="isLoading" class="admin-state" role="status">Loading promos...</p>
    <p v-else-if="!filteredPromos.length" class="admin-state">
      {{
        promos.length ? 'No codes match your filters.' : 'No promo codes yet.'
      }}
    </p>
    <div v-else class="admin-table-wrap">
      <table class="admin-table">
        <thead>
          <tr>
            <th>Code</th>
            <th>Discount</th>
            <th>Usage</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="promo in filteredPromos" :key="promo.id">
            <td data-label="Code">
              <button
                class="admin-link font-semibold"
                @click="emit('edit', promo)"
              >
                {{ promo.code }}
              </button>
              <p class="admin-muted">{{ promo.name }}</p>
              <p class="admin-muted text-xs">
                {{ formatPromoType(promo.type)
                }}<span v-if="promo.assignedCustomerEmail">
                  · {{ promo.assignedCustomerEmail }}</span
                ><span v-if="promo.referralOwnerName">
                  · {{ promo.referralOwnerName }}</span
                >
              </p>
            </td>
            <td data-label="Discount">
              {{ formatPromoDiscount(promo) }}
              <p class="admin-muted text-xs">
                Min. {{ '$' + Number(promo.minimumSubtotal || 0).toFixed(2) }}
              </p>
            </td>
            <td data-label="Usage">
              {{ promo.usedCount || 0 }} /
              {{ formatPromoUsageLimit(promo.usageLimitTotal) }}
              <p class="admin-muted text-xs">
                {{ formatPromoUsageLimit(promo.usageLimitPerCustomer) }} per
                email
              </p>
            </td>
            <td data-label="Status">
              <span
                class="admin-badge"
                :class="{
                  'is-success': promo.status === 'ACTIVE',
                  'is-warning': promo.status === 'DRAFT',
                }"
                >{{ formatPromoStatus(promo.status) }}</span
              >
            </td>
            <td>
              <div class="flex gap-1">
                <button
                  v-for="action in [
                    { event: 'test', icon: 'test', label: 'Test' },
                    { event: 'analytics', icon: 'reports', label: 'Analytics' },
                    { event: 'edit', icon: 'edit', label: 'Edit' },
                    { event: 'delete', icon: 'delete', label: 'Delete' },
                  ]"
                  :key="action.event"
                  class="admin-icon-button"
                  :title="action.label + ' ' + promo.code"
                  :aria-label="action.label + ' ' + promo.code"
                  @click="emit(action.event, promo)"
                >
                  <AdminIcon :name="action.icon" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>
