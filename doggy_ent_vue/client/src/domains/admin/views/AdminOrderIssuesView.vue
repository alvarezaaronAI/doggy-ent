<script setup>
import { onMounted } from 'vue'
import AdminPageHeader from '../components/AdminPageHeader.vue'
import AdminMetrics from '../components/AdminMetrics.vue'
import AdminIssueHistory from '../components/AdminIssueHistory.vue'
import { useAdminOrderIssues } from '../composables/useAdminOrderIssues'
import {
  ORDER_ISSUE_STATUSES as statuses,
  ORDER_ISSUE_CATEGORIES as categories,
  ORDER_ISSUE_PRIORITIES as priorities,
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
  messageForm,
  clearMessage,
  addMessage,
} = useAdminOrderIssues()
onMounted(loadIssues)
</script>
<template>
  <section class="admin-page">
    <AdminPageHeader title="Order issues" eyebrow="Customer care" />
    <p v-if="error" class="admin-alert admin-error" role="alert">{{ error }}</p>
    <p v-if="message" class="admin-alert admin-success" role="status">
      {{ message }}
    </p>
    <AdminMetrics
      :loading="loading"
      :items="[
        { label: 'Open cases', value: counts.open ?? 'Unavailable' },
        {
          label: 'Action required',
          value: counts.actionRequired ?? 'Unavailable',
        },
        { label: 'All cases', value: counts.total ?? 'Unavailable' },
      ]"
    />
    <form class="admin-filters" @submit.prevent="loadIssues">
      <label class="admin-field grow"
        >Search cases<input
          v-model="filters.search"
          type="search"
          placeholder="Case, order or customer" /></label
      ><label class="admin-field"
        >Status<select aria-label="Status" v-model="filters.status">
          <option value="">All statuses</option>
          <option v-for="status in statuses" :key="status" :value="status">
            {{ label(status) }}
          </option>
        </select></label
      ><label class="admin-field"
        >Category<select aria-label="Category" v-model="filters.category">
          <option value="">All categories</option>
          <option
            v-for="category in categories"
            :key="category"
            :value="category"
          >
            {{ label(category) }}
          </option>
        </select></label
      ><button class="admin-button" :disabled="loading || saving">
        Apply filters
      </button>
    </form>
    <p v-if="loading" class="admin-state" role="status">Loading cases...</p>
    <div v-else class="admin-split">
      <section aria-label="Order issue list">
        <button
          v-for="issue in issues"
          :key="issue.caseNumber"
          class="admin-record"
          :aria-pressed="selectedCaseNumber === issue.caseNumber"
          :disabled="saving"
          @click="selectIssue(issue)"
        >
          <span class="admin-muted"
            >{{ issue.caseNumber }} · {{ issue.orderReference }}</span
          ><strong class="block mt-2">{{ issue.subject }}</strong
          ><span class="block admin-muted mt-1">{{
            issue.customerName || issue.customerEmail
          }}</span
          ><span
            class="admin-badge mt-3"
            :class="{ 'is-warning': issue.status === 'ACTION_REQUIRED' }"
            >{{ label(issue.status) }}</span
          ><span class="block admin-muted mt-3"
            >{{ label(issue.category) }} · {{ date(issue.updatedAt) }}</span
          >
        </button>
        <p v-if="!issues.length" class="admin-state">
          {{
            error
              ? 'Cases unavailable. Apply filters to retry.'
              : 'No cases match your filters.'
          }}
        </p>
      </section>
      <section v-if="selectedIssue" class="min-w-0 admin-detail">
        <div class="admin-row justify-between mb-5">
          <div>
            <p class="admin-muted">{{ selectedIssue.caseNumber }}</p>
            <h2 class="mt-2">{{ selectedIssue.subject }}</h2>
            <p class="admin-muted mt-2">
              {{ selectedIssue.customerName || 'Customer' }} ·
              {{ selectedIssue.customerEmail }}
            </p>
          </div>
          <RouterLink
            v-if="selectedIssue.order?.id"
            class="admin-button"
            :to="'/admin/orders/' + selectedIssue.order.id"
            >Open order</RouterLink
          >
        </div>
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
              >Priority<select
                aria-label="Priority"
                v-model="editForm.priority"
                :disabled="saving"
              >
                <option
                  v-for="priority in priorities"
                  :key="priority"
                  :value="priority"
                >
                  {{ label(priority) }}
                </option>
              </select></label
            >
          </div>
          <label class="admin-field mt-4"
            >Resolution summary<textarea
              v-model="editForm.resolutionSummary"
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
        <section class="admin-form-section">
          <h3>Customer message</h3>
          <p class="mt-3 whitespace-pre-line">{{ selectedIssue.message }}</p>
        </section>
        <section class="admin-form-section">
          <h3>Conversation &amp; internal notes</h3>
          <div
            v-for="entry in selectedIssue.messages"
            :key="entry.id"
            class="border-l-2 pl-4 py-3 mt-4"
            :class="
              entry.visibility === 'INTERNAL'
                ? 'border-amber-300'
                : 'border-emerald-500'
            "
          >
            <span
              class="admin-badge"
              :class="{ 'is-warning': entry.visibility === 'INTERNAL' }"
              >{{
                entry.visibility === 'INTERNAL'
                  ? 'Internal note'
                  : 'Customer-visible reply'
              }}</span
            >
            <p class="whitespace-pre-line mt-3">{{ entry.body }}</p>
            <p class="admin-muted mt-2">
              {{ date(entry.createdAt)
              }}<span v-if="entry.emailRequested">
                · Email follow-up requested</span
              >
            </p>
          </div>
          <p v-if="!selectedIssue.messages?.length" class="admin-muted mt-3">
            No replies or notes yet.
          </p>
        </section>
        <form class="admin-form-section" @submit.prevent="addMessage">
          <h3>Write an update</h3>
          <label class="admin-field mt-4"
            >Visibility<select
              aria-label="Visibility"
              v-model="messageForm.visibility"
              :disabled="saving"
            >
              <option value="INTERNAL">Internal note only</option>
              <option value="CUSTOMER">Customer-visible account reply</option>
            </select></label
          ><label class="admin-field mt-4"
            >Message<textarea
              v-model="messageForm.body"
              :disabled="saving"
              rows="4"
              required
            ></textarea></label
          ><label class="flex items-start gap-3 mt-4"
            ><input
              v-model="messageForm.emailRequested"
              :disabled="saving"
              type="checkbox"
            /><span
              >Mark email follow-up requested. This does not send an
              email.</span
            ></label
          >
          <div class="flex gap-3 mt-4">
            <button
              class="admin-button admin-primary"
              :disabled="saving || !messageForm.body.trim()"
            >
              Save message</button
            ><button
              class="admin-button"
              type="button"
              :disabled="saving"
              @click="clearMessage"
            >
              Cancel
            </button>
          </div>
        </form>
        <AdminIssueHistory :events="selectedIssue.events" />
      </section>
    </div>
  </section>
</template>
