<script setup>
import {
  PROMO_STATUS_OPTIONS,
  PROMO_TYPE_OPTIONS,
} from '@promos/constants/promo.constants'
import PromoTable from '@promos/components/PromoTable.vue'

defineProps({
  filteredPromos: {
    type: Array,
    required: true,
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
  promoGroups: {
    type: Array,
    required: true,
  },
  promos: {
    type: Array,
    required: true,
  },
})

const promoSearchQuery = defineModel('promoSearchQuery', {
  type: String,
  required: true,
})

const promoTypeFilter = defineModel('promoTypeFilter', {
  type: String,
  required: true,
})

const promoStatusFilter = defineModel('promoStatusFilter', {
  type: String,
  required: true,
})

const emit = defineEmits([
  'analytics',
  'clear-filters',
  'delete',
  'edit',
  'refresh',
  'test',
])
</script>

<template>
  <section class="section-panel overflow-hidden">
    <div class="border-b border-stone-800 p-5 md:p-6">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-400">Promo library</p>
          <h2 class="mt-2 text-2xl font-extrabold text-[var(--brand-4)]">Codes & performance</h2>
          <p class="mt-2 text-sm text-stone-400">
            Active codes appear first. Use filters to quickly find global, referral, or one-time customer codes.
          </p>
        </div>
        <button class="rounded-lg border border-emerald-400 px-4 py-2 font-semibold text-emerald-400 hover:bg-stone-900" @click="emit('refresh')">
          Refresh
        </button>
      </div>

      <div class="mt-5 grid gap-3 lg:grid-cols-[1.4fr_0.8fr_0.8fr_auto] lg:items-end">
        <label class="block">
          <span class="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-stone-400">Search</span>
          <input
            v-model="promoSearchQuery"
            class="w-full rounded-2xl border border-stone-700 bg-white px-4 py-3 outline-none focus:border-emerald-400"
            placeholder="Search code, email, owner, type..."
          />
        </label>

        <label class="block">
          <span class="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-stone-400">Type</span>
          <select v-model="promoTypeFilter" class="w-full rounded-2xl border border-stone-700 bg-white px-4 py-3 outline-none focus:border-emerald-400">
            <option value="all">All types</option>
            <option
              v-for="option in PROMO_TYPE_OPTIONS"
              :key="option.value"
              :value="option.value"
            >
              {{ option.label }}
            </option>
          </select>
        </label>

        <label class="block">
          <span class="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-stone-400">Status</span>
          <select v-model="promoStatusFilter" class="w-full rounded-2xl border border-stone-700 bg-white px-4 py-3 outline-none focus:border-emerald-400">
            <option value="all">All statuses</option>
            <option
              v-for="option in PROMO_STATUS_OPTIONS"
              :key="option.value"
              :value="option.value"
            >
              {{ option.label }}
            </option>
          </select>
        </label>

        <button
          type="button"
          class="rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm font-bold text-[var(--brand-4)] transition hover:border-emerald-400 hover:bg-emerald-50"
          @click="emit('clear-filters')"
        >
          Clear
        </button>
      </div>
    </div>

    <div v-if="isLoading" class="p-6 text-stone-300">Loading promo codes...</div>

    <div v-else-if="!promos.length" class="p-6 text-stone-300">
      No promo codes yet.
    </div>

    <div v-else-if="!filteredPromos.length" class="p-6 text-stone-300">
      No promo codes match your filters.
    </div>

    <div v-else class="space-y-8 p-5 md:p-6">
      <PromoTable
        v-for="group in promoGroups"
        :key="group.key"
        :title="group.title"
        :promos="group.promos"
        :empty-message="group.emptyMessage"
        :count-label="group.countLabel"
        :count-class="group.countClass"
        @test="emit('test', $event)"
        @edit="emit('edit', $event)"
        @delete="emit('delete', $event)"
        @analytics="emit('analytics', $event)"
      />
    </div>
  </section>
</template>
