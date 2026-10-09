<template>
  <header class="account-heading">
    <RouterLink to="/account/orders" class="account-link text-sm"
      ><i class="fa-solid fa-arrow-left mr-2" aria-hidden="true"></i>All orders</RouterLink
    >
    <h1 class="mt-4">Order details</h1>
  </header>
  <p v-if="loading" role="status" class="account-muted">Loading your order...</p>
  <p v-else-if="error" role="alert" class="account-error">
    {{ error }}
    <button class="account-link" type="button" @click="loadOrder(route.params.reference)">
      Try again
    </button>
  </p>
  <AccountOrderDetails
    v-else-if="order"
    :key="route.params.reference"
    :order="order"
    class="max-w-2xl"
    @issue-created="appendIssue"
  />
</template>
<script setup>
import { watch } from 'vue'
import { useRoute } from 'vue-router'
import AccountOrderDetails from '../components/AccountOrderDetails.vue'
import { useAccountOrders } from '../composables/useAccountOrders.js'
const route = useRoute()
const { order, loading, error, loadOrder } = useAccountOrders()
watch(
  () => route.params.reference,
  (reference) => {
    if (reference) loadOrder(reference)
  },
  { immediate: true }
)
function appendIssue(issue) {
  order.value.support.issues = [issue, ...(order.value.support.issues || [])]
}
</script>
