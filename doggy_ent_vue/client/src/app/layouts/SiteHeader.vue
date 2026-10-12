<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  PawPrint,
  Search,
  User,
  ShoppingBag,
  Menu,
  X,
  ChevronDown,
} from '@lucide/vue'
import { useAccountAuth } from '@domains/account/composables/useAccountAuth.js'
import ContentLink from '@storefront/components/ContentLink.vue'
import { useStorefrontContent } from '@storefront/composables/useStorefrontContent.js'
import { visibleStorefrontLinks } from '@storefront-content/sectionCatalog.js'
const props = defineProps({
  content: Object,
  preview: Boolean,
  cartCount: { type: Number, default: 0 },
  searchQuery: { type: String, default: '' },
})
const emit = defineEmits(['open-cart', 'update:search-query'])
const route = useRoute()
const router = useRouter()
const mobileMenuOpen = ref(false)
const accountMenuOpen = ref(false)
const accountMenuPinned = ref(false)
const headerRef = ref(null)
const accountMenuRef = ref(null)
const { authenticated, loadSession, signOut, user } = useAccountAuth()
const { content: liveContent, loadContent } = useStorefrontContent()
const page = computed(() => props.content || liveContent.value)
const links = computed(() => visibleStorefrontLinks(page.value.header.links, page.value.sections))
const searchCollection = computed(() => page.value.sections.find(block => block.visible && block.type === 'collection' && block.id === 'shop') || page.value.sections.find(block => block.visible && block.type === 'collection'))
let closeTimer
function firstName() {
  return String(user.value?.name || 'Friend')
    .trim()
    .split(/\s+/)[0]
}
function initials() {
  return String(user.value?.name || 'CE')
    .trim()
    .split(/\s+/)
    .map((word) => word[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}
function openAccount() {
  clearTimeout(closeTimer)
  accountMenuOpen.value = true
}
function closeAccount() {
  clearTimeout(closeTimer)
  accountMenuOpen.value = false
  accountMenuPinned.value = false
}
function toggleAccount() {
  if (accountMenuPinned.value) closeAccount()
  else {
    openAccount()
    accountMenuPinned.value = true
  }
}
function scheduleClose(fromFocus = false) {
  clearTimeout(closeTimer)
  if (accountMenuPinned.value && !fromFocus) return
  closeTimer = setTimeout(() => {
    if (!accountMenuRef.value?.contains(document.activeElement)) closeAccount()
  }, 200)
}
function closeMenus() {
  closeAccount()
  mobileMenuOpen.value = false
}
async function logout() {
  closeMenus()
  await signOut()
}
function outside(event) {
  if (!event.composedPath().includes(headerRef.value)) closeMenus()
}
function escape(event) {
  if (event.key === 'Escape') closeMenus()
}
function search() {
  closeMenus()
  if (searchCollection.value) router.push({ path: '/', hash: '#' + searchCollection.value.id })
}
watch(() => route.fullPath, closeMenus)
onMounted(() => {
  if (props.preview) return
  loadSession()
  loadContent()
  document.addEventListener('click', outside)
  document.addEventListener('keydown', escape)
})
onBeforeUnmount(() => {
  clearTimeout(closeTimer)
  document.removeEventListener('click', outside)
  document.removeEventListener('keydown', escape)
})
</script>
<template>
  <header ref="headerRef" class="site-header">
    <div class="site-header-top">
      <RouterLink to="/" class="site-brand"
        ><span class="site-mark"><PawPrint :size="23" /></span
        ><span>{{ page.header.brandName }}</span></RouterLink
      >
      <form
        v-if="searchCollection"
        class="site-search site-search-desktop"
        role="search"
        @submit.prevent="search"
      >
        <Search :size="18" aria-hidden="true" />
        <input
          aria-label="Search treats"
          :value="props.searchQuery"
          :placeholder="page.header.searchPlaceholder"
          @input="emit('update:search-query', $event.target.value)"
        />
        <button type="submit" aria-label="Search collection">
          <Search :size="16" />
        </button>
      </form>
      <div class="site-actions">
        <div
          ref="accountMenuRef"
          class="site-account"
          @mouseenter="openAccount"
          @mouseleave="scheduleClose()"
          @focusout="scheduleClose(true)"
        >
          <RouterLink
            v-if="!authenticated"
            to="/account/sign-in"
            class="site-control"
            aria-label="Sign in to account"
            ><User :size="18" /><span class="site-account-label"
              >Sign in</span
            ></RouterLink
          >
          <button
            v-else
            type="button"
            class="site-control"
            :aria-label="'Account menu for ' + user?.email"
            :aria-expanded="accountMenuOpen"
            aria-controls="site-account-menu"
            @click.stop="toggleAccount"
          >
            <span class="site-initials">{{ initials() }}</span
            ><span class="site-account-label">{{ firstName() }}</span
            ><ChevronDown :size="14" />
          </button>
          <div
            v-if="authenticated && accountMenuOpen"
            id="site-account-menu"
            class="site-account-buffer"
            @mouseenter="openAccount"
          >
            <nav class="site-account-menu" aria-label="Account">
              <RouterLink to="/account" @click="closeMenus"
                >Account overview</RouterLink
              >
              <RouterLink to="/account/orders" @click="closeMenus"
                >Orders</RouterLink
              >
              <RouterLink to="/account/profile" @click="closeMenus"
                >Profile</RouterLink
              >
              <button type="button" @click="logout">Sign out</button>
            </nav>
          </div>
        </div>
        <button
          type="button"
          class="site-control site-cart"
          aria-label="Open cart"
          aria-controls="cart-drawer"
          @click="emit('open-cart')"
        >
          <ShoppingBag :size="20" /><span class="site-count">{{
            cartCount
          }}</span>
        </button>
        <button
          type="button"
          class="site-control site-menu-toggle"
          :aria-label="mobileMenuOpen ? 'Close menu' : 'Open menu'"
          :aria-expanded="mobileMenuOpen"
          aria-controls="site-mobile-menu"
          @click="mobileMenuOpen = !mobileMenuOpen"
        >
          <X v-if="mobileMenuOpen" :size="20" /><Menu v-else :size="20" />
        </button>
      </div>
    </div>
    <nav class="site-desktop-nav" aria-label="Primary">
      <ContentLink
        v-for="(link, index) in links"
        :key="index"
        :href="link.href"
        >{{ link.label }}</ContentLink
      >
    </nav>
    <div v-if="mobileMenuOpen" id="site-mobile-menu" class="site-mobile-menu">
      <form v-if="searchCollection" class="site-search" role="search" @submit.prevent="search">
        <Search :size="18" aria-hidden="true" /><input
          aria-label="Search treats"
          :value="props.searchQuery"
          :placeholder="page.header.searchPlaceholder"
          @input="emit('update:search-query', $event.target.value)"
        /><button type="submit" aria-label="Search collection">
          <Search :size="16" />
        </button>
      </form>
      <nav aria-label="Primary mobile">
        <ContentLink
          v-for="(link, index) in links"
          :key="index"
          :href="link.href"
          @click="closeMenus"
          >{{ link.label }}</ContentLink
        >
      </nav>
    </div>
  </header>
</template>
<style scoped src="@storefront/styles/siteHeader.css"></style>
