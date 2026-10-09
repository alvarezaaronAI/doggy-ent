<script setup>
import { computed, nextTick, ref } from 'vue'
import CampaignPageContent from '@campaigns/components/CampaignPageContent.vue'
import AdminCampaignSectionFields from './AdminCampaignSectionFields.vue'
import AdminIcon from './AdminIcon.vue'
import { CAMPAIGN_EDITOR_SECTIONS } from '../constants/adminCampaignEditor.constants.js'
import { mapAdminCampaignCanvas } from '../mappers/adminCampaignForm.mapper.js'
const props = defineProps({
  editingCampaignId: [String, Number],
  errorMessage: String,
  form: { type: Object, required: true },
  isSaving: Boolean,
  products: { type: Array, required: true },
})
const emit = defineEmits(['reset', 'submit'])
const section = ref('hero')
const inspector = ref(null)
const initial = JSON.stringify(props.form)
const campaign = computed(() => mapAdminCampaignCanvas(props.form))
async function selectSection(key) {
  section.value = key
  await nextTick()
  inspector.value
    ?.querySelector('input, textarea, select')
    ?.focus({ preventScroll: true })
}
function cancel() {
  if (
    JSON.stringify(props.form) !== initial &&
    !window.confirm('Discard unsaved campaign changes?')
  )
    return
  emit('reset')
}
</script>
<template>
  <form class="campaign-editor" @submit.prevent="emit('submit')">
    <div v-if="errorMessage" class="admin-alert admin-error" role="alert">
      {{ errorMessage }}
    </div>
    <div class="campaign-editor-grid">
      <div class="campaign-canvas">
        <div class="campaign-canvas-toolbar">
          <span
            >{{
              form.publicPageEnabled
                ? 'Public page enabled'
                : 'Public page disabled'
            }}
            · {{ form.status }}</span
          ><span>{{ isSaving ? 'Saving...' : 'Unsaved editor' }}</span>
        </div>
        <CampaignPageContent
          :campaign="campaign"
          :products="products"
          editable
          :active-section="section"
          @select-section="selectSection"
        />
      </div>
      <aside
        ref="inspector"
        class="campaign-inspector"
        aria-label="Campaign editing controls"
      >
        <fieldset :disabled="isSaving">
          <label class="admin-field mb-6"
            >Edit section<select v-model="section" aria-label="Edit section">
              <option
                v-for="item in CAMPAIGN_EDITOR_SECTIONS"
                :key="item.key"
                :value="item.key"
              >
                {{ item.label }}
              </option>
            </select></label
          >
          <AdminCampaignSectionFields
            :section="section"
            :form="form"
            :products="products"
          />
        </fieldset>
        <div class="campaign-editor-savebar">
          <button
            type="submit"
            class="admin-button admin-primary"
            :disabled="isSaving"
          >
            <AdminIcon name="save" />{{
              isSaving ? 'Saving...' : 'Save campaign'
            }}
          </button>
          <button
            type="button"
            class="admin-button"
            :disabled="isSaving"
            @click="cancel"
          >
            Cancel
          </button>
        </div>
      </aside>
    </div>
  </form>
</template>
<style scoped>
.campaign-editor-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 320px;
  gap: 24px;
  align-items: start;
}
.campaign-canvas {
  min-width: 0;
  border: 1px solid var(--admin-line);
  background: #fff;
  border-radius: 6px;
  overflow: hidden;
}
.campaign-canvas-toolbar {
  padding: 12px 16px;
  border-bottom: 1px solid var(--admin-line);
  background: var(--admin-soft);
  font-size: 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: space-between;
  color: var(--admin-muted);
}
.campaign-inspector {
  position: sticky;
  top: 24px;
  min-width: 0;
  padding: 20px;
  background: #fff;
  border: 1px solid var(--admin-line);
  border-radius: 6px;
  max-height: calc(100svh - 48px);
  overflow: auto;
}
.campaign-editor-savebar {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  border-top: 1px solid var(--admin-line);
  margin-top: 24px;
  padding-top: 20px;
  background: #fff;
  position: sticky;
  bottom: -20px;
  padding-bottom: 20px;
}
@media (max-width: 1199px) {
  .campaign-editor-grid {
    grid-template-columns: minmax(0, 1fr) 280px;
    gap: 16px;
  }
}
@media (max-width: 999px) {
  .campaign-editor-grid {
    grid-template-columns: 1fr;
  }
  .campaign-inspector {
    position: static;
    max-height: none;
    order: -1;
  }
}
</style>
