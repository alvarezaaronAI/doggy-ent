<template>
  <div class="min-h-screen bg-white">
    <SiteHeader
      :cart-count="itemCount"
      :search-query="searchQuery"
      @open-cart="isCartOpen = true"
      @update:search-query="searchQuery = $event"
    />
    <div v-if="showNav" class="account-ui account-workspace">
      <aside class="account-sidebar">
        <div class="account-identity">
          <strong>{{ user?.name || 'Your account' }}</strong
          ><span>Your account</span>
        </div>
        <AccountNav />
        <button class="account-signout" type="button" :disabled="signingOut" @click="logout">
          <i class="fa-solid fa-arrow-right-from-bracket" aria-hidden="true"></i
          >{{ signingOut ? 'Signing out...' : 'Sign out' }}
        </button>
        <p v-if="logoutError" role="alert" class="account-error mt-3">{{ logoutError }}</p>
      </aside>
      <div class="account-mobile-nav">
        <button
          type="button"
          class="account-mobile-toggle"
          :aria-expanded="mobileNavOpen"
          aria-controls="account-mobile-menu"
          @click="mobileNavOpen = !mobileNavOpen"
        >
          My account / {{ title
          }}<i
            class="fa-solid"
            :class="mobileNavOpen ? 'fa-chevron-up' : 'fa-chevron-down'"
            aria-hidden="true"
          ></i>
        </button>
        <div v-if="mobileNavOpen" id="account-mobile-menu" class="px-4 pb-4">
          <AccountNav @navigate="mobileNavOpen = false" />
          <button class="account-signout" :disabled="signingOut" type="button" @click="logout">
            Sign out
          </button>
          <p v-if="logoutError" role="alert" class="account-error">{{ logoutError }}</p>
        </div>
      </div>
      <main id="account-content" class="account-content"><slot /></main>
    </div>
    <main v-else class="account-ui mx-auto max-w-6xl px-6 py-10 md:py-14">
      <RouterLink class="account-link" to="/#shop"
        ><i class="fa-solid fa-arrow-left mr-2" aria-hidden="true"></i>Back to treats</RouterLink
      >
      <header class="account-heading mt-6">
        <h1>{{ title }}</h1>
        <p v-if="subtitle">{{ subtitle }}</p>
      </header>
      <slot />
    </main>
    <SiteFooter />
    <CartDrawer
      :is-open="isCartOpen"
      :cart-items="cart"
      :subtotal="subtotal"
      :item-count="itemCount"
      @close="isCartOpen = false"
      @increase="increase"
      @decrease="decrease"
      @remove="remove"
      @continue-shopping="isCartOpen = false"
    />
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import CartDrawer from '@cart/CartDrawer/CartDrawer.vue'
import SiteFooter from '@app/layouts/SiteFooter.vue'
import SiteHeader from '@app/layouts/SiteHeader.vue'
import { useCart } from '@cart/composables/useCart'
import { useStorefrontSearch } from '@storefront/composables/useStorefrontSearch.js'
import { useAccountAuth } from '../composables/useAccountAuth.js'
import AccountNav from './AccountNav.vue'
import '../styles/account.css'
defineProps({
  title: { type: String, default: 'Overview' },
  subtitle: { type: String, default: '' },
  showNav: { type: Boolean, default: true },
})
const router = useRouter()
const { user, signOut } = useAccountAuth()
const { searchQuery } = useStorefrontSearch()
const { cart, decrease, increase, isCartOpen, itemCount, loadSavedCart, remove, subtotal } =
  useCart()
const mobileNavOpen = ref(false)
const signingOut = ref(false)
const logoutError = ref('')
async function logout() {
  signingOut.value = true
  logoutError.value = ''
  try {
    await signOut()
    await router.push('/account/sign-in')
  } catch {
    logoutError.value = 'Unable to sign out. Please try again.'
  } finally {
    signingOut.value = false
  }
}
onMounted(loadSavedCart)
</script>
