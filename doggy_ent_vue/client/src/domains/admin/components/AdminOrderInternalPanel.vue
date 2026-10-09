<script setup>
import { computed } from 'vue'
import AdminIcon from './AdminIcon.vue'
import AdminRecordInspector from './AdminRecordInspector.vue'
import AdminStripeDashboardSettings from './AdminStripeDashboardSettings.vue'
import { useAdminStripeDashboard } from '../composables/useAdminStripeDashboard.js'
import { getStripePaymentLink } from '../utils/stripeDashboard.js'
import { formatAdminOrderDate } from '../utils/adminOrders.utils'
const props = defineProps({ order: { type: Object, required: true } })
const { paymentsUrl } = useAdminStripeDashboard()
const paymentLink = computed(() =>
  getStripePaymentLink(props.order.stripePaymentIntentId, paymentsUrl.value),
)
const dashboardMode = computed(() => paymentsUrl.value.includes('/test/payments') ? 'Test dashboard' : 'Live dashboard')
</script>
<template>
  <section class="admin-form-section">
    <h3>Internal record</h3>
    <dl class="admin-record-fields mt-4">
      <div>
        <dt>Order ID</dt>
        <dd class="font-mono text-xs select-all">{{ order.id }}</dd>
      </div>
      <div>
        <dt>Stripe PaymentIntent ID</dt>
        <dd class="font-mono text-xs select-all">
          {{ order.stripePaymentIntentId || 'Not recorded' }}
        </dd>
      </div>
      <div>
        <dt>Currency</dt>
        <dd>{{ String(order.currency || 'Not recorded').toUpperCase() }}</dd>
      </div>
      <div>
        <dt>Last updated</dt>
        <dd>{{ formatAdminOrderDate(order.updatedAt) }}</dd>
      </div>
      <div>
        <dt>Linked account</dt>
        <dd>
          <RouterLink
            v-if="order.userId"
            class="admin-link font-mono text-xs"
            :to="'/admin/customers/' + encodeURIComponent(order.userId)"
            >{{ order.userId }}<AdminIcon name="next" /></RouterLink
          ><span v-else>Guest order</span>
        </dd>
      </div>
    </dl>
    <a
      v-if="paymentLink"
      :href="paymentLink"
      target="_blank"
      rel="noopener noreferrer"
      class="admin-link mt-4"
      >View payment in Stripe<AdminIcon name="external"
    /></a>
    <p v-if="paymentLink" class="admin-muted mt-2">{{ dashboardMode }}</p>
    <p v-else-if="order.stripePaymentIntentId" class="admin-muted mt-4">
      Stripe dashboard link is not configured for this workspace.
    </p>
    <AdminStripeDashboardSettings />
    <AdminRecordInspector :record="order.internalRecord" />
  </section>
</template>
