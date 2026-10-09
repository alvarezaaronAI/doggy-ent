<script setup>
import AdminProductVariantEditor from './AdminProductVariantEditor.vue'
defineProps({ form: { type: Object, required: true } })
const variants = [
  {
    label: '6 oz',
    fields: [
      'sixOzPrice',
      'sixOzQuantity',
      'sixOzSku',
      'sixOzLowStockThreshold',
    ],
  },
  {
    label: '18 oz',
    fields: [
      'eighteenOzPrice',
      'eighteenOzQuantity',
      'eighteenOzSku',
      'eighteenOzLowStockThreshold',
    ],
  },
]
const labels = ['Price ($)', 'Stock quantity', 'SKU', 'Low-stock threshold']
</script>
<template>
  <section class="admin-form-section">
    <h2>Pricing &amp; inventory</h2>
    <section
      v-for="variant in variants"
      :key="variant.label"
      class="mt-5 border-b border-[var(--admin-line)] pb-6"
    >
      <h3 class="mb-4">{{ variant.label }}</h3>
      <div class="admin-form-grid">
        <AdminProductVariantEditor
          v-for="(field, index) in variant.fields"
          :key="field"
          :field="field"
          :form="form"
          :label="labels[index]"
          :input-type="index === 2 ? 'text' : 'number'"
          :step="index === 0 ? '0.01' : '1'"
          min="0"
          placeholder=""
          :required="index === 0"
        />
      </div>
    </section>
  </section>
</template>
