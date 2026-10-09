<template>
  <header class="account-heading">
    <h1>Your orders</h1>
    <p>Find an order, check its status, or get help.</p>
  </header>
  <div class="grid gap-4 sm:grid-cols-[minmax(0,1fr)_180px]">
    <label class="account-field"
      >Search your history<input
        v-model="query"
        class="account-input"
        type="search"
        placeholder="Order number or product"
    /></label>
    <label class="account-field"
      >Status<select v-model="status" class="account-input" aria-label="Status">
        <option value="">All orders</option>
        <option v-for="value in statuses" :key="value" :value="value">
          {{ formatAccountLabel(value) }}
        </option>
      </select></label
    >
  </div>
  <p v-if="loading" role="status" class="account-muted mt-6">Loading your orders...</p>
  <div v-else class="account-row my-6">
    <p class="account-muted text-sm">
      {{ orders.length }} {{ orders.length === 1 ? 'order' : 'orders' }} in your history &middot;
      {{ visible.length }} loaded<span v-if="query || status">
        &middot; {{ filtered.length }} matching</span
      >
    </p>
    <button
      class="account-icon-button"
      type="button"
      title="Refresh orders"
      aria-label="Refresh orders"
      @click="loadOrders"
    >
      <i class="fa-solid fa-arrow-rotate-right" aria-hidden="true"></i>
    </button>
  </div>
  <p v-if="error" role="alert" class="account-error mb-5">
    {{ error }} <button type="button" class="account-link" @click="loadOrders">Try again</button>
  </p>
  <div
    v-if="visible.length"
    class="account-order-layout border-t border-[var(--account-line)] pt-6"
  >
    <section :class="{ 'hidden min-[601px]:block': showMobileDetail }" aria-label="Order history">
      <div v-for="group in groups" :key="group.key">
        <button
          class="account-month-toggle"
          type="button"
          :aria-expanded="Boolean(expanded[group.key])"
          :aria-controls="`orders-${group.key}`"
          @click="expanded[group.key] = !expanded[group.key]"
        >
          <span>{{ group.label }}</span
          ><span class="account-muted flex items-center gap-4"
            >{{ group.orders.length
            }}<i
              class="fa-solid text-xs"
              :class="expanded[group.key] ? 'fa-chevron-up' : 'fa-chevron-down'"
              aria-hidden="true"
            ></i
          ></span>
        </button>
        <div v-show="expanded[group.key]" :id="`orders-${group.key}`">
          <button
            v-for="order in group.orders"
            :key="orderReference(order)"
            class="account-order-option"
            :class="{ 'is-selected': orderReference(order) === selectedKey }"
            type="button"
            :aria-pressed="orderReference(order) === selectedKey"
            @click="selectOrder(orderReference(order))"
          >
            <div class="flex justify-between gap-3">
              <strong class="font-semibold">{{ orderReference(order) }}</strong
              ><span>{{ formatCurrency(order.total, { currency: order.currency || 'USD' }) }}</span>
            </div>
            <p class="account-muted my-2 text-xs">
              {{ formatAccountDate(order.createdAt, { short: true }) }} &middot;
              {{ orderItemCount(order) }} {{ orderItemCount(order) === 1 ? 'item' : 'items' }}
            </p>
            <AccountStatusBadge :status="order.status" />
          </button>
        </div>
      </div>
      <button
        v-if="visible.length < filtered.length"
        type="button"
        class="account-button mt-7 w-full"
        @click="limit += ORDER_HISTORY_PAGE_SIZE"
      >
        Load more orders
      </button>
    </section>
    <section
      class="account-order-detail"
      :class="{ 'hidden min-[601px]:block': !showMobileDetail }"
      aria-label="Selected order"
      aria-live="polite"
    >
      <button
        class="account-link mb-6 min-[601px]:hidden"
        type="button"
        @click="showMobileDetail = false"
      >
        <i class="fa-solid fa-arrow-left mr-2" aria-hidden="true"></i>Back to orders
      </button>
      <p v-if="detailLoading" role="status" class="account-muted">Loading order details...</p>
      <p v-else-if="detailError" role="alert" class="account-error">
        {{ detailError }}
        <button class="account-link" type="button" @click="loadDetail">Try again</button>
      </p>
      <AccountOrderDetails
        v-else-if="detail"
        :key="selectedKey"
        :order="detail"
        @issue-created="appendIssue"
      />
    </section>
  </div>
  <div v-else-if="!loading && !error" class="account-empty border-t border-[var(--account-line)]">
    <h2>{{ orders.length ? 'No matching orders' : 'Your order history starts here' }}</h2>
    <p class="mt-2">
      {{
        orders.length
          ? 'Try another search or status.'
          : 'Once you place an order, you can follow it here.'
      }}
    </p>
    <button v-if="orders.length" class="account-button mt-5" type="button" @click="clearFilters">
      Clear filters</button
    ><RouterLink v-else to="/#shop" class="account-button mt-5">Explore treats</RouterLink>
  </div>
</template>

<script setup>
import AccountStatusBadge from '../components/AccountStatusBadge.vue'
import AccountOrderDetails from '../components/AccountOrderDetails.vue'
import { useAccountOrderHistory } from '../composables/useAccountOrderHistory.js'
import { ORDER_HISTORY_PAGE_SIZE } from '../constants/account.constants.js'
import {
  formatAccountDate,
  formatAccountLabel,
  orderItemCount,
  orderReference,
} from '../utils/accountFormatting.js'
import { formatCurrency } from '@shared/utils/currency'
defineOptions({ name: 'AccountOrdersView' })
const {
  orders,
  loading,
  error,
  query,
  status,
  limit,
  statuses,
  filtered,
  visible,
  groups,
  expanded,
  selectedKey,
  detail,
  detailLoading,
  detailError,
  showMobileDetail,
  selectOrder,
  loadOrders,
  loadDetail,
} = useAccountOrderHistory()
function appendIssue(issue) {
  detail.value.support.issues = [issue, ...(detail.value.support.issues || [])]
}
function clearFilters() {
  query.value = ''
  status.value = ''
}
</script>
