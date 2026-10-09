<script setup>
import { computed, onMounted } from 'vue'
import AdminProductFormPanel from '../components/AdminProductFormPanel.vue'
import AdminProductsTable from '../components/AdminProductsTable.vue'
import AdminPageHeader from '../components/AdminPageHeader.vue'
import AdminMetrics from '../components/AdminMetrics.vue'
import AdminIcon from '../components/AdminIcon.vue'
import {
  PRODUCT_CATEGORIES,
  PRODUCT_PROTEINS,
  PRODUCT_SELLING_MODES,
  PRODUCT_STATUS_FILTER_OPTIONS,
  PRODUCT_STATUS_OPTIONS,
} from '../constants/adminProducts.constants'
import { useAdminProducts } from '../composables/useAdminProducts'
const {
  closeForm,
  deleteProduct,
  errorMessage,
  filteredProducts,
  form,
  formTitle,
  isDeleting,
  isEditMode,
  isLoading,
  isSubmitting,
  loadProducts,
  openCreateForm,
  productSearchQuery,
  productStatusFilter,
  productCategoryFilter,
  products,
  showForm,
  startEdit,
  submitButtonLabel,
  submitProduct,
  successMessage,
} = useAdminProducts()
const metrics = computed(() => [
  {
    label: 'Active',
    value: products.value.filter((p) => p.status === 'active').length,
    hint: 'Visible in the active catalog',
  },
  {
    label: 'Coming soon',
    value: products.value.filter((p) => p.status === 'coming-soon').length,
    hint: 'Preparing for launch',
  },
  {
    label: 'Drafts',
    value: products.value.filter((p) => p.status === 'draft').length,
    hint: 'Not published',
  },
])
const lowStock = computed(() =>
  products.value.flatMap((product) =>
    product.sellingMode && product.sellingMode !== 'inventory-limited'
      ? []
      : (product.variants || [])
          .filter((v) => Number(v.quantity) <= Number(v.lowStockThreshold ?? 0))
          .map((variant) => ({ product, variant })),
  ),
)
onMounted(loadProducts)
</script>
<template>
  <section class="admin-page">
    <AdminPageHeader
      :title="
        showForm
          ? isEditMode
            ? 'Edit ' + form.name
            : 'Add product'
          : 'Products'
      "
      eyebrow="Catalog"
    >
      <button
        v-if="!showForm"
        type="button"
        class="admin-button admin-primary"
        @click="openCreateForm"
      >
        <AdminIcon name="add" />Add product
      </button>
    </AdminPageHeader>
    <p v-if="errorMessage" role="alert" class="admin-alert admin-alert-error">
      {{ errorMessage }}
    </p>
    <p
      v-if="successMessage"
      role="status"
      class="admin-alert admin-alert-success"
    >
      {{ successMessage }}
    </p>
    <AdminProductFormPanel
      v-if="showForm"
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
    <template v-else>
      <AdminMetrics :items="metrics" :loading="isLoading" />
      <div class="admin-segments" role="group" aria-label="Product status">
        <button
          v-for="option in PRODUCT_STATUS_FILTER_OPTIONS"
          :key="option.value"
          type="button"
          :aria-pressed="productStatusFilter === option.value"
          @click="productStatusFilter = option.value"
        >
          {{ option.label }}
        </button>
      </div>
      <div class="admin-filters">
        <label class="admin-field"
          >Search products<input
            v-model="productSearchQuery"
            type="search"
            placeholder="Product name or SKU"
        /></label>
        <label class="admin-field"
          >Category<select
            aria-label="Category"
            v-model="productCategoryFilter"
          >
            <option value="all">All categories</option>
            <option v-for="category in PRODUCT_CATEGORIES" :key="category">
              {{ category }}
            </option>
          </select></label
        >
        <button
          type="button"
          class="admin-button"
          :disabled="isLoading"
          @click="loadProducts"
        >
          <AdminIcon name="refresh" />Refresh
        </button>
      </div>
      <div class="mb-3 flex items-center justify-between">
        <h2>Product library</h2>
        <span class="admin-muted">{{ filteredProducts.length }} products</span>
      </div>
      <p v-if="isLoading" role="status" class="admin-state">
        Loading products...
      </p>
      <AdminProductsTable
        v-else
        :products="filteredProducts"
        :is-deleting="isDeleting"
        @delete="deleteProduct($event.id, $event.name)"
        @edit="startEdit"
      />
      <section
        v-if="lowStock.length && !isLoading"
        class="mt-8 border-t border-[var(--admin-line)] pt-5"
      >
        <h2>
          Inventory attention
          <span class="admin-badge ml-2">{{ lowStock.length }} variants</span>
        </h2>
        <button
          v-for="entry in lowStock"
          :key="entry.product.id + entry.variant.size"
          type="button"
          class="admin-row w-full text-left"
          @click="startEdit(entry.product)"
        >
          <AdminIcon name="products" /><span class="flex-1"
            ><strong>{{ entry.product.name }} / {{ entry.variant.size }}</strong
            ><small class="admin-muted mt-1 block"
              >{{ entry.variant.quantity }} in stock &middot; Threshold
              {{ entry.variant.lowStockThreshold }}</small
            ></span
          ><span class="admin-link">Review stock<AdminIcon name="next" /></span>
        </button>
      </section>
    </template>
  </section>
</template>
