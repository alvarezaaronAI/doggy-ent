<template>
  <article>
    <div class="account-row items-start">
      <div>
        <h2 class="!text-2xl">Order {{ orderReference(order) }}</h2>
        <p class="account-muted mt-2 text-sm">Placed {{ formatAccountDate(order.createdAt) }}</p>
        <p v-if="order.paymentStatus" class="account-muted mt-1 text-xs">
          Payment: {{ formatAccountLabel(order.paymentStatus) }}
        </p>
      </div>
      <AccountStatusBadge :status="order.status" />
    </div>
    <section class="account-section mt-6">
      <h3>{{ deliveryHeading }}</h3>
      <p class="account-muted mt-2 text-sm">
        {{
          shipment
            ? formatAccountLabel(shipment.shipmentStatus || order.status)
            : 'Tracking will appear here when it is available.'
        }}
      </p>
      <a
        v-if="trackingUrl"
        class="account-link mt-4 inline-flex items-center gap-2"
        :href="trackingUrl"
        target="_blank"
        rel="noopener noreferrer"
        >Carrier tracking<i
          class="fa-solid fa-arrow-up-right-from-square text-xs"
          aria-hidden="true"
        ></i
      ></a>
      <p v-if="shipment?.trackingNumber" class="account-muted mt-3 break-all text-sm">
        {{ shipment.carrier }} &middot; {{ shipment.trackingNumber }}
      </p>
      <p v-if="shipment?.estimatedDelivery" class="account-muted mt-2 text-sm">
        Estimated delivery {{ formatAccountDate(shipment.estimatedDelivery) }}
      </p>
      <details v-if="shipment?.events?.length" class="mt-4 text-sm">
        <summary class="account-link cursor-pointer">Shipping updates</summary>
        <div
          v-for="(event, index) in shipment.events"
          :key="index"
          class="mt-4 border-l-2 border-[var(--account-line)] pl-4"
        >
          <p class="font-semibold">{{ formatAccountLabel(event.status) }}</p>
          <p class="account-muted text-xs">
            {{ formatAccountDate(event.occurredAt, { time: true }) }}
          </p>
          <p v-if="event.message">{{ event.message }}</p>
          <p v-if="event.location" class="account-muted">{{ event.location }}</p>
        </div>
      </details>
    </section>
    <div class="space-y-3 mt-5"><CommerceItemCard v-for="(item, index) in order.items" :key="item.id || index" :item="item" :campaigns="itemCampaigns(item, order.campaignUsages || order.campaignAttributions || [], true)" :promo-code="Number(order.discountAmount) > 0 ? order.promoUsage?.promoCode : ''" :format-price="money" /></div>
    <dl class="space-y-3 py-6 text-sm">
      <div class="flex justify-between gap-5">
        <dt>Subtotal</dt>
        <dd>{{ money(order.subtotal) }}</dd>
      </div>
      <div v-if="Number(order.discountAmount) > 0" class="flex justify-between gap-5">
        <dt>
          Discount<span v-if="order.promoUsage?.promoCode">
            &middot; {{ order.promoUsage.promoCode }}</span
          >
        </dt>
        <dd>-{{ money(order.discountAmount) }}</dd>
      </div>
      <div class="flex justify-between gap-5">
        <dt>Shipping</dt>
        <dd class="tabular-nums">{{ money(order.shippingAmount) }}</dd>
      </div>
      <div class="flex justify-between gap-5">
        <dt>Tax<span v-if="taxRate" class="ml-1">({{ taxRate }})</span></dt>
        <dd class="tabular-nums">{{ money(order.taxAmount) }}</dd>
      </div>
      <div><dt class="sr-only">Saved tax details</dt><dd><TaxBreakdown :tax-details="order.taxDetails" :tax-amount="order.taxAmount" saved :format-price="money" /></dd></div>
      <div
        class="flex justify-between gap-5 border-t border-[var(--account-line)] pt-4 text-lg font-semibold"
      >
        <dt>{{ order.paymentStatus === 'PAID' ? 'Total paid' : 'Total' }}</dt>
        <dd class="tabular-nums">{{ money(order.total) }}</dd>
      </div>
    </dl>
    <CommerceGivingNote :amount="Number(order.donationAmount) || 0" :campaigns="order.campaignUsages || order.campaignAttributions || []" :format-price="money" />
    <section class="account-section">
      <h3>Shipping to</h3>
      <p class="mt-3">{{ order.customerName }}</p>
      <p v-for="(line, index) in shippingLines" :key="index" class="account-muted">{{ line }}</p>
      <p v-if="!shippingLines.length" class="account-muted">Shipping details unavailable.</p>
      <p class="account-muted mt-3 text-sm">{{ order.shippingMethod || 'Standard shipping' }}</p>
      <p v-if="order.shippingService" class="account-muted text-sm">
        {{ [order.shippingCarrier, order.shippingService].filter(Boolean).join(' - ') }}
      </p>
      <p v-if="order.deliveryNotes" class="account-muted mt-3 text-sm">
        Delivery notes: {{ order.deliveryNotes }}
      </p>
      <p class="account-muted mt-4 break-words text-xs">
        {{ order.customerEmail
        }}<span v-if="order.customerPhone"> &middot; {{ order.customerPhone }}</span>
      </p>
    </section>
    <section class="account-section">
      <h3>Need help with this order?</h3>
      <p class="account-muted mt-2 text-sm">
        {{
          order.support?.available
            ? 'Your order details come with you.'
            : order.support?.message || 'Open Order help to see your existing cases.'
        }}
      </p>
      <button
        v-if="order.support?.available"
        class="account-button mt-5"
        type="button"
        @click="issueOpen = true"
      >
        <i class="fa-regular fa-comment" aria-hidden="true"></i>Get order help
      </button>
      <RouterLink v-else to="/account/help" class="account-link mt-4 inline-block"
        >View Order help</RouterLink
      >
      <RouterLink
        v-for="issue in order.support?.issues || []"
        :key="issue.caseNumber"
        :to="{ name: 'account-help', query: { case: issue.caseNumber } }"
        class="account-link mt-4 block text-sm"
        >{{ issue.caseNumber }} &middot; {{ formatAccountLabel(issue.status) }}</RouterLink
      >
      <p class="account-muted mt-5 text-xs">
        Coming in future phase: product reviews and one-click reordering.
      </p>
    </section>
    <AccountOrderIssueDialog
      v-if="issueOpen"
      :order="order"
      @close="issueOpen = false"
      @created="onCreated"
    />
  </article>
