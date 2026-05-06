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
            ← Back to Orders
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
                <p class="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">Order ID</p>
                <p class="mt-1 text-xl font-extrabold text-[var(--brand-4)]">{{ order.id }}</p>
                <p class="mt-1 text-sm text-stone-400">Placed {{ formatDate(order.createdAt) }}</p>
              </div>

              <div class="flex flex-wrap gap-2 md:justify-end">
                <span :class="statusClass(order.status)" class="rounded-full px-3 py-1 text-xs font-semibold">
                  Order: {{ order.status }}
                </span>
                <span :class="paymentClass(order.paymentStatus)" class="rounded-full px-3 py-1 text-xs font-semibold">
                  Payment: {{ order.paymentStatus }}
                </span>
                <span :class="fulfillmentClass(order.fulfillmentStatus)" class="rounded-full px-3 py-1 text-xs font-semibold">
                  Fulfillment: {{ order.fulfillmentStatus }}
                </span>
              </div>
            </div>

            <div class="mt-5 grid gap-4 border-t border-stone-100 pt-5 md:grid-cols-3">
              <label class="block">
                <span class="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-stone-400">Order status</span>
                <select
                  :value="order.status"
                  class="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm font-semibold outline-none focus:border-emerald-400"
                  @change="updateStatus('status', $event.target.value)"
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </label>

              <label class="block">
                <span class="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-stone-400">Payment status</span>
                <select
                  :value="order.paymentStatus"
                  class="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm font-semibold outline-none focus:border-emerald-400"
                  @change="updateStatus('payment', $event.target.value)"
                >
                  <option value="not_paid">Not paid</option>
                  <option value="paid">Paid</option>
                  <option value="refunded">Refunded</option>
                </select>
              </label>

              <label class="block">
                <span class="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-stone-400">Fulfillment status</span>
                <select
                  :value="order.fulfillmentStatus"
                  class="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm font-semibold outline-none focus:border-emerald-400"
                  @change="updateStatus('fulfillment', $event.target.value)"
                >
                  <option value="unfulfilled">Unfulfilled</option>
                  <option value="packed">Packed</option>
                  <option value="shipped">Shipped</option>
                  <option value="fulfilled">Fulfilled</option>
                </select>
              </label>
            </div>

            <p v-if="statusMessage" class="mt-4 rounded-xl bg-[var(--brand-5)] px-4 py-3 text-sm font-semibold text-[var(--brand-4)]">
              {{ statusMessage }}
            </p>
          </section>

          <div class="grid gap-6 lg:grid-cols-[1.4fr_0.9fr]">
            <section class="rounded-2xl border border-[var(--brand-3)] bg-white p-5 shadow-sm">
              <div class="flex items-center justify-between gap-3">
                <h2 class="text-lg font-extrabold text-[var(--brand-4)]">Receipt</h2>
                <p class="text-sm font-semibold text-stone-400">{{ order.items.length }} item{{ order.items.length === 1 ? '' : 's' }}</p>
              </div>

              <div class="mt-4 divide-y divide-stone-100">
                <div v-for="item in order.items" :key="`${item.id}-${item.size}`" class="flex gap-4 py-4">
                  <div class="h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-stone-200 bg-[var(--brand-5)]">
                    <img
                      v-if="item.image"
                      :src="item.image"
                      :alt="item.name"
                      class="h-full w-full object-cover"
                    />
                    <div v-else class="flex h-full w-full items-center justify-center text-xs font-bold text-stone-400">
                      No image
                    </div>
                  </div>

                  <div class="min-w-0 flex-1">
                    <div class="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p class="font-extrabold text-[var(--brand-4)]">{{ item.name || 'Unnamed item' }}</p>
                        <p class="mt-1 text-sm text-stone-400">Size: {{ item.size || 'N/A' }}</p>
                        <p class="mt-1 text-sm text-stone-400">{{ formatPrice(item.price) }} × {{ item.quantity }}</p>
                      </div>
                      <p class="font-extrabold text-[var(--brand-4)]">{{ formatPrice(item.price * item.quantity) }}</p>
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
                    <span class="font-bold">{{ formatPrice(order.pricing.subtotal) }}</span>
                  </div>
                  <div class="flex justify-between gap-3">
                    <span class="text-stone-400">Discount</span>
                    <span class="font-bold text-[var(--success-1)]">-{{ formatPrice(order.pricing.discountAmount) }}</span>
                  </div>
                  <div class="flex justify-between gap-3">
                    <span class="text-stone-400">Shipping</span>
                    <span class="font-bold">{{ formatPrice(order.pricing.shippingAmount) }}</span>
                  </div>
                  <div class="flex justify-between gap-3">
                    <span class="text-stone-400">Tax</span>
                    <span class="font-bold">{{ formatPrice(order.pricing.tax) }}</span>
                  </div>
                  <div v-if="order.pricing.donationAmount" class="flex justify-between gap-3">
                    <span class="text-stone-400">Donation generated</span>
                    <span class="font-bold text-[var(--success-1)]">{{ formatPrice(order.pricing.donationAmount) }}</span>
                  </div>
                </div>

                <div class="mt-4 border-t border-stone-100 pt-4">
                  <div class="flex justify-between gap-3 text-lg">
                    <span class="font-extrabold">Total</span>
                    <span class="font-extrabold text-[var(--brand-4)]">{{ formatPrice(order.pricing.total) }}</span>
                  </div>
                </div>
              </section>

              <section v-if="order.promo" class="rounded-2xl border border-[var(--brand-3)] bg-white p-5 shadow-sm">
                <h2 class="text-lg font-extrabold text-[var(--brand-4)]">Promo</h2>
                <p class="mt-2 text-sm font-bold">{{ order.promo.code || 'Promo applied' }}</p>
                <p class="mt-1 text-sm text-stone-400">Discount: {{ formatPrice(order.promo.discountAmount || order.pricing.discountAmount) }}</p>
              </section>

              <section v-if="order.campaigns?.length" class="rounded-2xl border border-green-200 bg-green-50 p-5 shadow-sm">
                <h2 class="text-lg font-extrabold text-green-800">Donation impact</h2>
                <div class="mt-3 space-y-3">
                  <div v-for="campaign in order.campaigns" :key="campaign.campaignId" class="rounded-xl bg-white/70 p-3 text-sm text-green-800">
                    <p class="font-bold">{{ campaign.campaignName }}</p>
                    <p class="mt-1">Supports {{ campaign.donationTarget }}</p>
                    <p class="mt-1 font-extrabold">{{ formatPrice(campaign.donationAmount) }}</p>
                  </div>
                </div>
              </section>
            </aside>
          </div>

          <div class="grid gap-6 md:grid-cols-2">
            <section class="rounded-2xl border border-[var(--brand-3)] bg-white p-5 shadow-sm">
              <h2 class="text-lg font-extrabold text-[var(--brand-4)]">Customer / Account</h2>
              <div class="mt-3 space-y-2 text-sm">
                <p><span class="font-semibold text-stone-400">Name:</span> {{ fullName }}</p>
                <p><span class="font-semibold text-stone-400">Email:</span> {{ order.customer.email || 'N/A' }}</p>
                <p><span class="font-semibold text-stone-400">Phone:</span> {{ order.customer.phone || 'N/A' }}</p>
                <p><span class="font-semibold text-stone-400">Marketing opt-in:</span> {{ order.customer.marketingOptIn ? 'Yes' : 'No' }}</p>
                <p><span class="font-semibold text-stone-400">Save info:</span> {{ order.customer.saveInfo ? 'Yes' : 'No' }}</p>
              </div>
            </section>

            <section class="rounded-2xl border border-[var(--brand-3)] bg-white p-5 shadow-sm">
              <h2 class="text-lg font-extrabold text-[var(--brand-4)]">Shipping address</h2>
              <div class="mt-3 space-y-1 text-sm">
                <p>{{ order.customer.address1 || 'No address line 1' }}</p>
                <p v-if="order.customer.address2">{{ order.customer.address2 }}</p>
                <p>{{ cityStateZip }}</p>
                <p>{{ order.customer.country || 'US' }}</p>
              </div>

              <div class="mt-4 rounded-xl bg-[var(--brand-5)] p-3 text-sm">
                <p class="font-semibold text-stone-400">Shipping method</p>
                <p class="mt-1 font-bold text-[var(--brand-4)]">{{ order.shipping.method }} · {{ formatPrice(order.shipping.price) }}</p>
              </div>
            </section>
          </div>

          <section v-if="order.customer.notes" class="rounded-2xl border border-[var(--brand-3)] bg-white p-5 shadow-sm">
            <h2 class="text-lg font-extrabold text-[var(--brand-4)]">Customer notes</h2>
            <p class="mt-2 text-sm text-stone-500">{{ order.customer.notes }}</p>
          </section>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const order = ref(null)
