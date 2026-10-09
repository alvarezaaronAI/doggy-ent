<script setup>
defineProps({
  form: { type: Object, required: true },
  result: Object,
  isTesting: Boolean,
})
const emit = defineEmits(['submit'])
</script>
<template>
  <section>
    <h2 class="text-lg font-semibold">Test a promo</h2>
    <form class="admin-filters mt-5" @submit.prevent="emit('submit')">
      <label class="admin-field"
        >Promo code<input v-model="form.code" required
      /></label>
      <label class="admin-field"
        >Customer email<input
          v-model="form.customerEmail"
          type="email"
          required
      /></label>
      <label class="admin-field"
        >Subtotal<input
          v-model.number="form.subtotal"
          type="number"
          min="0"
          step="0.01"
      /></label>
      <button
        type="submit"
        class="admin-button admin-primary"
        :disabled="isTesting"
      >
        {{ isTesting ? 'Testing...' : 'Test code' }}
      </button>
    </form>
    <div
      v-if="result"
      class="admin-alert mt-5"
      :class="result.valid ? 'admin-success' : 'admin-error'"
      role="status"
    >
      <strong>{{
        result.valid ? 'Promo is eligible' : 'Promo is not eligible'
      }}</strong>
      <p class="mt-1">{{ result.message }}</p>
      <p v-if="result.valid" class="mt-2">
        Discount: {{ '$' + Number(result.discountAmount || 0).toFixed(2)
        }}<span v-if="result.referralOwnerName">
          · Referral: {{ result.referralOwnerName }}</span
        >
      </p>
    </div>
  </section>
</template>
