<script setup>
defineProps({
  field: {
    type: String,
    required: true,
  },
  form: {
    type: Object,
    required: true,
  },
  inputType: {
    type: String,
    default: 'text',
  },
  label: {
    type: String,
    required: true,
  },
  min: {
    type: String,
    default: null,
  },
  placeholder: {
    type: String,
    required: true,
  },
  required: {
    type: Boolean,
    default: false,
  },
  step: {
    type: String,
    default: null,
  },
})
</script>

<template>
  <div>
    <label
      :for="'admin-product-' + field"
      class="mb-2 block text-sm font-semibold text-[var(--brand-4)]"
      >{{ label }}<span v-if="required"> *</span></label
    >
    <input
      v-model="form[field]"
      :id="'admin-product-' + field"
      :type="inputType"
      :min="min"
      :step="step"
      class="w-full rounded-2xl border border-stone-700 bg-white px-4 py-3 outline-none"
      :placeholder="placeholder"
    />
  </div>
</template>
