<script setup>
import { computed, onMounted, ref } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import {
  fetchAdminOrderById,
  updateAdminOrderStatus,
} from '../api/adminOrders.api'
import {
  ORDER_STATUSES,
} from '../constants/adminOrders.constants'

const route = useRoute()
const order = ref(null)
const loading = ref(false)
const statusMessage = ref('')

const statusOptions = [
  ORDER_STATUSES.PENDING,
  ORDER_STATUSES.PAID,
  ORDER_STATUSES.PROCESSING,
  ORDER_STATUSES.SHIPPED,
  ORDER_STATUSES.DELIVERED,
  ORDER_STATUSES.CANCELLED,
  ORDER_STATUSES.REFUNDED,
]

const orderReference = computed(() =>
  order.value?.customerReference
  || order.value?.orderNumber
  || 'Pending',
)

const shippingAddress = computed(() => {
  if (!order.value) return 'N/A'

  return [
    order.value.address1,
    order.value.address2,
    [order.value.city, order.value.state, order.value.zip]
      .filter(Boolean)
      .join(', '),
    order.value.country,
  ]
    .filter(Boolean)
    .join(' · ') || 'N/A'
})

const campaignAttributions = computed(() =>
  Array.isArray(order.value?.campaignAttributions)
    ? order.value.campaignAttributions
    : [],
)

const sameCustomerOrders = computed(() =>
  Array.isArray(order.value?.sameCustomerOrders)
    ? order.value.sameCustomerOrders
    : [],
)

function formatPrice(value) {
  return Number(value || 0).toLocaleString(undefined, {
    style: 'currency',
    currency: 'USD',
  })
}

function formatDate(value) {
  if (!value) return 'N/A'
  return new Date(value).toLocaleString()
}

function statusClass(status) {
  if (status === ORDER_STATUSES.PENDING) return 'bg-amber-100 text-amber-700'
  if (status === ORDER_STATUSES.PAID) return 'bg-green-100 text-green-700'
  if (status === ORDER_STATUSES.PROCESSING) return 'bg-purple-100 text-purple-700'
  if (status === ORDER_STATUSES.SHIPPED) return 'bg-indigo-100 text-indigo-700'
  if (status === ORDER_STATUSES.DELIVERED) return 'bg-blue-100 text-blue-700'
  if (status === ORDER_STATUSES.CANCELLED) return 'bg-red-100 text-red-700'
  if (status === ORDER_STATUSES.REFUNDED) return 'bg-stone-200 text-stone-700'
  return 'bg-stone-200 text-stone-700'
}

async function updateStatus(value) {
  if (!order.value?.id) return

  statusMessage.value = 'Updating order...'

  try {
    order.value = await updateAdminOrderStatus(
      order.value.id,
      value,
    )
    statusMessage.value = 'Order updated.'
  } catch (error) {
    statusMessage.value = error.message || 'Unable to update order.'
  }
}

async function loadOrder() {
  loading.value = true
  statusMessage.value = ''

  try {
    order.value = await fetchAdminOrderById(
      route.params.orderId,
    )
  } catch {
    order.value = null
  } finally {
    loading.value = false
  }
}

onMounted(loadOrder)
</script>

