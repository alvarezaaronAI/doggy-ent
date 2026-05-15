<script setup>
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
            placeholder="Search treats..."
            class="w-56 rounded-xl border border-stone-700 bg-white py-2 pl-9 pr-3 text-sm text-stone-700 outline-none transition focus:border-emerald-400"
            @input="emit('update:search-query', $event.target.value)"
          />
        </div>

        <div class="group relative">
          <button
            class="text-stone-300 opacity-50 transition hover:text-white hover:opacity-80"
            aria-label="Account system coming soon"
            type="button"
          >
            <i class="fa-regular fa-user"></i>
          </button>

          <div class="pointer-events-none absolute left-1/2 top-full z-20 mt-3 -translate-x-1/2 rounded-xl border border-[color-mix(in_srgb,var(--brand-3)_40%,white)] bg-white px-3 py-2 text-xs font-medium text-stone-600 opacity-0 shadow-xl transition duration-200 group-hover:opacity-100 whitespace-nowrap">
            Accounts coming later • Summer 2026
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
