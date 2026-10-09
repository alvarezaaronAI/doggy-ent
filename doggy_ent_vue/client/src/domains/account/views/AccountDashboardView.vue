<template>
  <header class="account-heading account-row">
    <div>
      <h1>Welcome back{{ firstName ? `, ${firstName}` : '' }}.</h1>
      <p>A little less to manage. More time for good company.</p>
    </div>
    <RouterLink to="/#shop" class="account-button"
      >Shop treats<i class="fa-solid fa-arrow-right" aria-hidden="true"></i
    ></RouterLink>
  </header>
  <p v-if="loading" role="status" class="account-muted">Loading your account...</p>
  <p v-if="error" role="alert" class="account-error">
    {{ error }} <button class="account-link" type="button" @click="loadDashboard">Try again</button>
  </p>
  <template v-if="dashboard">
    <dl class="grid grid-cols-2 gap-5 border-y border-[var(--account-line)] py-6 sm:grid-cols-3">
      <div>
        <dt class="account-muted text-xs">Orders</dt>
        <dd class="mt-1 text-2xl font-semibold">{{ dashboard.stats?.totalOrders || 0 }}</dd>
      </div>
      <div>
        <dt class="account-muted text-xs">Latest order</dt>
        <dd class="mt-2">
          <AccountStatusBadge
            v-if="dashboard.stats?.latestOrderStatus"
            :status="dashboard.stats.latestOrderStatus"
          /><span v-else class="text-sm">No orders yet</span>
        </dd>
      </div>
      <div>
        <dt class="account-muted text-xs">Open help cases</dt>
        <dd class="mt-1 text-2xl font-semibold">{{ dashboard.stats?.openIssueCount || 0 }}</dd>
      </div>
    </dl>
    <div class="grid gap-x-8 lg:grid-cols-[1.35fr_1fr]">
      <section class="py-7">
        <div class="account-row">
          <h2>Recent orders</h2>
          <RouterLink to="/account/orders" class="account-link text-sm"
            >View all orders<i class="fa-solid fa-arrow-right ml-2" aria-hidden="true"></i
          ></RouterLink>
        </div>
        <AccountOrderCard
          v-for="order in recentOrders"
          :key="orderReference(order)"
          :order="order"
        />
        <p v-if="!recentOrders.length" class="account-empty">
          Your first order will feel right at home here.
        </p>
      </section>
      <section class="py-7">
        <div class="account-row">
          <h2>Your essentials</h2>
          <RouterLink class="account-link text-sm" to="/account/profile">Edit profile</RouterLink>
        </div>
        <p class="mt-5 font-semibold">{{ dashboard.profile?.name }}</p>
        <p class="account-muted break-words text-sm">{{ dashboard.profile?.email }}</p>
        <div class="mt-6 border-t border-[var(--account-line)] pt-5">
          <p class="text-sm font-semibold">Default shipping address</p>
          <p v-for="(line, index) in shippingLines" :key="index" class="account-muted text-sm">
            {{ line }}
          </p>
          <p v-if="!shippingLines.length" class="account-muted text-sm">Not added yet.</p>
          <RouterLink to="/account/addresses" class="account-link mt-3 inline-block text-sm"
            >Manage address</RouterLink
          >
        </div>
      </section>
    </div>
    <section class="account-section">
      <div class="account-row">
        <div>
          <h2>A helping hand</h2>
          <p class="account-muted mt-2 text-sm">Your order questions and replies stay together.</p>
        </div>
        <RouterLink to="/account/help" class="account-button"
          ><i class="fa-regular fa-comment" aria-hidden="true"></i>Order help</RouterLink
        >
      </div>
    </section>
    <section class="account-section grid gap-6 sm:grid-cols-2">
      <div>
        <h2>
          <i class="fa-solid fa-gift mr-2 text-[var(--account-green)]" aria-hidden="true"></i
          >Rewards
        </h2>
        <p class="account-muted mt-2 text-sm">
          Coming in future phase: little extras for your loyalty.
        </p>
        <RouterLink to="/account/rewards" class="account-link mt-3 inline-block text-sm"
          >See what's ahead</RouterLink
        >
      </div>
      <div>
        <h2>
          <i class="fa-regular fa-heart mr-2 text-[var(--account-green)]" aria-hidden="true"></i
          >Wishlist
        </h2>
        <p class="account-muted mt-2 text-sm">
          Coming in future phase: a place for your favorites.
        </p>
        <RouterLink to="/account/wishlist" class="account-link mt-3 inline-block text-sm"
          >Your future favorites</RouterLink
        >
      </div>
    </section>
  </template>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import AccountOrderCard from '../components/AccountOrderCard.vue'
import AccountStatusBadge from '../components/AccountStatusBadge.vue'
import { useAccountDashboard } from '../composables/useAccountDashboard.js'
import { addressLines, orderReference } from '../utils/accountFormatting.js'
const { dashboard, loading, error, loadDashboard, recentOrders } = useAccountDashboard()
const firstName = computed(
  () =>
    dashboard.value?.profile?.profile?.firstName ||
    dashboard.value?.profile?.name?.split(' ')[0] ||
    ''
)
const shippingLines = computed(() =>
  dashboard.value?.profile?.profile?.defaultAddress?.address1
    ? addressLines(dashboard.value.profile.profile.defaultAddress)
    : []
)
onMounted(loadDashboard)
</script>
