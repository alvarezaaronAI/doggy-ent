<script setup>
import { computed, ref } from 'vue'
import { CircleAlert, CircleCheck, Eye, EyeOff } from '@lucide/vue'
const props = defineProps({
  modelValue: { type: String, default: '' },
  id: { type: String, required: true },
  label: { type: String, default: 'Password' },
  autocomplete: { type: String, default: 'current-password' },
  hint: { type: String, default: '' },
  error: { type: String, default: '' },
  placeholder: { type: String, default: 'Enter your password' },
  disabled: Boolean,
  invalid: Boolean,
  valid: Boolean,
})
defineEmits(['update:modelValue', 'blur'])
const visible = ref(false)
const capsLock = ref(false)
const describedBy = computed(() => [props.hint && `${props.id}-hint`, props.error && `${props.id}-error`, capsLock.value && !props.error && `${props.id}-caps`].filter(Boolean).join(' ') || undefined)
</script>
<template>
  <div>
    <label :for="id" class="auth-label flex items-center justify-between gap-2">{{ label }}<CircleCheck v-if="valid && !invalid && !error" :size="16" class="auth-valid-icon" aria-hidden="true" /></label>
    <div class="relative mt-2">
      <input :id="id" :name="id" :value="modelValue" :type="visible ? 'text' : 'password'" :autocomplete="autocomplete" :placeholder="placeholder" :disabled="disabled" :aria-invalid="Boolean(error || invalid) || undefined" :data-state="error || invalid ? 'invalid' : valid ? 'valid' : 'neutral'" :aria-describedby="describedBy" autocapitalize="none" :spellcheck="false" required maxlength="128" class="auth-input auth-password-input" @input="$emit('update:modelValue', $event.target.value)" @keydown="capsLock = $event.getModifierState('CapsLock')" @keyup="capsLock = $event.getModifierState('CapsLock')" @blur="capsLock = false; $emit('blur')" />
      <button type="button" class="auth-password-toggle" :title="`${visible ? 'Hide' : 'Show'} ${label.toLowerCase()}`" :aria-label="`${visible ? 'Hide' : 'Show'} ${label.toLowerCase()}`" :aria-pressed="visible" :disabled="disabled" @click="visible = !visible"><EyeOff v-if="visible" :size="19" aria-hidden="true" /><Eye v-else :size="19" aria-hidden="true" /></button>
    </div>
    <div class="auth-field-feedback">
      <p v-if="hint" :id="`${id}-hint`" class="auth-hint" :class="{ 'sr-only': error || capsLock }">{{ hint }}</p>
      <p v-if="error" :id="`${id}-error`" class="auth-field-error"><CircleAlert :size="16" aria-hidden="true" /><span>{{ error }}</span></p>
      <p v-else-if="capsLock" :id="`${id}-caps`" class="auth-hint" role="status">Caps Lock is on.</p>
    </div>
  </div>
</template>
