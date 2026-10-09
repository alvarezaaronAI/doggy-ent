<script setup>
import {
  CAMPAIGN_STATUS_OPTIONS,
  DONATION_TYPE_OPTIONS,
} from '../constants/adminCampaigns.constants'
import AdminScheduleFields from './AdminScheduleFields.vue'
defineProps({
  editingCampaignId: [String, Number],
  errorMessage: String,
  form: { type: Object, required: true },
  isSaving: Boolean,
  products: { type: Array, required: true },
  successMessage: String,
})
const emit = defineEmits(['reset', 'submit'])
</script>
<template>
  <form @submit.prevent="emit('submit')">
    <div v-if="errorMessage" class="admin-alert admin-error" role="alert">
      {{ errorMessage }}
    </div>
    <div class="admin-editor">
      <div class="min-w-0">
        <section class="admin-form-section">
          <h2>Campaign &amp; beneficiary</h2>
          <div class="admin-form-grid">
            <label class="admin-field"
              >Campaign name<input v-model="form.name" required
            /></label>
            <label class="admin-field"
              >Shelter / donation target<input
                v-model="form.donationTarget"
                required
            /></label>
            <label class="admin-field md:col-span-2"
              >Description<textarea
                v-model="form.description"
                rows="3"
              ></textarea>
            </label>
            <label class="admin-field"
              >Donation type<select
                aria-label="Donation type"
                v-model="form.donationType"
              >
                <option
                  v-for="o in DONATION_TYPE_OPTIONS"
                  :key="o.value"
                  :value="o.value"
                >
                  {{ o.label }}
                </option>
              </select></label
            >
            <label class="admin-field"
              >Donation value<input
                v-model.number="form.donationValue"
                type="number"
                min="0"
                step="0.01"
            /></label>
          </div>
        </section>
        <section class="admin-form-section">
          <h2>Included products</h2>
          <div
            class="max-h-72 overflow-auto mt-4 divide-y divide-[var(--admin-line)]"
          >
            <label
              v-for="product in products"
              :key="product.id"
              class="flex items-center gap-3 py-3"
              ><input
                v-model="form.productIds"
                type="checkbox"
                :value="product.id"
              /><span
                ><span class="block font-medium">{{ product.name }}</span
                ><span class="admin-muted text-xs"
                  >{{ product.category }} · {{ product.status }}</span
                ></span
              ></label
            >
            <p v-if="!products.length" class="admin-muted py-3">
              No products available. Refresh the campaign list to retry.
            </p>
          </div>
        </section>
        <AdminScheduleFields :form="form" />
      </div>
      <aside class="admin-editor-aside">
        <h2>Availability</h2>
        <label class="admin-field mt-5"
          >Status<select aria-label="Status" v-model="form.status">
            <option
              v-for="o in CAMPAIGN_STATUS_OPTIONS"
              :key="o.value"
              :value="o.value"
            >
              {{ o.label }}
            </option>
          </select></label
        >
        <p class="admin-muted mt-5">
          Donations are calculated by the server from eligible products.
        </p>
        <section class="admin-form-section mt-6">
          <h3>Giving impact</h3>
          <p class="admin-muted mt-2">
            Generated donations are order attributions, not confirmed payouts.
          </p>
        </section>
      </aside>
    </div>
    <div class="admin-savebar">
      <button
        type="submit"
        class="admin-button admin-primary"
        :disabled="isSaving"
      >
        {{ isSaving ? 'Saving...' : 'Save campaign' }}</button
      ><button
        type="button"
        class="admin-button"
        :disabled="isSaving"
        @click="emit('reset')"
      >
        Cancel
      </button>
    </div>
  </form>
</template>
