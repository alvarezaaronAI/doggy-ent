<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { onBeforeRouteLeave } from 'vue-router'
import { ReceiptText, Save, ShieldCheck } from '@lucide/vue'
import { saveCheckoutReceiptSettings } from '../api/adminEmailTemplates.api.js'
const props = defineProps({ settings: Object, templates: { type: Array, default: () => [] }, templateDirty: Boolean })
const emit = defineEmits(['saved'])
const draft = ref({ mode: 'DISABLED', templateId: null, revision: 0 })
const busy = ref(false), error = ref(''), message = ref('')
const saved = computed(() => ({ mode: props.settings?.mode || 'DISABLED', templateId: props.settings?.templateId || null, revision: props.settings?.revision || 0 }))
const eligible = computed(() => props.templates.filter(template => !template.suggested && !template.archived && template.event === 'ORDER_CONFIRMATION'))
const dirty = computed(() => draft.value.mode !== saved.value.mode || draft.value.templateId !== saved.value.templateId)
watch(saved, value => { draft.value = { ...value } }, { immediate: true })
async function save() {
  if (busy.value || props.templateDirty) return
  busy.value = true; error.value = ''; message.value = ''
  try { const result = await saveCheckoutReceiptSettings({ ...draft.value }); emit('saved', result); message.value = 'Receipt settings saved. This action did not send an email.' }
  catch (failure) { error.value = failure.message }
  finally { busy.value = false }
}
function cancel() { draft.value = { ...saved.value }; error.value = ''; message.value = '' }
const beforeUnload = event => { if (dirty.value) { event.preventDefault(); event.returnValue = '' } }
onMounted(() => window.addEventListener('beforeunload', beforeUnload))
onBeforeUnmount(() => window.removeEventListener('beforeunload', beforeUnload))
onBeforeRouteLeave(() => !busy.value && (!dirty.value || window.confirm('Leave without saving receipt settings?')))
</script>
<template>
  <section class="receipt-settings" aria-labelledby="checkout-receipt-title">
    <div class="flex items-center gap-2"><ReceiptText :size="18" class="text-[#17634c]" /><h2 id="checkout-receipt-title" class="text-sm font-semibold">After checkout</h2></div>
    <p class="admin-muted mt-2 text-xs leading-relaxed">One payment-confirmation receipt per paid order. Preparation, shipping and other updates stay manual.</p>
    <p class="admin-muted mt-2 text-xs leading-relaxed">Off pauses the queue. Enabling live mode releases queued live receipts as well as future receipts. Test records are never converted into real sends.</p>
    <fieldset :disabled="busy" class="mt-4 space-y-3">
      <div class="admin-field"><label for="checkout-receipt-mode">Automatic payment receipt</label><select id="checkout-receipt-mode" v-model="draft.mode"><option value="DISABLED">Off</option><option value="DRY_RUN">Test only · no email sent</option><option value="LIVE" :disabled="!settings?.liveAvailable">Live · send payment receipts</option></select></div>
      <div class="admin-field"><label for="checkout-receipt-template">Saved receipt template</label><select id="checkout-receipt-template" v-model="draft.templateId"><option :value="null">Choose a saved template</option><option v-for="template in eligible" :key="template.id" :value="template.id">{{ template.name }}</option></select></div>
      <p v-if="!eligible.length" class="admin-muted text-xs leading-relaxed">Save an editable copy of Payment confirmation first. Suggested or archived templates cannot be selected.</p>
      <p v-if="draft.templateId && !eligible.some(template => template.id === draft.templateId)" role="alert" class="admin-alert admin-alert-error text-xs">The selected template is unavailable. Choose an active payment-confirmation template before enabling receipts.</p>
      <p v-if="!settings?.liveAvailable" class="flex items-start gap-2 text-xs leading-relaxed text-stone-600"><ShieldCheck :size="15" class="shrink-0 mt-0.5" />Live sending is locked until the domain/provider is verified and the server sending switch is enabled.</p>
      <p v-if="templateDirty" class="admin-muted text-xs">Save or cancel your template changes before changing receipt settings.</p>
      <p v-if="error" role="alert" class="admin-alert admin-alert-error text-xs">{{ error }}</p><p v-if="message" role="status" class="text-xs leading-relaxed text-[#17634c]">{{ message }}</p>
      <div class="flex flex-wrap gap-2"><button class="admin-button" type="button" :disabled="!dirty || busy" @click="cancel">Cancel</button><button class="admin-button admin-primary" type="button" :disabled="!dirty || busy || templateDirty || (draft.mode !== 'DISABLED' && !draft.templateId)" @click="save"><Save :size="15" />{{ busy ? 'Saving...' : 'Save receipt settings' }}</button></div>
    </fieldset>
  </section>
</template>
<style scoped>
.receipt-settings { padding-bottom: 20px; margin-bottom: 20px; border-bottom: 1px solid var(--admin-line); }
select { width: 100%; min-width: 0; }
</style>
