<script setup>
import { onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import AdminProductFormPanel from '../components/AdminProductFormPanel.vue'
import AdminProductsTable from '../components/AdminProductsTable.vue'
import {
  PRODUCT_CATEGORIES,
  PRODUCT_PROTEINS,
  PRODUCT_SELLING_MODES,
  PRODUCT_STATUS_FILTER_OPTIONS,
  PRODUCT_STATUS_OPTIONS,
} from '../constants/adminProducts.constants'
import { useAdminProducts } from '../composables/useAdminProducts'

const {
  activeProducts,
  clearProductFilters,
  closeForm,
  comingSoonProducts,
  deleteProduct,
  draftProducts,
  errorMessage,
  filteredProducts,
  form,
  formTitle,
  isDeleting,
  isEditMode,
  isSubmitting,
  loadProducts,
  openCreateForm,
  productCount,
  productGroups,
  productSearchQuery,
  productStatusFilter,
  showForm,
  startEdit,
  submitButtonLabel,
  submitProduct,
  successMessage,
} = useAdminProducts()

function handleDeleteProduct(product) {
  deleteProduct(product.id, product.name)
}

onMounted(() => {
  loadProducts()
})
</script>

<template>
  <main class="min-h-screen bg-[var(--brand-5)] text-slate-900">
    <section class="mx-auto max-w-[96rem] px-4 py-8 md:px-6 md:py-12 2xl:max-w-[104rem]">
      <div class="section-panel p-5 md:p-7">
        <div class="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p class="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-400">
              Admin / Catalog
            </p>
            <h1 class="mt-2 text-4xl font-extrabold">Products</h1>
            <p class="mt-3 max-w-3xl text-stone-300">
              Manage products, inventory, launch status, and storefront visibility.
            </p>
            <p class="mt-2 text-sm text-stone-400">
              Current products: <strong>{{ productCount }}</strong>
            </p>
          </div>

          <RouterLink
            to="/admin"
            class="rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm font-bold text-[var(--brand-4)] transition hover:border-emerald-400 hover:bg-emerald-50"
          >
            ← Back to Dashboard
          </RouterLink>
        </div>

        <div v-if="errorMessage" class="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
          {{ errorMessage }}
        </div>

        <div v-if="successMessage" class="mt-6 rounded-2xl border border-green-200 bg-green-50 p-4 text-green-700">
          {{ successMessage }}
        </div>

        <div class="mt-6 grid gap-5 xl:grid-cols-[380px_minmax(0,1fr)] xl:items-start 2xl:grid-cols-[400px_minmax(0,1fr)]">
          <AdminProductFormPanel
            :category-options="PRODUCT_CATEGORIES"
            :form="form"
            :form-title="formTitle"
            :is-edit-mode="isEditMode"
            :is-submitting="isSubmitting"
            :product-status-options="PRODUCT_STATUS_OPTIONS"
            :protein-options="PRODUCT_PROTEINS"
            :selling-mode-options="PRODUCT_SELLING_MODES"
            :show-form="showForm"
            :submit-button-label="submitButtonLabel"
            @cancel="closeForm"
            @create="openCreateForm"
            @submit="submitProduct"
          />

          <div class="min-w-0 space-y-5">
            <div class="sticky top-0 z-10 mb-2 flex flex-wrap items-center gap-3 rounded-2xl border border-stone-200 bg-white px-4 py-3 shadow-sm">
              <input
                v-model="productSearchQuery"
                type="text"
                class="min-w-0 flex-1 rounded-xl border border-stone-300 px-3 py-2 text-sm outline-none"
                placeholder="Search products…"
              />
              <select
                v-model="productStatusFilter"
                class="rounded-xl border border-stone-300 px-3 py-2 text-sm outline-none"
              >
                <option
                  v-for="option in PRODUCT_STATUS_FILTER_OPTIONS"
                  :key="option.value"
                  :value="option.value"
                >
                  {{ option.label }}
                </option>
              </select>
              <button
                class="rounded-xl border border-stone-200 bg-stone-50 px-4 py-2 text-sm font-semibold text-stone-700 hover:bg-stone-100 transition"
                :disabled="!productSearchQuery && productStatusFilter === 'all'"
                @click="clearProductFilters"
              >
                Clear
              </button>
              <button
                v-if="!showForm"
                class="ml-auto rounded-xl bg-emerald-400 px-5 py-2 font-bold text-[var(--brand-4)] transition hover:bg-emerald-300"
                @click="openCreateForm"
              >
                + Add Product
              </button>
            </div>

            <div class="sticky top-[58px] z-10 grid grid-cols-2 gap-2 rounded-2xl border border-stone-200 bg-white px-4 py-3 text-center text-xs font-bold uppercase tracking-wider text-stone-400 shadow-sm md:grid-cols-4">
              <div>
                Active
                <span class="ml-2 rounded-full bg-green-100 px-2 py-0.5 text-green-700">{{ activeProducts.length }}</span>
              </div>
              <div>
                Coming Soon
                <span class="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-amber-700">{{ comingSoonProducts.length }}</span>
              </div>
              <div>
                Draft
                <span class="ml-2 rounded-full bg-stone-200 px-2 py-0.5 text-stone-700">{{ draftProducts.length }}</span>
              </div>
              <div>
                Total
                <span class="ml-2 rounded-full bg-stone-100 px-2 py-0.5 text-stone-700">{{ filteredProducts.length }}</span>
              </div>
            </div>

            <div class="space-y-8">
              <AdminProductsTable
                v-for="group in productGroups"
                :key="group.key"
                :count-class="group.countClass"
                :empty-message="group.emptyMessage"
                :is-deleting="isDeleting"
                :products="group.products"
                :title="group.title"
                :title-class="group.titleClass"
                @delete="handleDeleteProduct"
                @edit="startEdit"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>
