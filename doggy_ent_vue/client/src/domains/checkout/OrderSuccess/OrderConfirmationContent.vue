<script setup>
import { computed } from 'vue'
import { Check, Mail, Package, Pencil, ArrowRight, ShieldCheck } from '@lucide/vue'
import CommerceItemCard from '@shared/components/CommerceItemCard.vue'
import CommerceGivingNote from '@shared/components/CommerceGivingNote.vue'
import { itemCampaigns } from '@shared/mappers/commerceItem.mapper.js'
import { formatCurrency } from '@shared/utils/currency.js'
import { safeTrackingUrl } from '@domains/account/utils/accountFormatting.js'
import { receiptEmailMessage } from '../utils/receiptEmail.js'
import TaxBreakdown from '../components/TaxBreakdown.vue'
import { mapTaxDetails } from '../mappers/taxDetails.mapper.js'
const props = defineProps({ order: { type: Object, required: true }, settings: { type: Object, required: true }, signedIn: Boolean, editable: Boolean, selected: String })
defineEmits(['select'])
const shipment = computed(() => props.order.shipment || props.order.shipments?.[0])
const tracking = computed(() => safeTrackingUrl(shipment.value?.trackingUrl))
const reference = computed(() => props.order.customerReference || props.order.orderNumber)
const money = value => formatCurrency(value, { currency: props.order.currency || 'USD' })
const date = computed(() => new Date(props.order.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }))
const paid = computed(() => props.order.paymentStatus === 'PAID')
const closed = computed(() => ['CANCELLED', 'REFUNDED'].includes(props.order.status))
const taxRate = computed(() => props.order.taxDetails?.status === 'calculated' ? mapTaxDetails(props.order.taxDetails)?.rate : null)
</script>
<template>
  <div class="confirmation-ui store-pattern" :class="'confirmation-' + settings.background">
    <div class="mx-auto max-w-[1100px] px-4 py-10">
      <header data-commerce-section="confirmation" class="mb-8">
        <button v-if="editable" type="button" class="confirmation-edit" :aria-pressed="selected === 'confirmation'" @click="$emit('select', 'confirmation')"><Pencil :size="14" />Welcome &amp; appearance</button>
        <span v-if="paid" class="mb-4 grid h-12 w-12 place-items-center rounded-full bg-[#edf6f0] text-[#17634c]"><Check :size="26" /></span>
        <p class="text-xs font-semibold text-[#17634c]">{{ paid ? 'Order received · payment confirmed' : 'Order update' }}</p>
        <h1 class="mt-2 text-3xl font-semibold text-[#6a3c2b]">{{ paid ? settings.title : 'Your order details' }}</h1>
        <p class="mt-3 max-w-2xl text-sm leading-relaxed text-stone-600">{{ paid ? settings.introduction : 'The saved status of your order is shown below.' }}</p>
      </header>
      <div class="confirmation-grid">
        <div class="min-w-0 space-y-5">
        <section class="confirmation-panel">
          <div class="flex flex-wrap justify-between gap-3 border-b border-stone-200 pb-5"><div><h2 class="text-xl font-semibold">Order {{ reference }}</h2><p class="mt-2 text-sm text-stone-600">Placed {{ date }}</p></div><span class="text-sm text-stone-600">{{ String(order.status).replaceAll('_', ' ').toLowerCase() }}</span></div>
          <div class="my-5 space-y-3"><CommerceItemCard v-for="item in order.items" :key="item.id || item.productId + '-' + item.size" :item="item" :campaigns="itemCampaigns(item, order.campaignAttributions || [], true)" :promo-code="order.discountAmount > 0 ? order.promoUsage?.promoCode || 'Order discount' : ''" :format-price="money" /></div>
          <dl class="space-y-3 text-sm">
            <div class="flex justify-between gap-4"><dt>Subtotal</dt><dd>{{ money(order.subtotal) }}</dd></div>
            <div v-if="order.discountAmount > 0" class="flex justify-between gap-4"><dt>Discount<span v-if="order.promoUsage?.promoCode"> · {{ order.promoUsage.promoCode }}</span></dt><dd>-{{ money(order.discountAmount) }}</dd></div>
            <div class="flex justify-between gap-4"><dt>Shipping</dt><dd class="tabular-nums">{{ money(order.shippingAmount) }}</dd></div>
            <div class="flex justify-between gap-4"><dt>Tax<span v-if="taxRate" class="ml-1">({{ taxRate }})</span></dt><dd class="tabular-nums">{{ money(order.taxAmount) }}</dd></div>
            <div><dt class="sr-only">Saved tax details</dt><dd><TaxBreakdown :tax-details="order.taxDetails" :tax-amount="order.taxAmount" saved :format-price="money" /></dd></div>
            <div class="flex justify-between gap-4 border-t border-stone-200 pt-4 text-lg font-semibold"><dt>{{ paid ? 'Total paid' : 'Total' }}</dt><dd class="tabular-nums">{{ money(order.total) }}</dd></div>
          </dl>
          <RouterLink v-if="!editable" to="/" class="mt-6 inline-flex items-center gap-2 rounded-md bg-[#f2de5c] px-4 py-3 font-semibold text-[#6a3c2b]">Continue shopping <ArrowRight :size="16" /></RouterLink>
        </section>
        <CommerceGivingNote :amount="Number(order.donationAmount) || 0" :campaigns="order.campaignAttributions || []" :format-price="money" :interactive="!editable" />
        </div>
        <aside class="space-y-5">
          <section class="confirmation-panel">
            <Mail :size="22" class="text-[#315bc5]" /><h2 class="mt-3 text-lg font-semibold">Your receipt &amp; updates</h2>
            <p class="mt-3 break-words text-sm text-stone-600">Order emails go to <strong class="text-stone-800">{{ order.customerEmail }}</strong>.</p>
            <p class="mt-2 text-sm leading-relaxed text-stone-600" role="status">{{ receiptEmailMessage(order.receiptEmailStatus) }}</p>
            <p class="mt-3 text-sm text-stone-600">{{ signedIn ? 'This order is available in your account history.' : 'Keep this confirmation open or save your order reference. Guest checkout does not require an account.' }}</p>
            <RouterLink v-if="signedIn && !editable" to="/account/orders" class="mt-3 inline-flex rounded-md border border-stone-200 bg-stone-50 px-3 py-2 text-sm font-semibold">View your orders</RouterLink>
          </section>
          <section data-commerce-section="confirmation-next" class="confirmation-panel">
            <button v-if="editable" type="button" class="confirmation-edit" :aria-pressed="selected === 'confirmation-next'" @click="$emit('select', 'confirmation-next')"><Pencil :size="14" />Next steps</button>
            <Package :size="22" class="text-[#315bc5]" /><h2 class="mt-3 text-lg font-semibold">{{ closed ? 'Order status' : settings.nextTitle }}</h2><p class="mt-3 text-sm leading-relaxed text-stone-600">{{ closed ? 'This order is ' + order.status.toLowerCase() + '. Contact our team if you need help with this update.' : settings.nextText }}</p>
            <div class="mt-5 border-t border-stone-200 pt-4 text-sm"><h3 class="font-semibold">Shipping to</h3><p class="mt-2">{{ order.customerName }}</p><p>{{ order.address1 }}</p><p v-if="order.address2">{{ order.address2 }}</p><p>{{ [order.city, order.state, order.zip].filter(Boolean).join(', ') }}</p><p class="mt-2 text-xs text-stone-600">{{ order.shippingService || order.shippingMethod || 'Selected shipping method' }}</p></div>
            <a v-if="tracking && !editable" :href="tracking" target="_blank" rel="noopener noreferrer" class="mt-4 inline-block rounded-md border border-stone-200 bg-stone-50 px-3 py-2 text-sm font-semibold">Carrier tracking</a>
          </section>
          <section data-commerce-section="confirmation-help" class="confirmation-panel">
            <button v-if="editable" type="button" class="confirmation-edit" :aria-pressed="selected === 'confirmation-help'" @click="$emit('select', 'confirmation-help')"><Pencil :size="14" />Help</button>
            <ShieldCheck :size="22" class="text-[#315bc5]" /><h2 class="mt-3 text-lg font-semibold">{{ settings.helpTitle }}</h2><p class="mt-3 text-sm leading-relaxed text-stone-600">{{ settings.helpText }}</p><a :href="settings.helpUrl" class="mt-4 inline-flex rounded-md border border-stone-200 bg-stone-50 px-3 py-2 text-sm font-semibold" :tabindex="editable ? -1 : 0" @click="editable && $event.preventDefault()">{{ settings.helpLabel }}</a>
          </section>
        </aside>
      </div>
    </div>
  </div>
