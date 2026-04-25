
<script setup>

import { computed, ref } from 'vue'

const props = defineProps({

  cartCount: {

    type: Number,

    default: 0,

  },

})

const emit = defineEmits(['open-cart'])

const isMobileMenuOpen = ref(false)

const cartBadge = computed(() => String(props.cartCount))

</script>

<template>

  <header class="sticky top-0 z-50 border-b border-[color-mix(in_srgb,var(--brand-1)_22%,white)] bg-white/80 backdrop-blur">

    <nav class="mx-auto flex max-w-7xl items-center justify-between px-4 py-4" aria-label="Primary">

      <a href="#hero" class="flex items-center gap-3 text-xl font-black tracking-tight">

        <span class="chip-blue-ring inline-flex h-9 w-9 items-center justify-center rounded-full bg-emerald-400 text-stone-900">

          🐾

        </span>

        <span class="text-[var(--brand-4)]">Chase &amp; Evie Co.</span>

      </a>

      <ul class="hidden items-center gap-6 text-sm text-stone-200 md:flex">

        <li><a class="hover:text-emerald-400" href="#shop">Shop</a></li>

        <li><a class="hover:text-emerald-400" href="#process">How It’s Made</a></li>

        <li><a class="hover:text-emerald-400" href="#ingredients">Ingredients</a></li>

        <li><a class="hover:text-emerald-400" href="#bundles">Bundles</a></li>

        <li><a class="hover:text-emerald-400" href="#reviews">Reviews</a></li>

        <li><a class="hover:text-emerald-400" href="#about">About</a></li>

        <li><a class="hover:text-emerald-400" href="#faq">FAQ</a></li>

      </ul>

      <div class="hidden items-center gap-4 md:flex">

        <button class="text-stone-300 hover:text-emerald-400" type="button" aria-label="Search">

          🔎

        </button>

        <RouterLink class="text-stone-300 hover:text-emerald-400" to="/admin" aria-label="Admin">

          👤

        </RouterLink>

        <button

          class="relative text-stone-300 hover:text-emerald-400"

          type="button"

          aria-label="Open cart"

          @click="emit('open-cart')"

        >

          🛍️

          <span class="absolute -right-3 -top-3 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-emerald-400 px-1 text-[10px] font-bold text-stone-900">

            {{ cartBadge }}

          </span>

        </button>

      </div>

      <div class="flex items-center gap-3 md:hidden">

        <button

          class="relative text-stone-300 hover:text-emerald-400"

          type="button"

          aria-label="Open cart"

          @click="emit('open-cart')"

        >

          🛍️

          <span class="absolute -right-3 -top-3 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-emerald-400 px-1 text-[10px] font-bold text-stone-900">

            {{ cartBadge }}

          </span>

        </button>

        <button

          class="text-xl text-stone-300 hover:text-emerald-400"

          type="button"

          aria-label="Open menu"

          @click="isMobileMenuOpen = !isMobileMenuOpen"

        >

          ☰

        </button>

      </div>

    </nav>

    <div v-if="isMobileMenuOpen" class="border-t border-stone-800 bg-white md:hidden">

      <ul class="mx-auto grid max-w-7xl gap-3 px-4 py-4 text-stone-200">

        <li><a class="block py-2 hover:text-emerald-400" href="#shop">Shop</a></li>

        <li><a class="block py-2 hover:text-emerald-400" href="#process">How It’s Made</a></li>

        <li><a class="block py-2 hover:text-emerald-400" href="#ingredients">Ingredients</a></li>

        <li><a class="block py-2 hover:text-emerald-400" href="#bundles">Bundles</a></li>

        <li><a class="block py-2 hover:text-emerald-400" href="#reviews">Reviews</a></li>

        <li><a class="block py-2 hover:text-emerald-400" href="#about">About</a></li>

        <li><a class="block py-2 hover:text-emerald-400" href="#faq">FAQ</a></li>

      </ul>

    </div>

  </header>

</template>