<template>
  <main class="min-h-screen bg-[var(--brand-5)] text-slate-900">
    <section class="mx-auto max-w-6xl px-6 py-10 md:py-14">
      <div class="section-panel p-8 md:p-10">
        <div class="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p class="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-400">Admin / Orders</p>
            <h1 class="mt-2 text-3xl font-extrabold">Order Details</h1>
          </div>
          <RouterLink to="/admin/orders" class="rounded-lg border border-stone-700 px-4 py-2 text-sm font-semibold text-stone-700 transition hover:bg-white">
            Back to Orders
          </RouterLink>
        </div>

        <div v-if="loading" class="mt-6 text-sm text-stone-400">Loading order...</div>
        <div v-else-if="!order" class="mt-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm font-semibold text-red-700">
          Order not found.
        </div>

        <div v-else class="mt-8 space-y-6">
          <section class="rounded-2xl border border-[var(--brand-3)] bg-white p-5 shadow-sm">
            <div class="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <p class="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">Order reference</p>
                <p class="mt-1 text-2xl font-extrabold text-[var(--brand-4)]">{{ orderReference }}</p>
                <p class="mt-2 text-sm text-stone-400">Placed {{ formatDate(order.createdAt) }}</p>
                <p class="mt-1 break-all text-xs text-stone-400">Internal ID: {{ order.id }}</p>
              </div>

              <div class="flex flex-wrap gap-2 md:justify-end">
                <span :class="statusClass(order.status)" class="rounded-full px-3 py-1 text-xs font-semibold">
                  Order: {{ order.status }}
                </span>
              </div>
            </div>

            <div class="mt-5 grid gap-4 border-t border-stone-100 pt-5 md:grid-cols-3">
              <label class="block">
                <span class="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-stone-400">Order status</span>
                <select
                  :value="order.status"
                  class="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm font-semibold outline-none focus:border-emerald-400"
                  @change="updateStatus($event.target.value)"
                >
                  <option
                    v-for="status in statusOptions"
                    :key="status"
                    :value="status"
                  >
                    {{ status }}
                  </option>
                </select>
              </label>

              <div>
                <p class="text-xs font-semibold uppercase tracking-[0.14em] text-stone-400">Payment status</p>
                <p class="mt-2 text-sm font-bold text-[var(--brand-4)]">
                  {{ order.stripePaymentIntentId ? 'Stripe payment recorded' : 'No Stripe payment id stored' }}
                </p>
              </div>

              <div>
                <p class="text-xs font-semibold uppercase tracking-[0.14em] text-stone-400">Stripe PaymentIntent</p>
                <p class="mt-2 break-all text-xs font-semibold text-stone-500">
                  {{ order.stripePaymentIntentId || 'N/A' }}
                </p>
              </div>
            </div>

            <p v-if="statusMessage" class="mt-4 rounded-xl bg-[var(--brand-5)] px-4 py-3 text-sm font-semibold text-[var(--brand-4)]">
              {{ statusMessage }}
            </p>
          </section>

          <div class="grid gap-6 lg:grid-cols-[1.35fr_0.9fr]">
            <section class="rounded-2xl border border-[var(--brand-3)] bg-white p-5 shadow-sm">
              <div class="flex items-center justify-between gap-3">
                <h2 class="text-lg font-extrabold text-[var(--brand-4)]">Items</h2>
                <p class="text-sm font-semibold text-stone-400">{{ order.items.length }} item{{ order.items.length === 1 ? '' : 's' }}</p>
              </div>

              <div class="mt-4 divide-y divide-stone-100">
                <div v-for="item in order.items" :key="`${item.id}-${item.size}`" class="flex gap-4 py-4">
                  <div class="h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-stone-200 bg-[var(--brand-5)]">
                    <img
                      v-if="item.productImage"
                      :src="item.productImage"
                      :alt="item.productName"
                      class="h-full w-full object-cover"
                    />
                    <div v-else class="flex h-full w-full items-center justify-center text-xs font-bold text-stone-400">
                      No image
                    </div>
                  </div>

                  <div class="min-w-0 flex-1">
                    <div class="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p class="font-extrabold text-[var(--brand-4)]">{{ item.productName || 'Unnamed item' }}</p>
                        <p class="mt-1 text-sm text-stone-400">Variant: {{ item.size || 'N/A' }}</p>
                        <p class="mt-1 text-sm text-stone-400">SKU: {{ item.sku || 'N/A' }}</p>
                        <p class="mt-1 text-sm text-stone-400">{{ formatPrice(item.unitPrice) }} x {{ item.quantity }}</p>
                      </div>
                      <p class="font-extrabold text-[var(--brand-4)]">{{ formatPrice(item.lineTotal) }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <aside class="space-y-6">
              <section class="rounded-2xl border border-[var(--brand-3)] bg-white p-5 shadow-sm">
                <h2 class="text-lg font-extrabold text-[var(--brand-4)]">Pricing</h2>
                <div class="mt-4 space-y-3 text-sm">
                  <div class="flex justify-between gap-3">
                    <span class="text-stone-400">Subtotal</span>
                    <span class="font-bold">{{ formatPrice(order.subtotal) }}</span>
                  </div>
                  <div class="flex justify-between gap-3">
                    <span class="text-stone-400">Promo discount</span>
                    <span class="font-bold">-{{ formatPrice(order.discountAmount) }}</span>
                  </div>
                  <div v-if="order.promoUsage" class="rounded-xl bg-[var(--brand-5)] px-3 py-2 text-xs font-semibold text-stone-500">
                    Promo: {{ order.promoUsage.promoCode || 'Recorded promo' }}
                  </div>
                  <div class="flex justify-between gap-3">
                    <span class="text-stone-400">Shipping</span>
                    <span class="font-bold">{{ formatPrice(order.shippingAmount) }}</span>
                  </div>
                  <div class="flex justify-between gap-3">
                    <span class="text-stone-400">Tax</span>
                    <span class="font-bold">{{ formatPrice(order.taxAmount) }}</span>
                  </div>
                  <div class="flex justify-between gap-3">
                    <span class="text-stone-400">Donation generated</span>
                    <span class="font-bold text-[var(--success-1)]">{{ formatPrice(order.donationAmount) }}</span>
                  </div>
                </div>

                <div class="mt-4 border-t border-stone-100 pt-4">
                  <div class="flex justify-between gap-3 text-lg">
                    <span class="font-extrabold">Total</span>
                    <span class="font-extrabold text-[var(--brand-4)]">{{ formatPrice(order.total) }}</span>
                  </div>
                </div>
              </section>

              <section class="rounded-2xl border border-[var(--brand-3)] bg-white p-5 shadow-sm">
                <h2 class="text-lg font-extrabold text-[var(--brand-4)]">Campaign Attribution</h2>
                <div v-if="campaignAttributions.length" class="mt-4 space-y-3">
                  <div
                    v-for="campaign in campaignAttributions"
                    :key="campaign.id"
                    class="rounded-xl border border-stone-200 bg-[var(--brand-5)] p-3 text-sm"
                  >
                    <p class="font-extrabold text-[var(--brand-4)]">{{ campaign.campaignName || campaign.campaignId }}</p>
                    <p class="mt-1 text-stone-500">Eligible subtotal: {{ formatPrice(campaign.eligibleSubtotal) }}</p>
                    <p class="mt-1 font-bold text-[var(--success-1)]">Donation: {{ formatPrice(campaign.donationAmount) }}</p>
                  </div>
                </div>
                <p v-else class="mt-4 text-sm text-stone-400">
                  No campaign attribution was recorded for this order.
                </p>
              </section>
            </aside>
          </div>

          <div class="grid gap-6 md:grid-cols-2">
            <section class="rounded-2xl border border-[var(--brand-3)] bg-white p-5 shadow-sm">
              <h2 class="text-lg font-extrabold text-[var(--brand-4)]">Customer</h2>
              <div class="mt-3 space-y-2 text-sm">
                <p><span class="font-semibold text-stone-400">Name:</span> {{ order.customerName || 'N/A' }}</p>
                <p><span class="font-semibold text-stone-400">Email:</span> {{ order.customerEmail || 'N/A' }}</p>
                <p><span class="font-semibold text-stone-400">Phone:</span> {{ order.customerPhone || 'N/A' }}</p>
                <p><span class="font-semibold text-stone-400">Marketing opt-in:</span> {{ order.marketingOptIn ? 'Yes' : 'No' }}</p>
                <p><span class="font-semibold text-stone-400">Saved info:</span> {{ order.saveInfo ? 'Yes' : 'No' }}</p>
              </div>
            </section>

            <section class="rounded-2xl border border-[var(--brand-3)] bg-white p-5 shadow-sm">
              <h2 class="text-lg font-extrabold text-[var(--brand-4)]">Shipping</h2>
              <div class="mt-3 space-y-2 text-sm">
                <p><span class="font-semibold text-stone-400">Address:</span> {{ shippingAddress }}</p>
                <p><span class="font-semibold text-stone-400">Delivery notes:</span> {{ order.deliveryNotes || 'N/A' }}</p>
                <p><span class="font-semibold text-stone-400">Expectation:</span> Pack and ship according to the selected fulfillment queue.</p>
              </div>
            </section>
          </div>

          <section class="rounded-2xl border border-[var(--brand-3)] bg-white p-5 shadow-sm">
            <h2 class="text-lg font-extrabold text-[var(--brand-4)]">Other Orders From This Customer</h2>
            <div v-if="sameCustomerOrders.length" class="mt-4 grid gap-3 md:grid-cols-2">
              <RouterLink
                v-for="customerOrder in sameCustomerOrders"
                :key="customerOrder.id"
                :to="`/admin/orders/${customerOrder.id}`"
                class="rounded-xl border border-stone-200 bg-[var(--brand-5)] p-4 text-sm transition hover:border-emerald-400"
              >
                <p class="font-extrabold text-[var(--brand-4)]">
                  {{ customerOrder.customerReference || customerOrder.orderNumber || customerOrder.id }}
                </p>
                <p class="mt-1 text-stone-500">{{ formatDate(customerOrder.createdAt) }}</p>
                <p class="mt-2 font-bold">{{ formatPrice(customerOrder.total) }} · {{ customerOrder.status }}</p>
              </RouterLink>
            </div>
            <p v-else class="mt-4 text-sm text-stone-400">
              No other orders found for this customer email.
            </p>
          </section>
        </div>
      </div>
    </section>
  </main>
</template>