const loading = ref(false)
const statusMessage = ref('')

const fullName = computed(() => {
  if (!order.value) return 'N/A'
  const name = `${order.value.customer.firstName || ''} ${order.value.customer.lastName || ''}`.trim()
  return name || 'N/A'
})

const cityStateZip = computed(() => {
  if (!order.value) return 'N/A'
  const city = order.value.customer.city || ''
  const state = order.value.customer.state || ''
  const zip = order.value.customer.zip || ''
  const line = [city, state, zip].filter(Boolean).join(', ')
  return line || 'No city/state/ZIP'
})

function formatPrice(v) {
  return Number(v || 0).toLocaleString(undefined, { style: 'currency', currency: 'USD' })
}

function formatDate(value) {
  if (!value) return 'N/A'
  return new Date(value).toLocaleString()
}

function statusClass(status) {
  if (status === 'pending') return 'bg-amber-100 text-amber-700'
  if (status === 'confirmed') return 'bg-green-100 text-green-700'
  if (status === 'cancelled') return 'bg-red-100 text-red-700'
  return 'bg-stone-200 text-stone-700'
}

function paymentClass(status) {
  if (status === 'paid') return 'bg-green-100 text-green-700'
  if (status === 'not_paid') return 'bg-red-100 text-red-700'
  return 'bg-stone-200 text-stone-700'
}

