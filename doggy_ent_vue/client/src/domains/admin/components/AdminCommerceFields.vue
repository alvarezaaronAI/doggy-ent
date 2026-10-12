<script setup>
import { computed } from 'vue'
const props = defineProps({ draft: Object, selected: String })
const confirmation = computed(() => props.draft.confirmation)
</script>
<template>
  <div class="space-y-4">
    <template v-if="selected === 'checkout'">
      <h2>Checkout presentation</h2>
      <label class="admin-field">Checkout heading<input v-model="draft.checkout.title" maxlength="300" /></label>
      <label class="admin-field">Introduction below heading<textarea v-model="draft.checkout.introduction" maxlength="300" rows="3" /></label>
      <h3>Express wallets</h3>
      <label class="flex items-center gap-3"><input v-model="draft.checkout.applePay" type="checkbox" />Enable Apple Pay</label>
      <label class="flex items-center gap-3"><input v-model="draft.checkout.googlePay" type="checkbox" />Enable Google Pay</label>
      <p class="admin-muted text-xs">Customers see wallets only when supported by their browser, device and Stripe settings. HTTPS and a registered payment domain are required. Card checkout stays available.</p>
    </template>
    <template v-else-if="selected === 'confirmation-next'">
      <h2>After-order guidance</h2>
      <label class="admin-field">Next steps heading<input v-model="confirmation.nextTitle" maxlength="500" /></label>
      <label class="admin-field">Preparation and tracking guidance<textarea v-model="confirmation.nextText" maxlength="500" rows="5" /></label>
    </template>
    <template v-else-if="selected === 'confirmation-help'">
      <h2>Customer help</h2>
      <label class="admin-field">Help heading<input v-model="confirmation.helpTitle" maxlength="500" /></label>
      <label class="admin-field">Help description<textarea v-model="confirmation.helpText" maxlength="500" rows="4" /></label>
      <label class="admin-field">Help button label<input v-model="confirmation.helpLabel" maxlength="500" /></label>
      <label class="admin-field">Help destination URL<input v-model="confirmation.helpUrl" /></label>
    </template>
    <template v-else>
      <h2>Order confirmation</h2>
      <label class="admin-field">Confirmation heading<input v-model="confirmation.title" maxlength="500" /></label>
      <label class="admin-field">Thank-you introduction<textarea v-model="confirmation.introduction" maxlength="500" rows="4" /></label>
      <label class="admin-field">Page background<select v-model="confirmation.background"><option value="oat">Soft oat</option><option value="white">White</option><option value="giving">Soft emerald</option></select></label>
    </template>
    <p class="admin-muted text-xs">Order details, prices, payment state and receipt delivery are protected live data. Save draft then Publish to change customer pages.</p>
  </div>
</template>
