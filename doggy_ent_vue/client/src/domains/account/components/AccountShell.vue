<template>
  <div class="site-page flex flex-1 flex-col bg-white">
    <SiteHeader
      :cart-count="itemCount"
      :search-query="searchQuery"
      @open-cart="isCartOpen = true"
      @update:search-query="searchQuery = $event"
    />
    <div v-if="showNav" class="account-ui account-workspace flex-1">
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
      <main id="account-content" class="account-content account-pattern"><div class="relative min-w-0"><slot /></div></main>
    </div>
    <main v-else id="account-content" class="account-ui account-auth-stage flex-1">
      <div class="account-auth-wrap">
        <RouterLink class="auth-link" :to="backTo"><ArrowLeft :size="17" aria-hidden="true" />{{ backLabel }}</RouterLink>
        <section class="account-auth-card" aria-labelledby="account-auth-title">
          <header>
            <p class="auth-eyebrow"><span class="auth-brand-mark"><PawPrint :size="19" aria-hidden="true" /></span>YOUR CHASE &amp; EVIE ACCOUNT</p>
            <h1 id="account-auth-title" ref="authTitle" tabindex="-1">{{ title }}</h1>
            <p v-if="subtitle" class="mt-3 text-sm leading-relaxed text-stone-600">{{ subtitle }}</p>
          </header>
          <slot />
        </section>
      </div>
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
import { nextTick, onMounted, provide, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, PawPrint } from '@lucide/vue'
import CartDrawer from '@cart/CartDrawer/CartDrawer.vue'
import SiteFooter from '@app/layouts/SiteFooter.vue'
import SiteHeader from '@app/layouts/SiteHeader.vue'
import { useCart } from '@cart/composables/useCart'
import { useProductVariants } from '@products/composables/useProductVariants.js'
import { useProducts } from '@products/composables/useProducts.js'
import { useStorefrontSearch } from '@storefront/composables/useStorefrontSearch.js'
import { useAccountAuth } from '../composables/useAccountAuth.js'
import AccountNav from './AccountNav.vue'
import '../styles/account.css'
import '../styles/account-auth.css'
const props = defineProps({
  title: { type: String, default: 'Overview' },
  subtitle: { type: String, default: '' },
  showNav: { type: Boolean, default: true },
  backTo: { type: String, default: '/#shop' },
  backLabel: { type: String, default: 'Back to the shop' },
})
const authTitle = ref(null)
watch(() => props.title, async () => { if (!props.showNav) { await nextTick(); authTitle.value?.focus() } })
const router = useRouter()
const { user, signOut } = useAccountAuth()
const { searchQuery } = useStorefrontSearch()
const { getSellingMode, isPurchasable, getAvailableQuantity, limitQuantity } = useProductVariants()
const { products, loadProducts } = useProducts()
const { cart, decrease, increase, isCartOpen, itemCount, loadSavedCart, remove, subtotal, addToCart } =
  useCart({ products, getSellingMode, isPurchasable, getAvailableQuantity, limitQuantity })
provide('accountCart', { addToCart })
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
onMounted(() => { loadSavedCart(); if (props.showNav) loadProducts() })
</script>