function fulfillmentClass(status) {
  if (status === 'fulfilled') return 'bg-blue-100 text-blue-700'
  if (status === 'shipped') return 'bg-indigo-100 text-indigo-700'
  if (status === 'packed') return 'bg-purple-100 text-purple-700'
  if (status === 'unfulfilled') return 'bg-amber-100 text-amber-700'
  return 'bg-stone-200 text-stone-700'
}

async function updateStatus(type, value) {
  if (!order.value?.id) return

  const endpointMap = {
    status: {
      url: `/api/admin/orders/${order.value.id}/status`,
      body: { status: value },
    },
    payment: {
      url: `/api/admin/orders/${order.value.id}/payment-status`,
      body: { paymentStatus: value },
    },
    fulfillment: {
      url: `/api/admin/orders/${order.value.id}/fulfillment-status`,
      body: { fulfillmentStatus: value },
    },
  }

  const config = endpointMap[type]
  if (!config) return

  statusMessage.value = 'Updating order...'

  try {
    const res = await fetch(config.url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(config.body),
    })

    const data = await res.json()

    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Unable to update order.')
    }

    order.value = data.order
    statusMessage.value = 'Order status updated.'
  } catch (error) {
    statusMessage.value = error.message || 'Unable to update order.'
  }
}

async function loadOrder() {
  loading.value = true
  try {
    const res = await fetch(`/api/admin/orders/${route.params.orderId}`)
    const data = await res.json()

    if (res.ok && data.success) {
      order.value = data.order
    }
  } catch (e) {
    // ignore for now
  } finally {
    loading.value = false
  }
}

onMounted(loadOrder)
</script>