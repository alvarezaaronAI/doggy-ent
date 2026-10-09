<script setup>
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import AdminPageHeader from '../components/AdminPageHeader.vue'
import AdminIcon from '../components/AdminIcon.vue'
import AdminOrderStatusPanel from '../components/AdminOrderStatusPanel.vue'
import AdminOrderNotificationsPanel from '../components/AdminOrderNotificationsPanel.vue'
import AdminOrderTrackingPanel from '../components/AdminOrderTrackingPanel.vue'
import { useAdminOrderDetail } from '../composables/useAdminOrderDetail'
const {
  order,
  loading,
  trackingSaving,
  notificationSaving,
  statusSaving,
  statusMessage,
  error,
  orderReference,
  shippingAddress,
  campaignAttributions,
  sameCustomerOrders,
  formatPrice,
  formatDate,
  statusClass,
  updateStatus,
  updateTracking,
  refreshTracking,
  resendOrderEmail,
  loadOrder,
} = useAdminOrderDetail(useRoute().params.orderId)
onMounted(loadOrder)
</script>
<template>
  <section class="admin-page">
    <RouterLink class="admin-link mb-5" to="/admin/orders"
      ><AdminIcon name="back" /> All orders</RouterLink
    >
    <AdminPageHeader
      :title="'Order ' + orderReference"
      eyebrow="Store operations"
    />
    <p v-if="loading" class="admin-state" role="status">Loading order...</p>
    <div v-else-if="!order" class="admin-alert admin-error" role="alert">
      {{ error || 'Order not found.'
      }}<button class="admin-link ml-3" @click="loadOrder">Retry</button>
    </div>
    <template v-else>
      <div class="flex flex-wrap gap-4 admin-muted mb-6">
        <p>Placed {{ formatDate(order.createdAt) }}</p>
        <span class="admin-badge" :class="statusClass(order.status)">{{
          order.status
        }}</span>
      </div>
      <p v-if="statusMessage" class="admin-alert" role="status">
        {{ statusMessage }}
      </p>
      <div class="admin-editor">
        <div class="min-w-0">
          <section class="admin-form-section">
            <h2>Items</h2>
            <div
              v-for="item in order.items"
              :key="item.id + '-' + item.size"
              class="admin-row py-5"
            >
              <img
                v-if="item.productImage"
                :src="item.productImage"
                :alt="item.productName"
                class="w-16 h-16 object-contain shrink-0 border border-[var(--admin-line)] rounded-md bg-white"
              />
              <AdminIcon v-else name="products" />
              <div class="min-w-0 grow">
                <p class="font-semibold">
                  {{ item.productName || 'Unnamed item' }}
                </p>
                <p class="admin-muted">
                  {{ item.size || 'No variant' }} · Qty {{ item.quantity }}
                </p>
                <p class="admin-muted text-xs">
                  SKU {{ item.sku || 'Unavailable' }} ·
                  {{ formatPrice(item.unitPrice) }} each
                </p>
              </div>
              <span class="font-semibold">{{
                formatPrice(item.lineTotal)
              }}</span>
            </div>
          </section>
          <AdminOrderStatusPanel
            :order="order"
            :status-class="statusClass"
            :saving="statusSaving"
            @save="updateStatus"
          />
          <details class="admin-form-section">
            <summary class="font-semibold cursor-pointer">
              Tracking &amp; shipment
            </summary>
            <AdminOrderTrackingPanel
              :order="order"
              :saving="trackingSaving"
              @save="updateTracking"
              @refresh="refreshTracking"
            />
          </details>
          <details class="admin-form-section">
            <summary class="font-semibold cursor-pointer">
              Customer email updates
            </summary>
            <AdminOrderNotificationsPanel
              :deliveries="order.emailDeliveries || []"
              :disabled="notificationSaving"
              @resend="resendOrderEmail"
            />
          </details>
          <section class="admin-form-section">
            <h2>Campaign attribution</h2>
            <div
              v-for="campaign in campaignAttributions"
              :key="campaign.id"
              class="admin-row py-3"
            >
              <div>
                <p class="font-medium">
                  {{ campaign.campaignName || campaign.campaignId }}
                </p>
                <p class="admin-muted">
                  Eligible subtotal {{ formatPrice(campaign.eligibleSubtotal) }}
                </p>
              </div>
              <strong>{{ formatPrice(campaign.donationAmount) }}</strong>
            </div>
            <p v-if="!campaignAttributions.length" class="admin-muted mt-3">
              No campaign attribution recorded.
            </p>
          </section>
        </div>
        <aside class="admin-editor-aside">
          <h2>Order summary</h2>
          <dl class="mt-5 space-y-3">
            <div
              v-for="line in [
                { label: 'Subtotal', value: order.subtotal },
                {
                  label: 'Discount',
                  value: -Number(order.discountAmount || 0),
                },
                { label: 'Shipping', value: order.shippingAmount },
                { label: 'Tax', value: order.taxAmount },
                { label: 'Donation generated', value: order.donationAmount },
              ]"
              :key="line.label"
              class="flex justify-between gap-3"
            >
              <dt class="admin-muted">{{ line.label }}</dt>
              <dd>{{ formatPrice(line.value) }}</dd>
            </div>
            <div
              class="admin-row border-t border-[var(--admin-line)] pt-4 text-lg"
            >
              <dt>Total</dt>
              <dd class="font-semibold">{{ formatPrice(order.total) }}</dd>
            </div>
          </dl>
          <p v-if="order.promoUsage" class="admin-muted mt-3">
            Promo: {{ order.promoUsage.promoCode || 'Recorded promo' }}
          </p>
          <section class="admin-form-section mt-6">
            <h3>Customer</h3>
            <p class="mt-3">{{ order.customerName || 'Guest' }}</p>
            <p class="break-words">{{ order.customerEmail || 'No email' }}</p>
            <p>{{ order.customerPhone || 'No phone' }}</p>
            <p class="admin-muted text-xs mt-2">
              Marketing:
              {{ order.marketingOptIn ? 'Opted in' : 'Not opted in' }} · Saved
              info: {{ order.saveInfo ? 'Yes' : 'No' }}
            </p>
          </section>
          <section class="admin-form-section">
            <h3>Shipping to</h3>
            <p class="mt-3">{{ shippingAddress }}</p>
            <p class="admin-muted mt-2">
              {{ order.shippingMethod || 'No method' }} ·
              {{ order.shippingCarrier || 'No carrier' }}
            </p>
            <p class="admin-muted">
              {{ order.shippingService || 'No service' }} ·
              {{ order.shippingRateProvider || 'No rate source' }}
            </p>
            <p v-if="order.deliveryNotes" class="mt-2">
              {{ order.deliveryNotes }}
            </p>
          </section>
          <details class="admin-form-section">
            <summary class="cursor-pointer font-medium">Payment record</summary>
            <p class="admin-muted mt-3">
              {{
                order.stripePaymentIntentId
                  ? 'Stripe payment ID recorded'
                  : 'No Stripe payment ID stored'
              }}
            </p>
            <p class="break-all text-xs mt-2">
              {{ order.stripePaymentIntentId || 'Unavailable' }}
            </p>
            <p class="break-all admin-muted text-xs mt-2">
              Internal order ID: {{ order.id }}
            </p>
          </details>
        </aside>
      </div>
      <section class="admin-form-section">
        <h2>Other orders from this customer</h2>
        <RouterLink
          v-for="other in sameCustomerOrders"
          :key="other.id"
          :to="'/admin/orders/' + other.id"
          class="admin-row py-4"
          ><span class="admin-link">{{
            other.customerReference || other.orderNumber || other.id
          }}</span
          ><span class="admin-muted">{{ formatDate(other.createdAt) }}</span
          ><span
            >{{ formatPrice(other.total) }} · {{ other.status }}</span
          ></RouterLink
        >
        <p v-if="!sameCustomerOrders.length" class="admin-muted mt-3">
          No other orders found for this customer email.
        </p>
      </section>
    </template>
  </section>
</template>
