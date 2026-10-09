<script setup>
import AdminRecordInspector from './AdminRecordInspector.vue'
import { formatAdminOrderDate } from '../utils/adminOrders.utils'
defineProps({ customer: { type: Object, required: true } })
</script>
<template>
  <section class="admin-form-section mt-6">
    <h3>Internal customer record</h3>
    <dl class="admin-record-fields mt-4">
      <div>
        <dt>Customer ID</dt>
        <dd class="font-mono text-xs select-all">{{ customer.id }}</dd>
      </div>
      <div>
        <dt>Last updated</dt>
        <dd>{{ formatAdminOrderDate(customer.updatedAt) }}</dd>
      </div>
      <div>
        <dt>Phone</dt>
        <dd>{{ customer.profile?.phone || 'Not recorded' }}</dd>
      </div>
      <div>
        <dt>Marketing consent</dt>
        <dd>
          {{ customer.profile?.marketingOptIn ? 'Opted in' : 'Not opted in' }}
        </dd>
      </div>
    </dl>
    <AdminRecordInspector :record="customer.internalRecord" />
  </section>
</template>
