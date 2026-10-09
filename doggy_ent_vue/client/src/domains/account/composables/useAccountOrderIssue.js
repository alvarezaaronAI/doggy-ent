import { computed, reactive, ref } from 'vue'
import { createAccountOrderIssue } from '../api/account.api.js'
import { orderReference } from '../utils/accountFormatting.js'

export function useAccountOrderIssue(order, onCreated) {
  const categories = computed(() => order.support?.eligibility?.categories || [])
  const form = reactive({ category: categories.value[0] || '', item: '', message: '' })
  const saving = ref(false),
    error = ref(''),
    created = ref(null)
  async function submit() {
    if (saving.value || created.value) return
    error.value = ''
    if (!categories.value.includes(form.category) || !form.message.trim()) {
      error.value = 'Choose an available category and describe what happened.'
      return
    }
    saving.value = true
    try {
      created.value = await createAccountOrderIssue(orderReference(order), {
        category: form.category,
        message: [form.item ? `Affected item: ${form.item}` : '', form.message.trim()]
          .filter(Boolean)
          .join('\n\n'),
      })
      onCreated(created.value)
    } catch (cause) {
      error.value = cause.message || 'Unable to submit your request.'
    } finally {
      saving.value = false
    }
  }
  return { categories, form, saving, error, created, submit }
}
