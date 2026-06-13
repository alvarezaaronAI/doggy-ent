<script setup>
import { onMounted } from 'vue'
import {
  useAccountAuth,
} from '@domains/account/composables/useAccountAuth.js'

const props = defineProps({
  cartCount: {
    type: Number,
    default: 0,
  },
  searchQuery: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['open-cart', 'update:search-query'])
const {
  authenticated,
  loadSession,
  signOut,
  user,
} = useAccountAuth()

function getFirstName() {
  return String(user.value?.name || user.value?.email || 'Friend')
    .trim()
    .split(/\s+/)[0]
}

function getInitials() {
  const source = String(user.value?.name || user.value?.email || 'CE')
    .trim()

  const parts = source
    .replace(/@.*/, '')
    .split(/[\s._-]+/)
    .filter(Boolean)

  return (parts[0]?.[0] || 'C') + (parts[1]?.[0] || parts[0]?.[1] || 'E')
}

async function logout() {
  await signOut()
}

onMounted(loadSession)
</script>

<template>
  <header class="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-[color-mix(in_srgb,var(--brand-1)_22%,white)]">
    <nav class="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between" aria-label="Primary">
      <RouterLink to="/" class="flex items-center gap-3 font-black tracking-tight text-xl">
        <span class="inline-flex h-9 w-9 items-center justify-center rounded-full bg-emerald-400 text-stone-900 chip-blue-ring">
          <i class="fa-solid fa-paw"></i>
        </span>
        <span>Chase &amp; Evie Co.</span>
      </RouterLink>

      <ul class="hidden md:flex items-center gap-6 text-sm text-stone-200">
        <li><a class="hover:text-emerald-400" href="#shop">All Treats</a></li>
        <li><a class="hover:text-emerald-400" href="#coming-soon">Coming Soon</a></li>
        <li><a class="hover:text-emerald-400" href="#process">How We Make Them</a></li>
        <li><a class="hover:text-emerald-400" href="#ingredients">Ingredients</a></li>
        <li><a class="hover:text-emerald-400" href="#reviews">Happy Pups</a></li>
        <li><a class="hover:text-emerald-400" href="#about">Meet Chase &amp; Evie</a></li>
        <li><a class="hover:text-emerald-400" href="#faq">FAQ</a></li>
      </ul>

      <div class="hidden md:flex items-center gap-4">
        <div class="relative">
          <i class="fa-solid fa-magnifying-glass pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-stone-400"></i>

          <input
            :value="props.searchQuery"
            type="text"
            placeholder="Search treats, proteins, tags..."
            class="w-56 rounded-xl border border-stone-700 bg-white py-2 pl-9 pr-3 text-sm text-stone-700 outline-none transition focus:border-emerald-400"
            @input="emit('update:search-query', $event.target.value)"
          />
        </div>

        <div class="group relative">
          <RouterLink
            v-if="!authenticated"
            to="/account/sign-in"
            class="inline-flex items-center gap-2 rounded-full border border-stone-700 bg-white px-3 py-2 text-sm font-bold text-stone-700 transition hover:border-emerald-400 hover:text-emerald-700"
            aria-label="Sign in to account"
          >
            <i class="fa-regular fa-user"></i>
            <span>Sign in</span>
          </RouterLink>

          <button
            v-else
            class="inline-flex items-center gap-2 rounded-full border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-800 transition hover:border-emerald-500"
            type="button"
            :aria-label="`Account menu for ${user?.email}`"
          >
            <span class="inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-400 text-xs font-black uppercase text-stone-900">
              {{ getInitials() }}
            </span>
            <span>{{ getFirstName() }}</span>
            <i class="fa-solid fa-chevron-down text-xs"></i>
          </button>

          <div
            v-if="authenticated"
            class="invisible absolute right-0 top-full z-30 mt-3 w-56 rounded-xl border border-[color-mix(in_srgb,var(--brand-3)_40%,white)] bg-white p-2 text-sm text-stone-700 opacity-0 shadow-xl transition duration-200 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100"
          >
            <RouterLink class="block rounded-lg px-3 py-2 font-bold hover:bg-emerald-50 hover:text-emerald-700" to="/account">
              Account overview
            </RouterLink>
            <RouterLink class="block rounded-lg px-3 py-2 font-bold hover:bg-emerald-50 hover:text-emerald-700" to="/account/orders">
              Orders
            </RouterLink>
            <RouterLink class="block rounded-lg px-3 py-2 font-bold hover:bg-emerald-50 hover:text-emerald-700" to="/checkout">
              Checkout
            </RouterLink>
            <button
              class="mt-1 block w-full rounded-lg px-3 py-2 text-left font-bold text-red-600 hover:bg-red-50"
              type="button"
              @click="logout"
            >
              Sign out
            </button>
          </div>
        </div>

        <button
          class="relative text-stone-300 hover:text-white"
          aria-label="Open cart"
          aria-controls="cart-drawer"
          @click="emit('open-cart')"
        >
          <i class="fa-solid fa-bag-shopping"></i>
          <span class="absolute -top-2 -right-2 h-5 min-w-[1.25rem] px-1 rounded-full bg-emerald-400 text-stone-900 text-[10px] font-bold flex items-center justify-center">
            {{ cartCount }}
          </span>
        </button>
      </div>

      <div class="md:hidden flex items-center gap-3">
        <RouterLink
          :to="authenticated ? '/account' : '/account/sign-in'"
          class="inline-flex items-center gap-2 rounded-full border border-stone-700 bg-white px-3 py-2 text-sm font-bold text-stone-700 hover:border-emerald-400 hover:text-emerald-700"
          :aria-label="authenticated ? 'Open account' : 'Sign in to account'"
        >
          <span
            v-if="authenticated"
            class="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-400 text-[10px] font-black uppercase text-stone-900"
          >
            {{ getInitials() }}
          </span>
          <i v-else class="fa-regular fa-user text-sm"></i>
          <span>{{ authenticated ? 'Account' : 'Sign in' }}</span>
        </RouterLink>

        <button
          class="relative text-stone-300 hover:text-white"
          aria-label="Open cart"
          aria-controls="cart-drawer"
          @click="emit('open-cart')"
        >
          <i class="fa-solid fa-bag-shopping text-lg"></i>
          <span class="absolute -top-2 -right-2 h-5 min-w-[1.25rem] px-1 rounded-full bg-emerald-400 text-stone-900 text-[10px] font-bold flex items-center justify-center">
            {{ cartCount }}
          </span>
        </button>

        <button class="text-stone-300 hover:text-white" aria-label="Open menu">
          <i class="fa-solid fa-bars text-xl"></i>
        </button>
      </div>
    </nav>
  </header>
</template>
