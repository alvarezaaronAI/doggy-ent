<script setup>
import {
  PRODUCT_VARIANT_SIZES,
} from '../constants/adminProducts.constants'
import {
  formatAdminProductPrice,
} from '../utils/adminProducts.formatters'
import AdminProductStatusBadge from './AdminProductStatusBadge.vue'
import AdminProductVariantCell from './AdminProductVariantCell.vue'

defineProps({
  countClass: {
    type: String,
    required: true,
  },
  emptyMessage: {
    type: String,
    required: true,
  },
  isDeleting: {
    type: Boolean,
    default: false,
  },
  products: {
    type: Array,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  titleClass: {
    type: String,
    required: true,
  },
})

const emit = defineEmits([
  'delete',
  'edit',
])
</script>

<template>
  <div>
    <div class="mb-2 flex items-center gap-3">
      <h3 class="text-lg font-bold" :class="titleClass">{{ title }}</h3>
      <span class="rounded-full px-2 py-0.5 text-xs font-bold" :class="countClass">{{ products.length }}</span>
    </div>
    <div v-if="products.length === 0" class="rounded-2xl border border-stone-200 bg-white px-6 py-8 text-center text-stone-400">
      {{ emptyMessage }}
    </div>
    <div v-else class="overflow-x-auto rounded-2xl border border-stone-200 bg-white">
      <div class="min-w-[900px]">
        <div class="grid grid-cols-[1.5fr_0.8fr_0.8fr_0.8fr_0.9fr_0.9fr_0.8fr_1fr_1fr] gap-3 border-b border-stone-200 bg-stone-50 px-4 py-3 text-xs font-semibold uppercase tracking-wider text-stone-400">
          <div>Name</div>
          <div>Protein</div>
          <div>Cut</div>
          <div>Category</div>
          <div>6 oz</div>
          <div>18 oz</div>
          <div>Status</div>
          <div>Mode</div>
          <div>Actions</div>
        </div>
        <div
          v-for="product in products"
          :key="product.id"
          class="grid grid-cols-[1.5fr_0.8fr_0.8fr_0.8fr_0.9fr_0.9fr_0.8fr_1fr_1fr] items-center gap-3 border-b border-stone-100 px-4 py-4 text-sm text-stone-700 last:border-b-0"
        >
          <div>
            <p class="font-semibold text-[var(--brand-4)]">{{ product.name }}</p>
            <p class="mt-1 text-xs text-stone-400">{{ product.id }}</p>
          </div>
          <div>{{ product.protein || '—' }}</div>
          <div>{{ product.cut || '—' }}</div>
          <div>{{ product.category }}</div>
          <AdminProductVariantCell
            :format-price="formatAdminProductPrice"
            :product="product"
            :size="PRODUCT_VARIANT_SIZES.SIX_OZ"
          />
          <AdminProductVariantCell
            :format-price="formatAdminProductPrice"
            :product="product"
            :size="PRODUCT_VARIANT_SIZES.EIGHTEEN_OZ"
          />
          <div>
            <AdminProductStatusBadge :status="product.status" />
          </div>
          <div>
            <span class="rounded-full bg-[color-mix(in_srgb,var(--brand-5)_70%,white)] px-3 py-1 text-xs font-semibold text-[var(--brand-4)]">
              {{ product.sellingMode || 'inventory-limited' }}
            </span>
          </div>
          <div class="flex flex-wrap gap-2">
            <button
              class="rounded-lg border border-stone-700 px-3 py-2 font-semibold text-stone-700 transition hover:bg-[color:var(--brand-5)]/55"
              @click="emit('edit', product)"
            >
              Edit
            </button>
            <button
              class="rounded-lg border border-stone-700 px-3 py-2 font-semibold text-stone-700 transition hover:bg-[color:var(--brand-5)]/55 disabled:opacity-60"
              :disabled="isDeleting"
              @click="emit('delete', product)"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
