<template>
  <section class="account-section" aria-label="Help case details">
    <div class="account-row">
      <h2>Case {{ issue.caseNumber }}</h2>
      <AccountStatusBadge :status="issue.status" />
    </div>
    <p class="account-muted mt-2 text-sm">
      {{ formatAccountLabel(issue.category) }} &middot; Updated
      {{ formatAccountDate(issue.updatedAt) }}
    </p>
    <RouterLink
      v-if="issue.orderReference"
      :to="{ name: 'account-orders', query: { order: issue.orderReference } }"
      class="account-link mt-3 inline-block text-sm"
      >Order {{ issue.orderReference
      }}<i class="fa-solid fa-arrow-right ml-2" aria-hidden="true"></i
    ></RouterLink>
    <div class="mt-6 border-l-2 border-[var(--account-line)] pl-5">
      <h3>Your request</h3>
      <p class="mt-2 whitespace-pre-wrap break-words text-sm">{{ issue.message }}</p>
      <p class="account-muted mt-2 text-xs">
        {{ formatAccountDate(issue.createdAt, { time: true }) }}
      </p>
    </div>
    <div
      v-for="message in visibleReplies"
      :key="message.id || message.createdAt"
      class="mt-6 border-l-2 border-[var(--account-line)] pl-5"
    >
      <h3>{{ message.authorType === 'CUSTOMER' ? 'You' : 'Chase & Evie Co.' }}</h3>
      <p class="mt-2 whitespace-pre-wrap break-words text-sm">{{ message.body }}</p>
      <p class="account-muted mt-2 text-xs">
        {{ formatAccountDate(message.createdAt, { time: true }) }}
      </p>
    </div>
    <div v-if="issue.resolutionSummary" class="account-notice mt-6">
      <h3>Resolution</h3>
      <p class="mt-2 whitespace-pre-wrap break-words text-sm">{{ issue.resolutionSummary }}</p>
    </div>
    <p v-if="!visibleReplies.length && !issue.resolutionSummary" class="account-muted mt-5 text-sm">
      Updates will appear here when our team responds.
    </p>
    <p class="account-muted mt-6 text-xs">
      Coming in future phase: replies directly from your account.
    </p>
  </section>
</template>
<script setup>
import { computed } from 'vue'
import AccountStatusBadge from './AccountStatusBadge.vue'
import { formatAccountDate, formatAccountLabel } from '../utils/accountFormatting.js'
const props = defineProps({ issue: { type: Object, required: true } })
const visibleReplies = computed(() =>
  (props.issue.messages || []).filter(
    (message) =>
      message.visibility !== 'INTERNAL' &&
      !(message.authorType === 'CUSTOMER' && message.body === props.issue.message)
  )
)
</script>
