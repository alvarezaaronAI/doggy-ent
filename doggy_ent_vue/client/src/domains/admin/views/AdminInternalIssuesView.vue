<script setup>
import { onMounted } from 'vue'
import AdminPageHeader from '../components/AdminPageHeader.vue'
import AdminMetrics from '../components/AdminMetrics.vue'
import AdminIssueHistory from '../components/AdminIssueHistory.vue'
import { useAdminIssueWorkspace } from '../composables/useAdminIssueWorkspace'
import {
  fetchAdminInternalIssues,
  updateAdminInternalIssue,
} from '../api/adminSupport.api'
import {
  INTERNAL_ISSUE_STATUSES as statuses,
  INTERNAL_ISSUE_SEVERITIES as severities,
} from '../constants/adminSupport.constants'
import {
  formatAdminDate as date,
  formatAdminLabel as label,
} from '../utils/adminWorkspace.formatters'
const {
  issues,
  counts,
  loading,
  saving,
  error,
  message,
  selectedCaseNumber,
  selectedIssue,
  filters,
  editForm,
  dirty,
  cancel,
  selectIssue,
  loadIssues,
  saveIssue,
} = useAdminIssueWorkspace({
  fetchIssues: fetchAdminInternalIssues,
  updateIssue: updateAdminInternalIssue,
  defaults: {
    status: 'NEW',
    severity: 'MEDIUM',
    reviewNotes: '',
    resolutionNotes: '',
  },
  initialFilters: { search: '', status: '' },
})
onMounted(loadIssues)
</script>
<template>
  <section class="admin-page">
    <AdminPageHeader title="Internal issues" eyebrow="Operations" />
    <p v-if="error" class="admin-alert admin-error" role="alert">{{ error }}</p>
    <p v-if="message" class="admin-alert admin-success" role="status">
      {{ message }}
    </p>
    <AdminMetrics
      :loading="loading"
      :items="[
        { label: 'Open', value: counts.open ?? 'Unavailable' },
        { label: 'Severe', value: counts.severe ?? 'Unavailable' },
        { label: 'All issues', value: counts.total ?? 'Unavailable' },
      ]"
    />
    <form class="admin-filters" @submit.prevent="loadIssues">
      <label class="admin-field grow"
        >Search issues<input
          v-model="filters.search"
          type="search"
          placeholder="Case, fingerprint, source or summary" /></label
      ><label class="admin-field"
        >Status<select aria-label="Status" v-model="filters.status">
          <option value="">All statuses</option>
          <option v-for="status in statuses" :key="status" :value="status">
            {{ label(status) }}
          </option>
        </select></label
      ><button class="admin-button" :disabled="loading || saving">
        Apply filters
      </button>
    </form>
    <p v-if="loading" class="admin-state" role="status">
      Loading internal issues...
    </p>
    <div v-else class="admin-split">
      <section aria-label="Internal issue list">
        <button
          v-for="issue in issues"
          :key="issue.caseNumber"
          class="admin-record"
          :aria-pressed="selectedCaseNumber === issue.caseNumber"
          :disabled="saving"
          @click="selectIssue(issue)"
        >
          <span class="admin-muted">{{ issue.caseNumber }}</span
          ><strong class="block mt-2">{{ issue.summary }}</strong
          ><span class="block admin-muted mt-2"
            >{{ issue.source }} · {{ issue.category }}</span
          ><span
            class="admin-badge mt-3"
            :class="{
              'is-danger': ['HIGH', 'SEVERE'].includes(issue.severity),
            }"
            >{{ label(issue.severity) }}</span
          ><span class="block admin-muted mt-3"
            >{{ label(issue.status) }} · Seen
            {{ issue.occurrenceCount }} times</span
          >
        </button>
        <p v-if="!issues.length" class="admin-state">
          {{
            error
              ? 'Issues unavailable. Apply filters to retry.'
              : 'No issues match your filters.'
          }}
        </p>
      </section>
      <section v-if="selectedIssue" class="min-w-0 admin-detail">
        <p class="admin-muted">{{ selectedIssue.caseNumber }}</p>
        <h2 class="mt-2">{{ selectedIssue.summary }}</h2>
        <p class="admin-muted mt-2">
          {{ selectedIssue.source }} ·
          {{ selectedIssue.route || 'No route captured' }}
        </p>
        <dl class="admin-form-grid admin-form-section mt-6">
          <div>
            <dt class="admin-muted">First seen</dt>
            <dd>{{ date(selectedIssue.firstSeenAt) }}</dd>
          </div>
          <div>
            <dt class="admin-muted">Last seen</dt>
            <dd>{{ date(selectedIssue.lastSeenAt) }}</dd>
          </div>
          <div class="sm:col-span-2">
            <dt class="admin-muted">Fingerprint</dt>
            <dd class="break-all">{{ selectedIssue.fingerprint }}</dd>
          </div>
          <div class="sm:col-span-2">
            <dt class="admin-muted">Safe details</dt>
            <dd class="whitespace-pre-wrap break-words mt-2">
              {{ selectedIssue.safeDetails || 'No details captured.' }}
            </dd>
          </div>
        </dl>
        <form class="admin-form-section" @submit.prevent="saveIssue">
          <div class="admin-form-grid">
            <label class="admin-field"
              >Status<select
                aria-label="Status"
                v-model="editForm.status"
                :disabled="saving"
              >
                <option
                  v-for="status in statuses"
                  :key="status"
                  :value="status"
                >
                  {{ label(status) }}
                </option>
              </select></label
            ><label class="admin-field"
              >Severity<select
                aria-label="Severity"
                v-model="editForm.severity"
                :disabled="saving"
              >
                <option
                  v-for="severity in severities"
                  :key="severity"
                  :value="severity"
                >
                  {{ label(severity) }}
                </option>
              </select></label
            >
          </div>
          <label class="admin-field mt-4"
            >Review notes<textarea
              v-model="editForm.reviewNotes"
              :disabled="saving"
              rows="3"
            ></textarea></label
          ><label class="admin-field mt-4"
            >Resolution notes<textarea
              v-model="editForm.resolutionNotes"
              :disabled="saving"
              rows="3"
            ></textarea>
          </label>
          <div class="flex gap-3 mt-4">
            <button
              class="admin-button admin-primary"
              :disabled="saving || !dirty"
            >
              {{ saving ? 'Saving...' : 'Save changes' }}</button
            ><button
              type="button"
              class="admin-button"
              :disabled="saving || !dirty"
              @click="cancel"
            >
              Cancel
            </button>
          </div>
        </form>
        <AdminIssueHistory :events="selectedIssue.events" />
        <div class="admin-row flex-wrap">
          <RouterLink
            v-if="selectedIssue.orderId"
            class="admin-link"
            :to="'/admin/orders/' + selectedIssue.orderId"
            >Related order</RouterLink
          ><RouterLink
            v-if="selectedIssue.customerId"
            class="admin-link"
            :to="'/admin/customers/' + selectedIssue.customerId"
            >Related customer</RouterLink
          >
        </div>
      </section>
    </div>
  </section>
</template>
