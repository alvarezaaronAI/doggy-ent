

<script setup>
import {
  DISCOUNT_TYPE_OPTIONS,
  PROMO_STATUS_OPTIONS,
  PROMO_TYPE_OPTIONS,
} from '../constants/promo.constants'

const props = defineProps({
  form: {
    type: Object,
    required: true,
  },

  isSaving: {
    type: Boolean,
    default: false,
  },

  isEditing: {
    type: Boolean,
    default: false,
  },

  isUniquePromo: {
    type: Boolean,
    default: false,
  },

  isReferralPromo: {
    type: Boolean,
    default: false,
  },

  errorMessage: {
    type: String,
    default: '',
  },

  successMessage: {
    type: String,
    default: '',
  },
})

const emit = defineEmits([
  'submit',
  'reset',
  'generate-code',
])
</script>

<template>
  <form class="section-panel space-y-5 p-5 md:p-6" @submit.prevent="emit('submit')">
    <div>
      <p class="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-400">
        {{ isEditing ? 'Edit promo' : 'Create promo' }}
      </p>

      <h2 class="mt-2 text-2xl font-extrabold text-[var(--brand-4)]">
        {{ isEditing ? 'Update promo code' : 'New promo code' }}
      </h2>
    </div>

    <div class="block">
      <div class="mb-2 flex items-center justify-between gap-3">
        <span class="block text-sm font-semibold text-[var(--brand-4)]">
          Code *
        </span>

        <button
          type="button"
          class="rounded-lg border border-emerald-400 px-3 py-1.5 text-xs font-bold text-emerald-500 hover:bg-emerald-50"
          @click="emit('generate-code')"
        >
          Generate Unique Code
        </button>
      </div>

      <input
        v-model="props.form.code"
        required
        class="w-full rounded-2xl border border-stone-700 bg-white px-4 py-3 outline-none focus:border-emerald-400"
        placeholder="CHASE10 or VIP-K7X2P9"
      />
    </div>

    <label class="block">
      <span class="mb-2 block text-sm font-semibold text-[var(--brand-4)]">
        Name *
      </span>

      <input
        v-model="props.form.name"
        required
        class="w-full rounded-2xl border border-stone-700 bg-white px-4 py-3 outline-none focus:border-emerald-400"
        placeholder="Spring shelter campaign"
      />
    </label>

    <div class="grid gap-4 md:grid-cols-2">
      <label class="block">
        <span class="mb-2 block text-sm font-semibold text-[var(--brand-4)]">
          Type
        </span>

        <select
          v-model="props.form.type"
          class="w-full rounded-2xl border border-stone-700 bg-white px-4 py-3 outline-none focus:border-emerald-400"
        >
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
        <span class="mb-2 block text-sm font-semibold text-[var(--brand-4)]">
          Status
        </span>

        <select
          v-model="props.form.status"
          class="w-full rounded-2xl border border-stone-700 bg-white px-4 py-3 outline-none focus:border-emerald-400"
        >
          <option
            v-for="option in PROMO_STATUS_OPTIONS"
            :key="option.value"
            :value="option.value"
          >
            {{ option.label }}
          </option>
        </select>
      </label>
    </div>

    <div class="grid gap-4 md:grid-cols-2">
      <label class="block">
        <span class="mb-2 block text-sm font-semibold text-[var(--brand-4)]">
          Discount type
        </span>

        <select
          v-model="props.form.discountType"
          class="w-full rounded-2xl border border-stone-700 bg-white px-4 py-3 outline-none focus:border-emerald-400"
        >
          <option
            v-for="option in DISCOUNT_TYPE_OPTIONS"
            :key="option.value"
            :value="option.value"
          >
            {{ option.label }}
          </option>
        </select>
      </label>

      <label class="block">
        <span class="mb-2 block text-sm font-semibold text-[var(--brand-4)]">
          Discount value
        </span>

        <input
          v-model.number="props.form.discountValue"
          type="number"
          min="0"
          step="0.01"
          class="w-full rounded-2xl border border-stone-700 bg-white px-4 py-3 outline-none focus:border-emerald-400"
        />
      </label>
    </div>

    <div
      v-if="props.errorMessage"
      class="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-800"
    >
      {{ props.errorMessage }}
    </div>

    <div
      v-if="props.successMessage"
      class="rounded-2xl border border-green-200 bg-green-50 p-4 text-sm font-semibold text-green-800"
    >
      {{ props.successMessage }}
    </div>

    <slot />

    <div class="flex flex-wrap gap-3">
      <button
        type="submit"
        class="focus-ring rounded-lg bg-emerald-400 px-5 py-3 font-semibold text-[var(--brand-4)] hover:bg-emerald-300 disabled:opacity-60"
        :disabled="props.isSaving"
      >
        {{ props.isSaving ? 'Saving...' : props.isEditing ? 'Update Promo' : 'Create Promo' }}
      </button>

      <button
        type="button"
        class="rounded-lg border border-stone-700 px-5 py-3 font-semibold text-stone-500 hover:border-emerald-400"
        @click="emit('reset')"
      >
        Reset
      </button>
    </div>
  </form>
</template>