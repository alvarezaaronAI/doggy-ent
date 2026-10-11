<script setup>
import { Save } from '@lucide/vue'
import AdminPageHeader from '../components/AdminPageHeader.vue'
import AdminEmailPreview from '../components/AdminEmailPreview.vue'
import { useAdminEmailTemplates } from '../composables/useAdminEmailTemplates.js'
const { templates, draft, preview, provider, loading, saving, dirty, error, message, previewError, select, save, cancel, load } = useAdminEmailTemplates()
</script>
<template>
  <section class="admin-page">
    <AdminPageHeader title="Email templates" eyebrow="Customer communications" />
    <p class="admin-muted mb-5">Write once, preview with a real order, then send from Orders. Saving never sends an email.</p>
    <p v-if="error" role="alert" class="admin-alert admin-alert-error">{{ error }}</p><p v-if="message" role="status" class="admin-alert admin-alert-success">{{ message }}</p>
    <p v-if="loading" class="admin-state">Loading templates...</p>
    <template v-else-if="draft">
      <div class="flex flex-wrap items-center justify-between gap-3 py-4 mb-5 border-y border-[var(--admin-line)]"><span class="text-sm">{{ dirty ? 'Unsaved changes' : draft.suggested ? 'Suggested template · Save to customize' : 'Saved template' }} · {{ provider?.live ? 'Live provider configured' : 'Provider in dry-run mode' }}</span><div class="flex gap-2"><button class="admin-button" :disabled="saving || !dirty" @click="cancel">Cancel changes</button><button class="admin-button admin-primary" :disabled="saving || (!dirty && !draft.suggested)" @click="save"><Save :size="16" />{{ saving ? 'Saving...' : draft.suggested ? 'Save editable copy' : 'Save template' }}</button></div></div>
      <div class="email-editor-grid">
        <nav class="space-y-2" aria-label="Email templates"><button v-for="template in templates" :key="template.id" type="button" class="email-choice" :aria-pressed="draft.id === template.id" @click="select(template)"><span>{{ template.name }}</span><small class="admin-muted block mt-1">{{ template.archived ? 'Archived' : template.suggested ? 'Suggested' : 'Saved' }}</small></button></nav>
        <AdminEmailPreview :preview="preview" :error="previewError" />
        <aside class="email-fields"><fieldset :disabled="saving" class="space-y-4">
          <h2>Email content</h2>
          <label class="admin-field">Internal template name<input v-model="draft.name" maxlength="100" /></label>
          <label class="admin-field">Order update type<select v-model="draft.event"><option value="ORDER_CONFIRMATION">Order received</option><option value="ORDER_STATUS_UPDATE">Preparing order</option><option value="ORDER_SHIPPED">Order shipped</option><option value="ORDER_DELIVERED">Order delivered</option><option value="ORDER_CANCELLED">Order cancelled</option></select></label>
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
