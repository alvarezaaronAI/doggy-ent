<script setup>
import { computed, ref } from 'vue'
import {
  CAMPAIGN_STATUS_OPTIONS,
  DONATION_TYPE_OPTIONS,
} from '../constants/adminCampaigns.constants.js'
import AdminScheduleFields from './AdminScheduleFields.vue'
const props = defineProps({
  section: String,
  form: { type: Object, required: true },
  products: { type: Array, required: true },
})
const search = ref('')
const filteredProducts = computed(() =>
  props.products.filter((product) =>
    [product.name, product.category, product.status]
      .join(' ')
      .toLowerCase()
      .includes(search.value.trim().toLowerCase()),
  ),
)
</script>
<template>
  <div class="campaign-fields">
    <template v-if="section === 'hero'">
      <label class="admin-field"
        >Campaign name<input v-model="form.name" maxlength="160" required
      /></label>
      <label class="admin-field"
        >Introduction<textarea
          v-model="form.description"
          maxlength="600"
          rows="4"
        ></textarea>
      </label>
      <label class="admin-field"
        >Image URL<input
          v-model="form.image"
          type="url"
          placeholder="HTTPS image URL"
      /></label>
      <label class="admin-field"
        >Image description<input v-model="form.imageAlt" maxlength="240"
      /></label>
    </template>
    <template v-else-if="section === 'partner'">
      <label class="admin-field"
        >Shelter / beneficiary<input
          v-model="form.donationTarget"
          maxlength="240"
      /></label>
      <label class="admin-field"
        >Partner website<input
          v-model="form.beneficiaryUrl"
          type="url"
          placeholder="HTTPS partner URL"
      /></label>
    </template>
    <label v-else-if="section === 'story'" class="admin-field"
      >Campaign story<textarea
        v-model="form.story"
        maxlength="10000"
        rows="12"
      ></textarea>
    </label>
    <template v-else-if="section === 'giving'">
      <label class="admin-field"
        >Donation type<select v-model="form.donationType">
          <option
            v-for="option in DONATION_TYPE_OPTIONS"
            :key="option.value"
            :value="option.value"
          >
            {{ option.label }}
          </option>
        </select></label
      >
      <label class="admin-field"
        >{{
          form.donationType === 'FIXED'
            ? 'Amount per eligible order'
            : 'Percentage of eligible product sales'
        }}<input
          v-model.number="form.donationValue"
          type="number"
          min="0"
          :max="form.donationType === 'PERCENT' ? 100 : undefined"
          step="0.01"
          required
      /></label>
      <p class="admin-muted text-sm">
        Fixed contributions apply once per eligible order, not per bag. The
        server calculates all contributions.
      </p>
      <AdminScheduleFields :form="form" />
      <p class="admin-muted text-xs">
        Dates use your device's time zone. Saved times are normalized to ISO
        timestamps.
      </p>
    </template>
    <template v-else-if="section === 'products'">
      <label class="admin-field"
        >Find products<input v-model="search" type="search"
      /></label>
      <p class="admin-muted text-sm">
        {{ form.productIds.length }} selected. Only active products appear on
        the public page.
      </p>
      <div class="campaign-product-options">
        <label v-for="product in filteredProducts" :key="product.id"
          ><input
            v-model="form.productIds"
            type="checkbox"
            :value="String(product.id)"
          /><span
            ><strong>{{ product.name }}</strong
            ><small>{{ product.category }} · {{ product.status }}</small></span
          ></label
        >
        <p v-if="!filteredProducts.length" class="admin-muted">
          No matching products.
        </p>
      </div>
    </template>
    <template v-else>
      <label class="admin-field"
        >Status<select v-model="form.status">
          <option
            v-for="option in CAMPAIGN_STATUS_OPTIONS"
            :key="option.value"
            :value="option.value"
          >
            {{ option.label }}
          </option>
        </select></label
      >
      <label class="campaign-check"
        ><input v-model="form.publicPageEnabled" type="checkbox" />Enable public
        campaign page</label
      >
      <label class="campaign-check"
        ><input v-model="form.featured" type="checkbox" />Featured
        campaign</label
      >
      <p class="admin-muted text-sm">
        Draft and archived pages stay private. Giving requires Active status and
        an eligible schedule. Disabling the page does not disable giving.
      </p>
      <p v-if="form.slug" class="campaign-path">/campaigns/{{ form.slug }}</p>
    </template>
  </div>
</template>
<style scoped>
.campaign-fields {
  display: grid;
  gap: 20px;
}
.campaign-product-options {
  max-height: 440px;
  overflow: auto;
}
.campaign-product-options label {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  padding: 14px 10px;
  border: 1px solid var(--admin-line);
  background: var(--admin-soft);
  margin-bottom: 8px;
  border-radius: 4px;
  cursor: pointer;
}
.campaign-product-options input {
  margin-top: 4px;
}
.campaign-product-options strong,
.campaign-product-options small {
  display: block;
}
.campaign-product-options small {
  color: var(--admin-muted);
  margin-top: 4px;
}
.campaign-check {
  display: flex;
  gap: 12px;
  padding: 14px;
  border: 1px solid var(--admin-line);
  background: var(--admin-soft);
  border-radius: 4px;
  cursor: pointer;
}
.campaign-path {
  overflow-wrap: anywhere;
  font-size: 12px;
  color: var(--admin-muted);
}
</style>
