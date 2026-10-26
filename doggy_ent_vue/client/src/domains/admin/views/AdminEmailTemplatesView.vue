<script setup>
import { Save } from '@lucide/vue'
import AdminPageHeader from '../components/AdminPageHeader.vue'
import AdminEmailPreview from '../components/AdminEmailPreview.vue'
import AdminCheckoutReceiptSettings from '../components/AdminCheckoutReceiptSettings.vue'
import { useAdminEmailTemplates } from '../composables/useAdminEmailTemplates.js'
const { templates, savedTemplates, starters, archivedTemplates, linkedCopy, draft, preview, provider, checkoutReceipt, loading, saving, dirty, error, message, previewError, select, save, cancel, load } = useAdminEmailTemplates()
</script>
<template>
  <section class="admin-page">
    <AdminPageHeader title="Email templates" eyebrow="Customer communications" />
    <p class="admin-muted mb-5">Choose the payment receipt for future checkouts. All other customer emails are previewed and sent manually from Orders.</p>
    <p v-if="error" role="alert" class="admin-alert admin-alert-error">{{ error }}</p><p v-if="message" role="status" class="admin-alert admin-alert-success">{{ message }}</p>
    <p v-if="loading" class="admin-state">Loading templates...</p>
    <template v-else-if="draft">
      <div class="flex flex-wrap items-center justify-between gap-3 py-4 mb-5 border-y border-[var(--admin-line)]"><span class="text-sm">{{ dirty ? 'Unsaved changes' : draft.suggested ? 'Starter template' : draft.archived ? 'Archived template' : 'All changes saved' }} · {{ provider?.live ? 'Live provider configured' : 'Provider in dry-run mode' }}</span><div class="flex gap-2"><button class="admin-button" :disabled="saving || !dirty" @click="cancel">Cancel changes</button><button class="admin-button admin-primary" :disabled="saving || (!dirty && !draft.suggested)" @click="save"><Save :size="16" />{{ saving ? 'Saving...' : linkedCopy ? 'Open saved template' : draft.suggested ? 'Add to my templates' : dirty ? 'Save changes' : 'Saved' }}</button></div></div>
      <div class="email-editor-grid">
        <nav class="space-y-4" aria-label="Email templates">
          <section aria-label="My templates"><h2 class="text-xs font-semibold mb-2">My templates</h2><p v-if="!savedTemplates.length" class="admin-muted text-xs">No saved templates yet.</p><button v-for="template in savedTemplates" :key="template.id" type="button" class="email-choice mb-2" :disabled="saving" :aria-pressed="draft.id === template.id" @click="select(template)">{{ template.name }}<small class="admin-muted block mt-1">Saved</small></button></section>
          <section aria-label="Starter templates"><h2 class="text-xs font-semibold mb-2">Starter templates</h2><button v-for="template in starters" :key="template.id" type="button" class="email-choice mb-2" :disabled="saving" :aria-pressed="draft.id === template.id" @click="select(template)">{{ template.name }}<small class="admin-muted block mt-1">{{ template.editableCopyId ? 'Already added' : 'Starter' }}</small></button></section>
          <details v-if="archivedTemplates.length"><summary class="admin-button text-xs">Archived ({{ archivedTemplates.length }})</summary><button v-for="template in archivedTemplates" :key="template.id" type="button" class="email-choice mt-2" :disabled="saving" :aria-pressed="draft.id === template.id" @click="select(template)">{{ template.name }}<small class="admin-muted block mt-1">Archived</small></button></details>
        </nav>
        <AdminEmailPreview :preview="preview" :error="previewError" />
        <aside class="email-fields"><AdminCheckoutReceiptSettings :settings="checkoutReceipt" :templates="templates" :template-dirty="dirty" @saved="checkoutReceipt = $event" /><fieldset :disabled="saving" class="space-y-4">
          <h2>Email content</h2>
          <p v-if="linkedCopy" class="admin-muted text-xs">This starter is already in My templates. Open your saved template to edit it; another copy will not be created.</p>
          <p v-else-if="!draft.suggested" class="admin-muted text-xs">Edit this template below, then save your changes. Saving updates this same template.</p>
          <label class="admin-field">Internal template name<input v-model="draft.name" maxlength="100" /></label>
          <label class="admin-field">Order update type<select v-model="draft.event"><option value="ORDER_CONFIRMATION">Payment confirmation</option><option value="ORDER_STATUS_UPDATE">Preparing order</option><option value="ORDER_SHIPPED">Order shipped</option><option value="ORDER_DELIVERED">Order delivered</option><option value="ORDER_CANCELLED">Order cancelled</option></select></label>
          <label class="admin-field">Email subject<input v-model="draft.subject" maxlength="200" /></label>
          <label class="admin-field">Main email heading<input v-model="draft.heading" maxlength="200" /></label>
          <label class="admin-field">Customer message<textarea v-model="draft.body" rows="7" maxlength="4000" /></label>
          <label class="admin-field">Closing reassurance<textarea v-model="draft.footer" rows="3" maxlength="1000" /></label>
          <label v-if="!draft.suggested" class="flex items-center gap-3"><input v-model="draft.archived" type="checkbox" />Archive template</label>
          <p class="admin-muted text-xs">Personalize with <code v-pre>{{customerName}}</code>, <code v-pre>{{orderReference}}</code> or <code v-pre>{{orderStatus}}</code>. Receipt items, totals and tracking use saved order data. Plain text only; layout and safe formatting are managed automatically.</p>
        </fieldset></aside>
      </div>
    </template>
    <button v-else class="admin-button" @click="load()">Try again</button>
  </section>
</template>
<style scoped>
.email-editor-grid { display: grid; grid-template-columns: 155px minmax(0, 1fr) 290px; gap: 16px; align-items: start; }
.email-choice { width: 100%; min-height: 44px; padding: 12px; text-align: left; border: 1px solid var(--admin-line); border-radius: 4px; background: #eff1ef; font-size: 13px; }
.email-choice[aria-pressed='true'] { background: #edf6f0; border-color: #17634c; color: #17634c; }
.email-fields { min-width: 0; padding: 16px; background: white; border: 1px solid var(--admin-line); border-radius: 6px; max-height: 80svh; overflow: auto; }
@media(max-width: 1099px) { .email-editor-grid { grid-template-columns: minmax(0,1fr) 290px; } nav { grid-column: 1/-1; display: flex; flex-wrap: wrap; gap: 8px; } .email-choice { width: auto; } }
@media(max-width: 799px) { .email-editor-grid { grid-template-columns: minmax(0,1fr); } .email-fields { order: -1; max-height: none; } nav { order: -2; } }
</style>