</template>
<script setup>
import CommerceItemCard from '@shared/components/CommerceItemCard.vue'
import CommerceGivingNote from '@shared/components/CommerceGivingNote.vue'
import TaxBreakdown from '@checkout/components/TaxBreakdown.vue'
import { mapTaxDetails } from '@checkout/mappers/taxDetails.mapper.js'
import { itemCampaigns } from '@shared/mappers/commerceItem.mapper.js'
import { computed, onDeactivated, ref } from 'vue'
import { formatCurrency } from '@shared/utils/currency'
import AccountStatusBadge from './AccountStatusBadge.vue'
import AccountOrderIssueDialog from './AccountOrderIssueDialog.vue'
import {
  addressLines,
  formatAccountDate,
  formatAccountLabel,
  orderReference,
  safeTrackingUrl,
} from '../utils/accountFormatting.js'
const props = defineProps({ order: { type: Object, required: true } })
const emit = defineEmits(['issue-created'])
const issueOpen = ref(false)
onDeactivated(() => {
  issueOpen.value = false
})
const shipment = computed(() => props.order.shipment || props.order.shipments?.[0])
const trackingUrl = computed(() => safeTrackingUrl(shipment.value?.trackingUrl))
const shippingLines = computed(() => addressLines(props.order))
const taxRate = computed(() => props.order.taxDetails?.status === 'calculated' ? mapTaxDetails(props.order.taxDetails)?.rate : null)
const deliveryHeading = computed(
  () =>
    ({
      SHIPPED: 'Your order is on its way',
      DELIVERED: 'Your order has arrived',
      PROCESSING: 'Getting your treats ready',
      CANCELLED: 'This order was cancelled',
      REFUNDED: 'This order was refunded',
    })[props.order.status] || 'Your order at a glance'
)
function money(value) {
  return formatCurrency(value, { currency: props.order.currency || 'USD' })
}
function onCreated(issue) {
  // Keep the successful dialog open; updating the detail must not unmount it.
  emit('issue-created', issue)
}
</script>