</template>
<style scoped>
.confirmation-ui { --brand-4: var(--storefront-brand-4); color: #303b34; background: #f8f7f3; container-type: inline-size; }
.confirmation-white { background: #fff; }.confirmation-giving { background: #edf6f0; }.confirmation-oat { background: #f8f5ef; }
.confirmation-grid { display: grid; grid-template-columns: minmax(0,1fr); gap: 24px; align-items: start; }
.confirmation-panel { min-width: 0; border: 1px solid #ddd9d2; border-radius: 8px; background: white; padding: 24px; box-shadow: 0 8px 24px #24352d0a; overflow-wrap: anywhere; }
.confirmation-edit { display: flex; gap: 6px; align-items: center; min-height: 36px; padding: 8px; margin-bottom: 12px; border: 1px solid #bed6c8; border-radius: 4px; background: #edf6f0; color: #17634c; font-size: 12px; }
.confirmation-edit[aria-pressed='true'] { border-color: #17634c; font-weight: 600; }
.confirmation-ui :deep(a:focus-visible), .confirmation-ui :deep(button:focus-visible) { outline: 2px solid #315bc5; outline-offset: 2px; }
@container (min-width: 850px) { .confirmation-grid { grid-template-columns: minmax(0,1fr) 350px; } }
</style>
