<script setup>
defineProps({
  cartCount: {
    type: Number,
    default: 0,
  },
})

const emit = defineEmits(['open-cart'])
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
        <li><a class="hover:text-emerald-400" href="#shop">Shop</a></li>
        <li><a class="hover:text-emerald-400" href="#process">How It’s Made</a></li>
        <li><a class="hover:text-emerald-400" href="#ingredients">Ingredients</a></li>
        <li><a class="hover:text-emerald-400" href="#bundles">Bundles</a></li>
        <li><a class="hover:text-emerald-400" href="#reviews">Reviews</a></li>
        <li><a class="hover:text-emerald-400" href="#about">About</a></li>
        <li><a class="hover:text-emerald-400" href="#faq">FAQ</a></li>
        <li><a class="hover:text-emerald-400" href="#contact">Contact</a></li>
      </ul>

      <div class="hidden md:flex items-center gap-4">
        <button class="text-stone-300 hover:text-white" aria-label="Search">
          <i class="fa-solid fa-magnifying-glass"></i>
        </button>

        <button class="text-stone-300 hover:text-white" aria-label="Account">
          <i class="fa-regular fa-user"></i>
        </button>

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
