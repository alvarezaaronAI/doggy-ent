import { computed, reactive, ref } from 'vue'

export function useAccountFieldValidation(validate) {
  const touched = reactive({})
  const submitted = ref(false)
  const errors = computed(() => Object.fromEntries(
    Object.entries(validate()).filter(([field, error]) => error && (submitted.value || touched[field])),
  ))
  const firstError = computed(() => submitted.value ? Object.values(errors.value)[0] || '' : '')
  const states = computed(() => Object.fromEntries(Object.entries(validate())
    .filter(([field]) => submitted.value || touched[field])
    .map(([field, error]) => [field, error ? 'invalid' : 'valid'])))
  function touch(field) { touched[field] = true }
  function check() { submitted.value = true; return !Object.values(validate()).some(Boolean) }
  function clear() { submitted.value = false; Object.keys(touched).forEach(field => delete touched[field]) }
  return { errors, states, firstError, touch, check, clear }
}
