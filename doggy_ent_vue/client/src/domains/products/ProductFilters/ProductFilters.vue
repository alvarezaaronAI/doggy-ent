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
  <div
    class="mt-6 flex flex-col gap-5 border-y border-[#deded6] py-5 lg:flex-row lg:items-center lg:justify-between"
  >
    <div>
      <p class="store-eyebrow">Categories</p>

      <div class="mt-2 flex flex-wrap gap-2">
        <button
          v-for="category in props.availableCategories"
          :key="category"
          type="button"
          class="store-size"
          :aria-pressed="props.selectedCategory === category"
          @click="emit('update:selected-category', category)"
        >
          {{ category === 'all' ? 'All' : category }}
        </button>
      </div>
    </div>

    <div class="flex flex-col gap-4 sm:flex-row sm:items-end">
      <div>
        <p
          class="text-xs font-bold uppercase tracking-[0.18em] text-emerald-400"
        >
          Protein
        </p>

        <select
          aria-label="Protein"
          :value="props.selectedProtein"
          class="mt-2 min-h-11 w-full rounded-md border border-[#cbd0c8] bg-[#f8faf8] px-3 py-2 text-sm text-[#27342d]"
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
        <p
          class="text-xs font-bold uppercase tracking-[0.18em] text-emerald-400"
        >
          Sort By
        </p>

        <select
          aria-label="Sort by"
          :value="props.selectedSort"
          class="mt-2 min-h-11 w-full rounded-md border border-[#cbd0c8] bg-[#f8faf8] px-3 py-2 text-sm text-[#27342d]"
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
