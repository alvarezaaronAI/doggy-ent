<script setup>
import {
  CAMPAIGN_STATUS_OPTIONS,
  DONATION_TYPE_OPTIONS,
} from '../constants/adminCampaigns.constants'
import AdminCampaignScheduleFields from './AdminCampaignScheduleFields.vue'

defineProps({
  editingCampaignId: {
    type: [String, Number],
    default: null,
  },
  errorMessage: {
    type: String,
    default: '',
  },
  form: {
    type: Object,
    required: true,
  },
  isSaving: {
    type: Boolean,
    default: false,
  },
  products: {
    type: Array,
    required: true,
  },
  successMessage: {
    type: String,
    default: '',
  },
})

const emit = defineEmits([
  'reset',
  'submit',
])
</script>

<template>
  <form class="section-panel space-y-5 p-5 md:p-6" @submit.prevent="emit('submit')">
    <div>
      <p class="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-400">
        {{ editingCampaignId ? 'Edit campaign' : 'Create campaign' }}
      </p>
      <h2 class="mt-2 text-2xl font-extrabold text-[var(--brand-4)]">
        {{ editingCampaignId ? 'Update donation campaign' : 'New donation campaign' }}
      </h2>
    </div>

    <div v-if="errorMessage" class="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-800">
      {{ errorMessage }}
    </div>
    <div v-if="successMessage" class="rounded-2xl border border-green-200 bg-green-50 p-4 text-sm font-semibold text-green-800">
      {{ successMessage }}
    </div>

    <label class="block">
      <span class="mb-2 block text-sm font-semibold text-[var(--brand-4)]">Campaign name *</span>
      <input v-model="form.name" required class="w-full rounded-2xl border border-stone-700 bg-white px-4 py-3 outline-none focus:border-emerald-400" placeholder="LA Dogs May Drive" />
    </label>

    <label class="block">
      <span class="mb-2 block text-sm font-semibold text-[var(--brand-4)]">Description</span>
      <textarea v-model="form.description" rows="3" class="w-full rounded-2xl border border-stone-700 bg-white px-4 py-3 outline-none focus:border-emerald-400" placeholder="Limited-time shelter support campaign."></textarea>
    </label>

    <div class="grid gap-4 md:grid-cols-2">
      <label class="block">
        <span class="mb-2 block text-sm font-semibold text-[var(--brand-4)]">Status</span>
        <select v-model="form.status" class="w-full rounded-2xl border border-stone-700 bg-white px-4 py-3 outline-none focus:border-emerald-400">
          <option
            v-for="option in CAMPAIGN_STATUS_OPTIONS"
            :key="option.value"
            :value="option.value"
          >
            {{ option.label }}
          </option>
        </select>
      </label>

      <label class="block">
        <span class="mb-2 block text-sm font-semibold text-[var(--brand-4)]">Shelter / donation target *</span>
        <input v-model="form.donationTarget" required class="w-full rounded-2xl border border-stone-700 bg-white px-4 py-3 outline-none focus:border-emerald-400" placeholder="LA Dogs Shelter" />
      </label>
    </div>

    <div class="grid gap-4 md:grid-cols-2">
      <label class="block">
        <span class="mb-2 block text-sm font-semibold text-[var(--brand-4)]">Donation type</span>
        <select v-model="form.donationType" class="w-full rounded-2xl border border-stone-700 bg-white px-4 py-3 outline-none focus:border-emerald-400">
          <option
            v-for="option in DONATION_TYPE_OPTIONS"
            :key="option.value"
            :value="option.value"
          >
            {{ option.label }}
          </option>
        </select>
      </label>

      <label class="block">
        <span class="mb-2 block text-sm font-semibold text-[var(--brand-4)]">Donation value</span>
        <input v-model.number="form.donationValue" type="number" min="0" step="0.01" class="w-full rounded-2xl border border-stone-700 bg-white px-4 py-3 outline-none focus:border-emerald-400" />
      </label>
    </div>

    <div>
      <span class="mb-2 block text-sm font-semibold text-[var(--brand-4)]">Products included</span>
      <div class="max-h-72 space-y-2 overflow-y-auto rounded-2xl border border-stone-700 bg-white p-3">
        <label
          v-for="product in products"
          :key="product.id"
          class="flex cursor-pointer items-start gap-3 rounded-xl px-3 py-2 hover:bg-[color-mix(in_srgb,var(--brand-5)_55%,white)]"
        >
          <input v-model="form.productIds" type="checkbox" :value="product.id" class="mt-1" />
          <span>
            <span class="block font-semibold text-[var(--brand-4)]">{{ product.name }}</span>
            <span class="block text-xs text-stone-400">{{ product.status }} · {{ product.category }}</span>
          </span>
        </label>
      </div>
      <p class="mt-2 text-xs text-stone-400">
        Donations are calculated only from selected products in this campaign.
      </p>
    </div>

    <AdminCampaignScheduleFields :form="form" />

    <div class="flex flex-wrap gap-3">
      <button type="submit" class="focus-ring rounded-lg bg-emerald-400 px-5 py-3 font-semibold text-[var(--brand-4)] hover:bg-emerald-300 disabled:opacity-60" :disabled="isSaving">
        {{ isSaving ? 'Saving...' : editingCampaignId ? 'Update Campaign' : 'Create Campaign' }}
      </button>
      <button type="button" class="rounded-lg border border-stone-700 px-5 py-3 font-semibold text-stone-500 hover:border-emerald-400" @click="emit('reset')">
        Reset
      </button>
    </div>
  </form>
</template>
