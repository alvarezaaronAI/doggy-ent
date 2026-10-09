<script setup>
import { ref } from 'vue'
import AdminProductGuaranteedAnalysisFields from './AdminProductGuaranteedAnalysisFields.vue'
import AdminProductVariantsEditor from './AdminProductVariantsEditor.vue'
import AdminProductContentFields from './AdminProductContentFields.vue'
import AdminIcon from './AdminIcon.vue'
defineProps({
  categoryOptions: Array,
  form: { type: Object, required: true },
  formTitle: String,
  isEditMode: Boolean,
  isSubmitting: Boolean,
  productStatusOptions: Array,
  proteinOptions: Array,
  sellingModeOptions: Array,
  showForm: Boolean,
  submitButtonLabel: String,
})
defineEmits(['cancel', 'create', 'submit'])
const section = ref('details')
const sections = [
  { key: 'details', label: 'Details' },
  { key: 'variants', label: 'Variants & stock' },
  { key: 'content', label: 'Storefront content' },
]
</script>
<template>
  <form novalidate @submit.prevent="$emit('submit')">
    <div class="admin-editor">
      <div>
        <div
          class="admin-segments"
          role="group"
          aria-label="Product editor sections"
        >
          <button
            v-for="tab in sections"
            :key="tab.key"
            type="button"
            :aria-pressed="section === tab.key"
            @click="section = tab.key"
          >
            {{ tab.label }}
          </button>
        </div>
        <section v-show="section === 'details'" class="admin-form-section">
          <h2>Product details</h2>
          <div class="admin-form-grid">
            <label class="admin-field sm:col-span-2"
              >Product name *<input v-model="form.name"
            /></label>
            <label class="admin-field sm:col-span-2"
              >Short description *<textarea
                v-model="form.shortDescription"
                rows="3"
              ></textarea>
            </label>
            <label class="admin-field"
              >Category<select aria-label="Category" v-model="form.category">
                <option v-for="item in categoryOptions" :key="item">
                  {{ item }}
                </option>
              </select></label
            >
            <label class="admin-field"
              >Protein<select aria-label="Protein" v-model="form.protein">
                <option value="">Select protein</option>
                <option v-for="item in proteinOptions" :key="item">
                  {{ item }}
                </option>
              </select></label
            >
            <label class="admin-field sm:col-span-2"
              >Cut<input v-model="form.cut"
            /></label>
            <label class="admin-field sm:col-span-2"
              >Image URL *<input v-model="form.image"
            /></label>
            <img
              v-if="form.image"
              :src="form.image"
              alt="Current product image"
              class="h-32 w-32 rounded border border-[var(--admin-line)] bg-white object-contain"
            />
          </div>
        </section>
        <AdminProductVariantsEditor
          v-show="section === 'variants'"
          :form="form"
        />
        <section v-show="section === 'content'" class="admin-form-section">
          <h2>Storefront information</h2>
          <AdminProductContentFields :form="form" />
          <details class="mt-6 border-t border-[var(--admin-line)] pt-4">
            <summary class="cursor-pointer font-semibold">
              Guaranteed analysis
            </summary>
            <AdminProductGuaranteedAnalysisFields :form="form" />
          </details>
        </section>
      </div>
      <aside class="admin-editor-aside space-y-5">
        <h2>Publishing</h2>
        <label class="admin-field"
          >Status<select aria-label="Status" v-model="form.status">
            <option
              v-for="option in productStatusOptions"
              :key="option.value"
              :value="option.value"
            >
              {{ option.label }}
            </option>
          </select></label
        >
        <label class="admin-field"
          >Selling mode<select
            aria-label="Selling mode"
            v-model="form.sellingMode"
          >
            <option
              v-for="option in sellingModeOptions"
              :key="option.value"
              :value="option.value"
            >
              {{ option.label }}
            </option>
          </select></label
        >
        <label class="flex items-center gap-2"
          ><input v-model="form.featured" type="checkbox" />Featured
          product</label
        >
        <section class="border-t border-[var(--admin-line)] pt-5">
          <h3>Storefront summary</h3>
          <p class="mt-3 font-medium">{{ form.name || 'New product' }}</p>
          <p class="admin-muted mt-2">6 oz / 18 oz</p>
          <p class="admin-muted mt-2">
            {{ form.sixOzPrice || 'Not priced' }} /
            {{ form.eighteenOzPrice || 'Not priced' }} USD
          </p>
        </section>
      </aside>
    </div>
    <div class="admin-savebar">
      <button
        type="button"
        class="admin-button"
        :disabled="isSubmitting"
        @click="$emit('cancel')"
      >
        Cancel</button
      ><button
        type="submit"
        class="admin-button admin-primary"
        :disabled="isSubmitting"
      >
        <AdminIcon name="save" />{{ submitButtonLabel }}
      </button>
    </div>
  </form>
</template>
