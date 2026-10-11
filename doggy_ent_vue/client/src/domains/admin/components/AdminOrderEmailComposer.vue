<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { Mail, Send } from '@lucide/vue'
import { fetchEmailTemplates, previewEmailTemplate, sendOrderEmail } from '../api/adminEmailTemplates.api.js'
import AdminEmailPreview from './AdminEmailPreview.vue'
const props = defineProps({ order: { type: Object, required: true } })
const emit = defineEmits(['sent'])
const templates = ref([]), selected = ref(''), preview = ref(null), error = ref(''), message = ref(''), busy = ref(false), live = ref(false), confirmed = ref(false)
let generation = 0
const choices = computed(() => templates.value.filter(item => !item.archived))
function invalidate() { generation++; preview.value = null; confirmed.value = false; live.value = false }
watch(selected, invalidate)
watch(() => props.order.updatedAt, invalidate)
onMounted(async () => {
  try {
    const data = await fetchEmailTemplates(); templates.value = data.templates
    const event = ({ PROCESSING: 'ORDER_STATUS_UPDATE', SHIPPED: 'ORDER_SHIPPED', DELIVERED: 'ORDER_DELIVERED', CANCELLED: 'ORDER_CANCELLED' })[props.order.status] || 'ORDER_CONFIRMATION'
    selected.value = choices.value.find(item => item.event === event)?.id || ''
  } catch (e) { error.value = e.message }
})
async function prepare() {
  invalidate(); const requestId = generation; busy.value = true; error.value = ''; message.value = ''
  try { const result = await previewEmailTemplate(selected.value, { orderId: props.order.id }); if (requestId === generation) preview.value = result }
  catch (e) { error.value = e.message } finally { busy.value = false }
}
async function send() {
  if (!preview.value?.previewProof || !confirmed.value || busy.value) return
  busy.value = true; error.value = ''; message.value = ''
  try {
    const result = await sendOrderEmail(selected.value, { previewProof: preview.value.previewProof, dryRun: !live.value, confirmed: true })
    message.value = result.message; invalidate(); emit('sent', result.message)
  } catch (e) { error.value = e.message; invalidate() } finally { busy.value = false }
}
</script>
<template>
  <section class="admin-form-section">
    <div class="admin-row"><h2>Customer email</h2><RouterLink class="admin-link" to="/admin/email-templates">Edit templates</RouterLink></div>
    <p class="admin-muted mt-2 text-sm">No order emails send automatically. Preview the saved order and recipient first.</p>
    <p v-if="error" role="alert" class="admin-alert admin-alert-error mt-4">{{ error }}</p><p v-if="message" role="status" class="admin-alert mt-4">{{ message }}</p>
    <fieldset :disabled="busy" class="mt-4 space-y-4">
      <label class="admin-field">Customer email template<select v-model="selected"><option value="" disabled>Choose template</option><option v-for="template in choices" :key="template.id" :value="template.id">{{ template.name }}{{ template.suggested ? ' · Suggested' : '' }}</option></select></label>
      <button class="admin-button" type="button" :disabled="!selected || busy" @click="prepare"><Mail :size="16" />{{ busy ? 'Working...' : 'Preview customer email' }}</button>
      <template v-if="preview">
        <AdminEmailPreview :preview="preview" />
        <label v-if="preview.provider.live" class="flex items-start gap-3 text-sm"><input v-model="live" type="checkbox" class="mt-1" />Send a real email to the recipient above. Unchecked records a dry run only.</label>
        <p v-else class="admin-muted text-sm">Live email is disabled. This action records a dry run only.</p>
        <label class="flex items-start gap-3 text-sm"><input v-model="confirmed" type="checkbox" class="mt-1" />I reviewed the recipient, order details and message.</label>
        <button class="admin-button admin-primary" type="button" :disabled="!confirmed || busy" @click="send"><Send :size="16" />{{ live ? 'Send customer email' : 'Record dry run' }}</button>
      </template>
    </fieldset>
  </section>
</template>
