<script setup>
import { ref } from 'vue'
import AdminProductGuaranteedAnalysisFields from './AdminProductGuaranteedAnalysisFields.vue'
import AdminProductVariantsEditor from './AdminProductVariantsEditor.vue'
import AdminProductContentFields from './AdminProductContentFields.vue'
import AdminProductDetailsFields from './AdminProductDetailsFields.vue'
import AdminProductCanvas from './AdminProductCanvas.vue'
import AdminIcon from './AdminIcon.vue'
const props = defineProps({
  categoryOptions: Array, form: { type: Object, required: true },
  formTitle: String, isEditMode: Boolean, isSubmitting: Boolean,
  productId: String,
  productStatusOptions: Array, proteinOptions: Array, sellingModeOptions: Array,
  showForm: Boolean, submitButtonLabel: String,
})
const emit = defineEmits(['cancel', 'create', 'submit'])
const section = ref('details')
const initial = JSON.stringify(props.form)
const sections = [
  { key: 'details', label: 'Details & image' }, { key: 'variants', label: 'Variants & stock' },
  { key: 'content', label: 'Tags & product information' }, { key: 'publishing', label: 'Publishing' },
]
function cancel() {
  if (JSON.stringify(props.form) !== initial && !window.confirm('Discard unsaved product changes?')) return
  emit('cancel')
}
</script>
<template>
  <form novalidate @submit.prevent="emit('submit')">
    <div class="product-visual-editor">
      <div class="min-w-0 bg-[#f3f5f3] p-4 sm:p-6">
        <AdminProductCanvas :form="form" :product-id="productId" @select-section="section = $event" />
      </div>
      <aside class="product-inspector">
        <fieldset :disabled="isSubmitting">
          <label class="admin-field mb-5">Edit section<select v-model="section">
            <option v-for="tab in sections" :key="tab.key" :value="tab.key">{{ tab.label }}</option>
          </select></label>
          <AdminProductDetailsFields v-if="section === 'details'" :form="form" :category-options="categoryOptions" :protein-options="proteinOptions" />
          <AdminProductVariantsEditor v-else-if="section === 'variants'" :form="form" />
          <section v-else-if="section === 'content'" class="admin-form-section">
            <h2>Storefront information</h2>
            <AdminProductContentFields :form="form" />
            <details class="mt-6 border-t border-[var(--admin-line)] pt-4">
              <summary class="cursor-pointer font-semibold">Guaranteed analysis</summary>
              <AdminProductGuaranteedAnalysisFields :form="form" />
            </details>
          </section>
          <section v-else class="space-y-5">
            <h2>Publishing</h2>
            <label class="admin-field">Status<select v-model="form.status" aria-label="Status">
              <option v-for="option in productStatusOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
            </select></label>
            <label class="admin-field">Selling mode<select v-model="form.sellingMode" aria-label="Selling mode">
              <option v-for="option in sellingModeOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
            </select></label>
            <label class="flex items-center gap-2"><input v-model="form.featured" type="checkbox" />Featured product</label>
          </section>
        </fieldset>
        <div class="admin-savebar">
          <button type="button" class="admin-button" :disabled="isSubmitting" @click="cancel">Cancel</button>
          <button type="submit" class="admin-button admin-primary" :disabled="isSubmitting"><AdminIcon name="save" />{{ submitButtonLabel }}</button>
        </div>
      </aside>
    </div>
  </form>
</template>
<style scoped>
.product-visual-editor { display: grid; grid-template-columns: minmax(0, 1fr) 360px; border: 1px solid var(--admin-line); border-radius: 6px; overflow: clip; align-items: start; }
.product-inspector { padding: 20px; min-width: 0; background: #fff; border-left: 1px solid var(--admin-line); }
@media (max-width: 1099px) { .product-visual-editor { grid-template-columns: minmax(0,1fr); } .product-inspector { border-left: 0; border-top: 1px solid var(--admin-line); } }
</style>
