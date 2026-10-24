<script setup>
import { computed } from 'vue'
import { CircleAlert, CircleCheck } from '@lucide/vue'
const props = defineProps({
  modelValue: { type: String, default: '' },
  id: { type: String, required: true },
  label: { type: String, required: true },
  name: { type: String, default: '' },
  type: { type: String, default: 'text' },
  autocomplete: { type: String, default: '' },
  placeholder: { type: String, default: '' },
  hint: { type: String, default: '' },
  error: { type: String, default: '' },
  maxlength: { type: Number, default: 254 },
  invalid: Boolean,
  valid: Boolean,
  disabled: Boolean,
})
defineEmits(['update:modelValue', 'blur'])
const describedBy = computed(() => [props.hint && `${props.id}-hint`, props.error && `${props.id}-error`].filter(Boolean).join(' ') || undefined)
</script>
<template>
  <div class="auth-field">
    <label :for="id" class="auth-label flex items-center justify-between gap-2">{{ label }}<CircleCheck v-if="valid && !invalid && !error" :size="16" class="auth-valid-icon" aria-hidden="true" /></label>
    <input :id="id" :name="name || id" :value="modelValue" :type="type" :autocomplete="autocomplete" :placeholder="placeholder" :maxlength="maxlength" :inputmode="type === 'email' ? 'email' : undefined" :autocapitalize="type === 'email' ? 'none' : 'words'" :spellcheck="false" :disabled="disabled" :aria-invalid="Boolean(error || invalid) || undefined" :data-state="error || invalid ? 'invalid' : valid ? 'valid' : 'neutral'" :aria-describedby="describedBy" required class="auth-input mt-2" @input="$emit('update:modelValue', $event.target.value)" @blur="$emit('blur')" />
    <div class="auth-field-feedback">
      <p v-if="hint" :id="`${id}-hint`" class="auth-hint" :class="{ 'sr-only': error }">{{ hint }}</p>
      <p v-if="error" :id="`${id}-error`" class="auth-field-error"><CircleAlert :size="16" aria-hidden="true" /><span>{{ error }}</span></p>
    </div>
  </div>
</template>
