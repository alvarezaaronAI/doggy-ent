<script setup>
import {
  DISCOUNT_TYPE_OPTIONS,
  PROMO_STATUS_OPTIONS,
  PROMO_TYPE_OPTIONS,
} from '../constants/promo.constants'
defineProps({
  form: { type: Object, required: true },
  isSaving: Boolean,
  isEditing: Boolean,
  isUniquePromo: Boolean,
  isReferralPromo: Boolean,
  errorMessage: String,
  successMessage: String,
})
const emit = defineEmits(['submit', 'reset', 'generate-code'])
</script>
<template>
  <form @submit.prevent="emit('submit')">
    <div v-if="errorMessage" role="alert" class="admin-alert admin-error">
      {{ errorMessage }}
    </div>
    <div class="admin-editor">
      <div class="min-w-0">
        <section class="admin-form-section">
          <h2>Code &amp; discount</h2>
          <div class="admin-form-grid">
            <label class="admin-field"
              >Promo code<input v-model="form.code" required
            /></label>
            <label class="admin-field"
              >Internal name<input v-model="form.name" required
            /></label>
            <label class="admin-field"
              >Code type<select aria-label="Code type" v-model="form.type">
                <option
                  v-for="o in PROMO_TYPE_OPTIONS"
                  :key="o.value"
                  :value="o.value"
                >
                  {{ o.label }}
                </option>
              </select></label
            >
            <button
              type="button"
              class="admin-link self-end pb-3 justify-self-start"
              @click="emit('generate-code')"
            >
              Generate unique code
            </button>
            <label class="admin-field"
              >Discount type<select
                aria-label="Discount type"
                v-model="form.discountType"
              >
                <option
                  v-for="o in DISCOUNT_TYPE_OPTIONS"
                  :key="o.value"
                  :value="o.value"
                >
                  {{ o.label }}
                </option>
              </select></label
            >
            <label class="admin-field"
              >Discount value<input
                v-model.number="form.discountValue"
                type="number"
                min="0"
                step="0.01"
            /></label>
          </div>
        </section>
        <slot />
      </div>
      <aside class="admin-editor-aside">
        <h2>Availability</h2>
        <label class="admin-field mt-5"
          >Status<select aria-label="Status" v-model="form.status">
            <option
              v-for="o in PROMO_STATUS_OPTIONS"
              :key="o.value"
              :value="o.value"
            >
              {{ o.label }}
            </option>
          </select></label
        >
        <p class="admin-muted mt-5">
          Eligibility and usage limits are checked by the server at checkout.
        </p>
        <section class="admin-form-section mt-6">
          <h3>Promo email</h3>
          <p class="admin-muted mt-2">Coming in a future phase.</p>
        </section>
      </aside>
    </div>
    <div class="admin-savebar">
      <button
        type="submit"
        class="admin-button admin-primary"
        :disabled="isSaving"
      >
        {{ isSaving ? 'Saving...' : 'Save promo' }}</button
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
