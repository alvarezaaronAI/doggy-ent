<script setup>
import AdminScheduleFields from './AdminScheduleFields.vue'
defineProps({
  form: { type: Object, required: true },
  isUniquePromo: Boolean,
  isReferralPromo: Boolean,
})
</script>
<template>
  <section class="admin-form-section">
    <h2>Eligibility &amp; limits</h2>
    <div class="admin-form-grid">
      <label class="admin-field"
        >Minimum subtotal<input
          v-model.number="form.minimumSubtotal"
          type="number"
          min="0"
          step="0.01"
      /></label>
      <label class="admin-field"
        >Total uses allowed<input
          v-model="form.usageLimitTotal"
          type="number"
          min="0"
          placeholder="Unlimited when blank"
      /></label>
      <label class="admin-field"
        >Uses per customer email<input
          v-model="form.usageLimitPerCustomer"
          type="number"
          min="0"
      /></label>
      <label v-if="isUniquePromo" class="admin-field"
        >Assigned customer email<input
          v-model="form.assignedCustomerEmail"
          type="email"
      /></label>
      <label v-if="isReferralPromo" class="admin-field"
        >Referral owner<input v-model="form.referralOwnerName"
      /></label>
    </div>
  </section>
  <AdminScheduleFields :form="form" />
</template>
