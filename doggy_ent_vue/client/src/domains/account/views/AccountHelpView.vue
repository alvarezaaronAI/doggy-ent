<template>
  <header class="account-heading">
    <h1>Order help</h1>
    <p>Your order questions, kept together.</p>
  </header>
  <section class="account-section">
    <div class="account-row">
      <div>
        <h2>Need help with an order?</h2>
        <p class="account-muted mt-2 text-sm">Choose your order so its details come with you.</p>
      </div>
      <RouterLink to="/account/orders" class="account-button account-button--primary"
        ><i class="fa-regular fa-comment" aria-hidden="true"></i>Get order help</RouterLink
      >
    </div>
  </section>
  <section class="account-section">
    <div class="account-row">
      <h2>Your cases</h2>
      <span v-if="!loading && !error" class="account-muted text-sm"
        >{{ openCount }} open &middot; {{ issues.length - openCount }} resolved or closed</span
      >
    </div>
    <p v-if="loading" role="status" class="account-muted mt-5">Loading your cases...</p>
    <p v-if="error" role="alert" class="account-error mt-5">
      {{ error }} <button type="button" class="account-link" @click="loadIssues">Try again</button>
    </p>
    <div
      v-for="issue in issues"
      :key="issue.caseNumber"
      class="account-row border-b border-[var(--account-line)] py-5"
    >
      <div class="min-w-0">
        <h3>{{ issue.subject || formatAccountLabel(issue.category) }}</h3>
        <p class="account-muted mt-1 text-sm">
          Case {{ issue.caseNumber }} &middot; Order {{ issue.orderReference }}
        </p>
        <p class="account-muted text-xs">Updated {{ formatAccountDate(issue.updatedAt) }}</p>
      </div>
      <div class="flex flex-col items-start gap-2">
        <AccountStatusBadge :status="issue.status" /><button
          class="account-link text-sm"
          type="button"
          :aria-expanded="selected?.caseNumber === issue.caseNumber"
          @click="selectCase(issue.caseNumber)"
        >
          {{ ['RESOLVED', 'CLOSED'].includes(issue.status) ? 'View resolution' : 'Open case' }}
        </button>
      </div>
    </div>
    <p v-if="!loading && !error && !issues.length" class="account-empty">
      No cases yet. When you need a hand, start with your order.
    </p>
  </section>
  <p v-if="detailLoading" role="status" class="account-muted">Loading case details...</p>
  <p v-if="detailError" role="alert" class="account-error">
    {{ detailError }}
    <button type="button" class="account-link" @click="loadCase(route.query.case)">
      Try again
    </button>
  </p>
  <AccountCaseDetail v-if="selected" :issue="selected" />
  <section class="account-section">
    <h3>General message center</h3>
    <p class="account-muted mt-2 text-sm">
      Coming in future phase. Order cases and available replies live here now.
    </p>
  </section>
</template>
<script setup>
import { useRoute } from 'vue-router'
import AccountStatusBadge from '../components/AccountStatusBadge.vue'
import AccountCaseDetail from '../components/AccountCaseDetail.vue'
import { useAccountHelp } from '../composables/useAccountHelp.js'
import { formatAccountDate, formatAccountLabel } from '../utils/accountFormatting.js'
const route = useRoute()
const {
  issues,
  selected,
  loading,
  error,
  detailLoading,
  detailError,
  openCount,
  loadIssues,
  loadCase,
  selectCase,
} = useAccountHelp()
</script>
