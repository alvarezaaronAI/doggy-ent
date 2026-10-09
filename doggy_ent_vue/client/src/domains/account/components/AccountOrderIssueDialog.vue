<template>
  <AccountDialog
    :title="`Help with ${orderReference(order)}`"
    :busy="saving"
    @close="$emit('close')"
  >
    <div v-if="created">
      <p class="account-notice" role="status">Case {{ created.caseNumber }} has been created.</p>
      <p class="account-muted mt-4">You can follow replies and updates in Order help.</p>
      <div class="mt-6 flex flex-wrap gap-3">
        <RouterLink
          :to="{ name: 'account-help', query: { case: created.caseNumber } }"
          class="account-button account-button--primary"
          >View case</RouterLink
        ><button type="button" class="account-button" @click="$emit('close')">Done</button>
      </div>
    </div>
    <form v-else @submit.prevent="submit">
      <p class="account-muted mb-5 text-sm">
        Your order details come with you. Tell us what needs attention.
      </p>
      <p v-if="order.support?.eligibility?.deadline" class="account-notice mb-5">
        Submit by {{ formatAccountDate(order.support.eligibility.deadline) }}.
      </p>
      <label class="account-field"
        >What can we help with?<select v-model="form.category" class="account-input" required>
          <option v-for="category in categories" :key="category" :value="category">
            {{ formatAccountLabel(category) }}
          </option>
        </select></label
      >
      <label class="account-field mt-4"
        >Affected item<select v-model="form.item" class="account-input">
          <option value="">Whole order / not item-specific</option>
          <option
            v-for="(item, index) in order.items"
            :key="index"
            :value="`${item.productName} (${item.size})`"
          >
            {{ item.productName }} &middot; {{ item.size }}
          </option>
        </select></label
      >
      <label class="account-field mt-4"
        >A little more detail<textarea
          v-model="form.message"
          class="account-input min-h-32"
          maxlength="1200"
          required
          placeholder="Tell us what happened and what would help."
        ></textarea>
      </label>
      <p v-if="error" role="alert" class="account-error mt-4">{{ error }}</p>
      <div class="mt-6 flex flex-wrap justify-end gap-3">
        <button class="account-button" :disabled="saving" type="button" @click="$emit('close')">
          Cancel</button
        ><button
          class="account-button account-button--primary"
          :disabled="saving || !categories.length"
          type="submit"
        >
          {{ saving ? 'Submitting...' : 'Submit request' }}
        </button>
      </div>
    </form>
  </AccountDialog>
</template>
<script setup>
import AccountDialog from './AccountDialog.vue'
import { useAccountOrderIssue } from '../composables/useAccountOrderIssue.js'
import {
  formatAccountDate,
  formatAccountLabel,
  orderReference,
} from '../utils/accountFormatting.js'
const props = defineProps({ order: { type: Object, required: true } })
const emit = defineEmits(['close', 'created'])
const { categories, form, saving, error, created, submit } = useAccountOrderIssue(
  props.order,
  (issue) => emit('created', issue)
)
</script>
