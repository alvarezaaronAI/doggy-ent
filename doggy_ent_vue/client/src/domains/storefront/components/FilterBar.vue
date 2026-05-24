<script setup>
const props = defineProps({
  availableCategories: {
    type: Array,
    required: true,
  },
  availableProteins: {
    type: Array,
    required: true,
  },
  selectedCategory: {
    type: String,
    required: true,
  },
  selectedProtein: {
    type: String,
    required: true,
  },
  selectedSort: {
    type: String,
    required: true,
  },
})

const emit = defineEmits([
  'update:selected-category',
  'update:selected-protein',
  'update:selected-sort',
])
</script>

<template>
  <div class="mt-6 flex flex-col gap-4 rounded-2xl border border-stone-800 bg-white p-4 lg:flex-row lg:items-center lg:justify-between">
    <div>
      <p class="text-xs font-bold uppercase tracking-[0.18em] text-emerald-400">
        Categories
      </p>

      <div class="mt-2 flex flex-wrap gap-2">
        <button
          v-for="category in props.availableCategories"
          :key="category"
          class="rounded-full border px-3 py-1 text-sm font-semibold transition"
          :class="props.selectedCategory === category
            ? 'border-emerald-400 bg-emerald-400 text-[var(--brand-4)]'
            : 'border-stone-700 bg-white text-stone-700 hover:border-emerald-400'"
          @click="emit('update:selected-category', category)"
        >
          {{ category === 'all' ? 'All' : category }}
        </button>
      </div>
    </div>

    <div class="flex flex-col gap-4 sm:flex-row sm:items-end">
      <div>
        <p class="text-xs font-bold uppercase tracking-[0.18em] text-emerald-400">
          Protein
        </p>

        <select
          :value="props.selectedProtein"
          class="mt-2 rounded-xl border border-stone-700 bg-white px-3 py-2 text-sm text-stone-700 outline-none transition focus:border-emerald-400"
          @change="emit('update:selected-protein', $event.target.value)"
        >
          <option
            v-for="protein in props.availableProteins"
            :key="protein"
            :value="protein"
          >
            {{ protein === 'all' ? 'All Proteins' : protein }}
          </option>
        </select>
      </div>

      <div>
        <p class="text-xs font-bold uppercase tracking-[0.18em] text-emerald-400">
          Sort By
        </p>

        <select
          :value="props.selectedSort"
          class="mt-2 rounded-xl border border-stone-700 bg-white px-3 py-2 text-sm text-stone-700 outline-none transition focus:border-emerald-400"
          @change="emit('update:selected-sort', $event.target.value)"
        >
          <option value="featured">Featured</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
          <option value="alphabetical">Alphabetical</option>
        </select>
      </div>
    </div>
  </div>
</template>
