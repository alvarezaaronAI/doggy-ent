<template>
  <AccountShell
    title="Account"
    :subtitle="user?.email ? `Signed in as ${user.email}` : 'Your customer account.'"
  >
    <section class="mb-5 rounded-2xl border border-[color-mix(in_srgb,var(--brand-1)_26%,white)] bg-white p-6 shadow-sm">
      <p class="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">
        Welcome back
      </p>
      <div class="mt-2 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 class="text-3xl font-black text-[var(--brand-4)]">
            {{ dashboard?.profile?.profile?.firstName || dashboard?.profile?.name || user?.name || 'Treat shopper' }}
          </h2>
          <p class="mt-2 max-w-2xl text-sm text-stone-600">
            Your order history, profile details, and future rewards live here so checkout can stay quick.
          </p>
        </div>

        <RouterLink
          class="inline-flex w-fit items-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-black text-white transition hover:bg-emerald-700"
          to="/#shop"
        >
          Shop treats
          <i class="fa-solid fa-arrow-right text-xs"></i>
        </RouterLink>
      </div>
    </section>

    <div class="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
      <section class="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
        <div class="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p class="text-sm font-semibold uppercase tracking-[0.16em] text-stone-400">
              Profile
            </p>
            <h2 class="mt-1 text-2xl font-bold text-stone-900">
              {{ dashboard?.profile?.name || user?.name || 'Customer' }}
            </h2>
            <p class="mt-1 text-sm text-stone-500">
              {{ dashboard?.profile?.email || user?.email }}
            </p>
          </div>

          <button
            class="rounded-lg border border-stone-300 px-4 py-2 text-sm font-bold text-stone-700 transition hover:border-emerald-400 hover:text-emerald-700"
            type="button"
            @click="logout"
          >
            Sign out
          </button>
        </div>

        <div class="mt-6 grid gap-3 sm:grid-cols-3">
          <div class="rounded-lg bg-stone-50 p-4">
            <p class="text-xs font-bold uppercase tracking-[0.14em] text-stone-400">Orders</p>
            <p class="mt-1 text-2xl font-bold">{{ dashboard?.stats?.totalOrders || 0 }}</p>
          </div>
          <div class="rounded-lg bg-stone-50 p-4">
            <p class="text-xs font-bold uppercase tracking-[0.14em] text-stone-400">Lifetime spend</p>
            <p class="mt-1 text-2xl font-bold">{{ formatCurrency(dashboard?.stats?.lifetimeSpend || 0) }}</p>
          </div>
          <div class="rounded-lg bg-stone-50 p-4">
            <p class="text-xs font-bold uppercase tracking-[0.14em] text-stone-400">Verified</p>
            <p class="mt-1 text-2xl font-bold">{{ user?.emailVerified ? 'Yes' : 'No' }}</p>
          </div>
        </div>
      </section>

      <section class="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
        <div class="flex items-center justify-between gap-4">
          <p class="text-sm font-semibold uppercase tracking-[0.16em] text-stone-400">
            Recent orders
          </p>
          <RouterLink
            class="text-sm font-black text-emerald-700 hover:text-emerald-900"
            to="/account/orders"
          >
            View all orders
          </RouterLink>
        </div>

        <div v-if="recentOrders.length" class="mt-4 space-y-3">
          <AccountOrderCard
            v-for="order in recentOrders"
            :key="order.customerReference || order.orderNumber"
            :order="order"
          />
        </div>

        <p v-else class="mt-4 text-sm text-stone-500">
          No linked orders yet.
        </p>
      </section>
    </div>

    <div class="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
      <AccountPlaceholderPanel
        title="Tracking"
        message="Coming in future phase. Tracking updates are prepared in the account flow and will activate when fulfillment tracking is added."
      />
      <AccountPlaceholderPanel
        title="Reviews"
        message="Coming in future phase. Review requests have a database foundation and will be sent after the email provider is connected."
      />
      <AccountPlaceholderPanel
        title="Loyalty"
        message="Coming in future phase. Rewards, referrals, and points are reserved for the next customer loyalty phase."
      />
      <AccountPlaceholderPanel
        title="Wishlist"
        message="Coming in future phase. Saved favorites and reorder shortcuts will be added after product availability rules are finalized."
      />
    </div>

    <p v-if="error" class="mt-5 text-sm font-semibold text-red-600">
      {{ error }}
    </p>
  </AccountShell>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import AccountShell from '../components/AccountShell.vue'
import AccountOrderCard from '../components/AccountOrderCard.vue'
import AccountPlaceholderPanel from '../components/AccountPlaceholderPanel.vue'
import {
  fetchAccountDashboard,
} from '../api/account.api.js'
import {
  useAccountAuth,
} from '../composables/useAccountAuth.js'
import {
  formatCurrency,
} from '@shared/utils/currency'

const router = useRouter()
const dashboard = ref(null)
const error = ref('')
const {
  signOut,
  user,
} = useAccountAuth()

const recentOrders = computed(() =>
  (dashboard.value?.recentOrders || []).slice(0, 3),
)

async function loadDashboard() {
  try {
    dashboard.value = await fetchAccountDashboard()
  }
  catch (loadError) {
    error.value = loadError.message || 'Unable to load account.'
  }
}

async function logout() {
  await signOut()
  router.push('/account/sign-in')
}

onMounted(loadDashboard)
</script>
