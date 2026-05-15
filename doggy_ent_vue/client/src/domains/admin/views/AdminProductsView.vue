<script setup>
import { computed, onMounted, ref } from 'vue'

const products = ref([])
const isLoading = ref(true)
const isSubmitting = ref(false)
const isDeleting = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const showForm = ref(false)
const isEditMode = ref(false)
const editingProductId = ref(null)

const productSearchQuery = ref('')
const productStatusFilter = ref('all')

const form = ref({
  name: '',
  protein: '',
  cut: '',
  shortDescription: '',
  category: 'Jerky',
  status: 'draft',
  sellingMode: 'inventory-limited',
  featured: false,
  tags: '',
  image: '',
  ingredients: '',
  texture: '',
  bestFor: '',
  notIncluded: '',
  freshness: '',
  storageFeeding: '',
  showGuaranteedAnalysis: false,
  sixOzPrice: '',
  eighteenOzPrice: '',
  sixOzQuantity: '',
  eighteenOzQuantity: '',
  sixOzLowStockThreshold: 5,
  eighteenOzLowStockThreshold: 3,
  sixOzSku: '',
  eighteenOzSku: '',
  crudeProteinMin: '',
  crudeFatMin: '',
  crudeFiberMax: '',
  moistureMax: '',
})

const productCount = computed(() => products.value.length)

const filteredProducts = computed(() => {
  const query = productSearchQuery.value.trim().toLowerCase()

  return products.value.filter((product) => {
    const matchesQuery = !query || [
      product.name,
      product.protein,
      product.cut,
      product.category,
      product.status,
      product.sellingMode,
      product.id,
    ]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(query))

    const matchesStatus = productStatusFilter.value === 'all'
      || product.status === productStatusFilter.value

    return matchesQuery && matchesStatus
  })
})

const activeProducts = computed(() => filteredProducts.value.filter((product) => product.status === 'active'))
const comingSoonProducts = computed(() => filteredProducts.value.filter((product) => product.status === 'coming-soon'))
const draftProducts = computed(() => filteredProducts.value.filter((product) => product.status === 'draft'))
const formTitle = computed(() => (isEditMode.value ? 'Edit Product' : 'Create Product'))

const submitButtonLabel = computed(() => {
  if (isSubmitting.value) return isEditMode.value ? 'Updating...' : 'Saving...'
  return isEditMode.value ? 'Update Product' : 'Save Product'
})

async function loadProducts() {
  isLoading.value = true
  errorMessage.value = ''

  try {
    const response = await fetch('/api/products')

    if (!response.ok) {
      throw new Error(`Products request failed with status ${response.status}`)
    }

    products.value = await response.json()
  } catch (error) {
    errorMessage.value = error.message || 'Unable to load products.'
  } finally {
    isLoading.value = false
  }
}

function resetForm() {
  form.value = {
    name: '',
    protein: '',
    cut: '',
    shortDescription: '',
    category: 'Jerky',
    status: 'draft',
    sellingMode: 'inventory-limited',
    featured: false,
    tags: '',
    image: '',
    ingredients: '',
    texture: '',
    bestFor: '',
    notIncluded: '',
    freshness: '',
    storageFeeding: '',
    showGuaranteedAnalysis: false,
    sixOzPrice: '',
    eighteenOzPrice: '',
    sixOzQuantity: '',
    eighteenOzQuantity: '',
    sixOzLowStockThreshold: 5,
    eighteenOzLowStockThreshold: 3,
    sixOzSku: '',
    eighteenOzSku: '',
    crudeProteinMin: '',
    crudeFatMin: '',
    crudeFiberMax: '',
    moistureMax: '',
  }
}

function openCreateForm() {
  resetForm()
  isEditMode.value = false
  editingProductId.value = null
  showForm.value = true
  errorMessage.value = ''
  successMessage.value = ''
}

function closeForm() {
  resetForm()
  isEditMode.value = false
  editingProductId.value = null
  showForm.value = false
}

function getVariant(product, size) {
  return product.variants?.find((variant) => variant.size === size)
}

function startEdit(product) {
  const sixOzVariant = getVariant(product, '6 oz')
  const eighteenOzVariant = getVariant(product, '18 oz')

  form.value = {
    name: product.name || '',
    protein: product.protein || '',
    cut: product.cut || '',
    shortDescription: product.shortDescription || '',
    category: product.category || 'Jerky',
    status: product.status || 'draft',
    sellingMode: product.sellingMode || 'inventory-limited',
    featured: Boolean(product.featured),
    tags: Array.isArray(product.tags) ? product.tags.join(', ') : '',
    image: product.image || '',
    ingredients: product.ingredients || '',
    texture: product.texture || '',
    bestFor: product.bestFor || '',
    notIncluded: Array.isArray(product.notIncluded) ? product.notIncluded.join(', ') : '',
    freshness: product.freshness || '',
    storageFeeding: product.storageFeeding || '',
    showGuaranteedAnalysis: Boolean(product.showGuaranteedAnalysis),
    sixOzPrice: sixOzVariant?.price ?? product.price ?? '',
    eighteenOzPrice: eighteenOzVariant?.price ?? '',
    sixOzQuantity: sixOzVariant?.quantity ?? '',
    eighteenOzQuantity: eighteenOzVariant?.quantity ?? '',
    sixOzLowStockThreshold: sixOzVariant?.lowStockThreshold ?? 5,
    eighteenOzLowStockThreshold: eighteenOzVariant?.lowStockThreshold ?? 3,
    sixOzSku: sixOzVariant?.sku || '',
    eighteenOzSku: eighteenOzVariant?.sku || '',
    crudeProteinMin: product.guaranteedAnalysis?.crudeProteinMin || '',
    crudeFatMin: product.guaranteedAnalysis?.crudeFatMin || '',
    crudeFiberMax: product.guaranteedAnalysis?.crudeFiberMax || '',
    moistureMax: product.guaranteedAnalysis?.moistureMax || '',
  }

  isEditMode.value = true
  editingProductId.value = product.id
  showForm.value = true
  errorMessage.value = ''
  successMessage.value = ''
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function validateForm() {
  if (
    !form.value.name ||
    !form.value.shortDescription ||
    !form.value.category ||
    !form.value.status ||
    !form.value.image ||
    !form.value.sixOzPrice ||
    !form.value.eighteenOzPrice
  ) {
    errorMessage.value = 'Please complete all required product fields, including 6 oz and 18 oz prices.'
    return false
  }

  return true
}

function buildPayload() {
  return {
    name: form.value.name,
    protein: form.value.protein,
    cut: form.value.cut,
    shortDescription: form.value.shortDescription,
    category: form.value.category,
    status: form.value.status,
    sellingMode: form.value.sellingMode,
    featured: form.value.featured,
    tags: form.value.tags
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean),
    image: form.value.image,
    ingredients: form.value.ingredients,
    texture: form.value.texture,
    bestFor: form.value.bestFor,
    notIncluded: form.value.notIncluded
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean),
    freshness: form.value.freshness,
    storageFeeding: form.value.storageFeeding,
    showGuaranteedAnalysis: Boolean(form.value.showGuaranteedAnalysis),
    sixOzPrice: Number(form.value.sixOzPrice),
    eighteenOzPrice: Number(form.value.eighteenOzPrice),
    sixOzQuantity: Number(form.value.sixOzQuantity),
    eighteenOzQuantity: Number(form.value.eighteenOzQuantity),
    sixOzLowStockThreshold: Number(form.value.sixOzLowStockThreshold),
    eighteenOzLowStockThreshold: Number(form.value.eighteenOzLowStockThreshold),
    sixOzSku: form.value.sixOzSku,
    eighteenOzSku: form.value.eighteenOzSku,
    guaranteedAnalysis: form.value.showGuaranteedAnalysis
      ? {
          crudeProteinMin: form.value.crudeProteinMin,
          crudeFatMin: form.value.crudeFatMin,
          crudeFiberMax: form.value.crudeFiberMax,
          moistureMax: form.value.moistureMax,
        }
      : {},
  }
}

async function submitProduct() {
  errorMessage.value = ''
  successMessage.value = ''

  if (!validateForm()) return

  isSubmitting.value = true

  try {
    const url = isEditMode.value
      ? `/api/products/${editingProductId.value}`
      : '/api/products'

    const method = isEditMode.value ? 'PUT' : 'POST'

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(buildPayload()),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Unable to save product.')
    }

    successMessage.value = isEditMode.value
      ? `Product "${data.name}" updated successfully.`
      : `Product "${data.name}" created successfully.`

    closeForm()
    await loadProducts()
  } catch (error) {
    errorMessage.value = error.message || 'Unable to save product.'
  } finally {
    isSubmitting.value = false
  }
}

async function deleteProduct(productId, productName) {
  errorMessage.value = ''
  successMessage.value = ''

  const confirmed = window.confirm(`Delete "${productName}"?`)
  if (!confirmed) return

  isDeleting.value = true

  try {
    const response = await fetch(`/api/products/${productId}`, {
      method: 'DELETE',
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Unable to delete product.')
    }

    if (editingProductId.value === productId) {
      closeForm()
    }

    successMessage.value = data.message
    await loadProducts()
  } catch (error) {
    errorMessage.value = error.message || 'Unable to delete product.'
  } finally {
    isDeleting.value = false
  }
}

function formatPrice(value) {
  return `$${Number(value || 0).toFixed(2)}`
}

function clearProductFilters() {
  productSearchQuery.value = ''
  productStatusFilter.value = 'all'
}

function getProductStatusClass(status) {
  if (status === 'active') {
    return 'bg-green-100 text-green-700'
  }
  if (status === 'coming-soon') {
    return 'bg-amber-100 text-amber-700'
  }
  return 'bg-stone-200 text-stone-700'
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

          <div class="tile rounded-3xl p-5">
            <template v-if="showForm">
              <div class="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 class="text-2xl font-extrabold">{{ formTitle }}</h2>
                  <p class="mt-2 text-sm text-stone-300">
                    Edit flat variant prices directly. No multiplier needed.
                  </p>
                </div>
                <span
                  class="w-fit rounded-full px-3 py-1 text-xs font-semibold"
                  :class="isEditMode ? 'bg-blue-100 text-blue-700' : 'bg-stone-200 text-stone-700'"
                >
                  {{ isEditMode ? 'Edit mode' : 'Create mode' }}
                </span>
              </div>

              <div class="mt-5 grid gap-3 md:grid-cols-2">
                
                <div class="md:col-span-2">
                  <label class="mb-2 block text-sm font-semibold text-[var(--brand-4)]">Product Name *</label>
                  <input
                    v-model="form.name"
                    type="text"
                    class="w-full rounded-2xl border border-stone-700 bg-white px-4 py-3 outline-none"
                    placeholder="Chicken Breast Jerky"
                  />
                </div>
                <div>
                  <label class="mb-2 block text-sm font-semibold text-[var(--brand-4)]">Protein Type</label>
                  <select
                    v-model="form.protein"
                    class="w-full rounded-2xl border border-stone-700 bg-white px-4 py-3 outline-none"
                  >
                    <option value="">Select protein</option>
                    <option>Chicken</option>
                    <option>Beef</option>
                    <option>Turkey</option>
                    <option>Lamb</option>
                  </select>
                </div>
                <div>
                  <label class="mb-2 block text-sm font-semibold text-[var(--brand-4)]">Cut Type</label>
                  <input
                    v-model="form.cut"
                    type="text"
                    class="w-full rounded-2xl border border-stone-700 bg-white px-4 py-3 outline-none"
                    placeholder="Breast, lean cut, liver, etc."
                  />
                </div>
                <div class="md:col-span-2">
                  <label class="mb-2 block text-sm font-semibold text-[var(--brand-4)]">Short Description *</label>
                  <textarea
                    v-model="form.shortDescription"
                    rows="4"
                    class="w-full rounded-2xl border border-stone-700 bg-white px-4 py-3 outline-none"
                    placeholder="Describe the product briefly..."
                  ></textarea>
                </div>
                <div>
                  <label class="mb-2 block text-sm font-semibold text-[var(--brand-4)]">6 oz Price *</label>
                  <input
                    v-model="form.sixOzPrice"
                    type="number"
                    step="0.01"
                    class="w-full rounded-2xl border border-stone-700 bg-white px-4 py-3 outline-none"
                    placeholder="14.99"
                  />
                </div>
                <div>
                  <label class="mb-2 block text-sm font-semibold text-[var(--brand-4)]">18 oz Price *</label>
                  <input
                    v-model="form.eighteenOzPrice"
                    type="number"
                    step="0.01"
                    class="w-full rounded-2xl border border-stone-700 bg-white px-4 py-3 outline-none"
                    placeholder="39.99"
                  />
                </div>
                <div>
                  <label class="mb-2 block text-sm font-semibold text-[var(--brand-4)]">6 oz Quantity</label>
                  <input
                    v-model="form.sixOzQuantity"
                    type="number"
                    min="0"
                    step="1"
                    class="w-full rounded-2xl border border-stone-700 bg-white px-4 py-3 outline-none"
                    placeholder="24"
                  />
                </div>
                <div>
                  <label class="mb-2 block text-sm font-semibold text-[var(--brand-4)]">18 oz Quantity</label>
                  <input
                    v-model="form.eighteenOzQuantity"
                    type="number"
                    min="0"
                    step="1"
                    class="w-full rounded-2xl border border-stone-700 bg-white px-4 py-3 outline-none"
                    placeholder="10"
                  />
                </div>
                <div>
                  <label class="mb-2 block text-sm font-semibold text-[var(--brand-4)]">6 oz Low Stock Threshold</label>
                  <input
                    v-model="form.sixOzLowStockThreshold"
                    type="number"
                    min="0"
                    step="1"
                    class="w-full rounded-2xl border border-stone-700 bg-white px-4 py-3 outline-none"
                    placeholder="5"
                  />
                </div>
                <div>
                  <label class="mb-2 block text-sm font-semibold text-[var(--brand-4)]">18 oz Low Stock Threshold</label>
                  <input
                    v-model="form.eighteenOzLowStockThreshold"
                    type="number"
                    min="0"
                    step="1"
                    class="w-full rounded-2xl border border-stone-700 bg-white px-4 py-3 outline-none"
                    placeholder="3"
                  />
                </div>
                <div>
                  <label class="mb-2 block text-sm font-semibold text-[var(--brand-4)]">6 oz SKU</label>
                  <input
                    v-model="form.sixOzSku"
                    type="text"
                    class="w-full rounded-2xl border border-stone-700 bg-white px-4 py-3 outline-none"
                    placeholder="CNE-DT-CHICKEN-6OZ"
                  />
                </div>
                <div>
                  <label class="mb-2 block text-sm font-semibold text-[var(--brand-4)]">18 oz SKU</label>
                  <input
                    v-model="form.eighteenOzSku"
                    type="text"
                    class="w-full rounded-2xl border border-stone-700 bg-white px-4 py-3 outline-none"
                    placeholder="CNE-DT-CHICKEN-18OZ"
                  />
                </div>
                <div>
                  <label class="mb-2 block text-sm font-semibold text-[var(--brand-4)]">Category *</label>
                  <select
                    v-model="form.category"
                    class="w-full rounded-2xl border border-stone-700 bg-white px-4 py-3 outline-none"
                  >
                    <option>Jerky</option>
                    <option>Bundle</option>
                    <option>Training</option>
                    <option>Seasonal</option>
                  </select>
                </div>
                <div>
                  <label class="mb-2 block text-sm font-semibold text-[var(--brand-4)]">Status *</label>
                  <select
                    v-model="form.status"
                    class="w-full rounded-2xl border border-stone-700 bg-white px-4 py-3 outline-none"
                  >
                    <option value="draft">draft</option>
                    <option value="coming-soon">coming-soon</option>
                    <option value="active">active</option>
                  </select>
                </div>
                <div>
                  <label class="mb-2 block text-sm font-semibold text-[var(--brand-4)]">Selling Mode</label>
                  <select
                    v-model="form.sellingMode"
                    class="w-full rounded-2xl border border-stone-700 bg-white px-4 py-3 outline-none"
                  >
                    <option value="inventory-limited">inventory-limited</option>
                    <option value="made-to-order">made-to-order</option>
                    <option value="preorder">preorder</option>
                  </select>
                  <p class="mt-2 text-xs text-stone-400">
                    inventory-limited follows stock. made-to-order allows purchases beyond inventory. preorder is for future launches.
                  </p>
                </div>
                <div class="flex items-center gap-3 pt-2 md:pt-8">
                  <input
                    id="featured-product"
                    v-model="form.featured"
                    type="checkbox"
                    class="h-4 w-4"
                  />
                  <label for="featured-product" class="text-sm font-semibold text-[var(--brand-4)]">
                    Featured product
                  </label>
                </div>
                <div class="md:col-span-2">
                  <label class="mb-2 block text-sm font-semibold text-[var(--brand-4)]">Product Tags</label>
                  <input
                    v-model="form.tags"
                    type="text"
                    class="w-full rounded-2xl border border-stone-700 bg-white px-4 py-3 outline-none"
                    placeholder="Single-ingredient, Grain-free, High Protein"
                  />
                  <p class="mt-2 text-xs text-stone-400">
                    Separate each badge with a comma. These appear as yellow tags on the storefront product card.
                  </p>
                </div>
                <div class="md:col-span-2">
                  <label class="mb-2 block text-sm font-semibold text-[var(--brand-4)]">Image URL *</label>
                  <input
                    v-model="form.image"
                    type="text"
                    class="w-full rounded-2xl border border-stone-700 bg-white px-4 py-3 outline-none"
                    placeholder="https://..."
                  />
                </div>
                <div class="md:col-span-2">
                  <label class="mb-2 block text-sm font-semibold text-[var(--brand-4)]">Ingredients</label>
                  <textarea
                    v-model="form.ingredients"
                    rows="3"
                    class="w-full rounded-2xl border border-stone-700 bg-white px-4 py-3 outline-none"
                    placeholder="Chicken breast. No salt, no sugar..."
                  ></textarea>
                </div>
                <div>
                  <label class="mb-2 block text-sm font-semibold text-[var(--brand-4)]">Texture</label>
                  <input
                    v-model="form.texture"
                    type="text"
                    class="w-full rounded-2xl border border-stone-700 bg-white px-4 py-3 outline-none"
                    placeholder="Firm jerky texture, easy to break"
                  />
                </div>
                <div>
                  <label class="mb-2 block text-sm font-semibold text-[var(--brand-4)]">Freshness / Shelf Life</label>
                  <input
                    v-model="form.freshness"
                    type="text"
                    class="w-full rounded-2xl border border-stone-700 bg-white px-4 py-3 outline-none"
                    placeholder="Best within 14–21 days after opening"
                  />
                </div>
                <div class="md:col-span-2">
                  <label class="mb-2 block text-sm font-semibold text-[var(--brand-4)]">Best For</label>
                  <textarea
                    v-model="form.bestFor"
                    rows="3"
                    class="w-full rounded-2xl border border-stone-700 bg-white px-4 py-3 outline-none"
                    placeholder="Training rewards, bigger dogs, picky pups..."
                  ></textarea>
                </div>
                <div class="md:col-span-2">
                  <label class="mb-2 block text-sm font-semibold text-[var(--brand-4)]">What’s Not Inside</label>
                  <input
                    v-model="form.notIncluded"
                    type="text"
                    class="w-full rounded-2xl border border-stone-700 bg-white px-4 py-3 outline-none"
                    placeholder="No salt, No sugar, No glycerin, No preservatives"
                  />
                  <p class="mt-2 text-xs text-stone-400">
                    Separate each item with a comma. These appear in Quick View as trust badges.
                  </p>
                </div>
                <div class="md:col-span-2">
                  <label class="mb-2 block text-sm font-semibold text-[var(--brand-4)]">Storage & Feeding</label>
                  <textarea
                    v-model="form.storageFeeding"
                    rows="3"
                    class="w-full rounded-2xl border border-stone-700 bg-white px-4 py-3 outline-none"
                    placeholder="Keep sealed in a cool, dry place..."
                  ></textarea>
                </div>
                <div class="md:col-span-2 rounded-2xl border border-stone-200 bg-white/70 p-4">
                  <div class="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 class="text-lg font-extrabold text-[var(--brand-4)]">Guaranteed Analysis</h3>
                      <p class="mt-1 text-sm text-stone-400">
                        Optional. Add this only when you have verified nutrition or lab values ready to show on the storefront.
                      </p>
                    </div>

                    <button
                      type="button"
                      class="rounded-xl border border-stone-300 bg-white px-4 py-2 text-sm font-bold text-[var(--brand-4)] transition hover:border-emerald-400 hover:bg-emerald-50"
                      @click="form.showGuaranteedAnalysis = !form.showGuaranteedAnalysis"
                    >
                      {{ form.showGuaranteedAnalysis ? 'Remove Analysis' : '+ Add Analysis' }}
                    </button>
                  </div>

                  <div v-if="form.showGuaranteedAnalysis" class="mt-4 grid gap-3 md:grid-cols-2">
                    <div>
                      <label class="mb-2 block text-sm font-semibold text-[var(--brand-4)]">Crude Protein Min</label>
                      <input
                        v-model="form.crudeProteinMin"
                        type="text"
                        class="w-full rounded-2xl border border-stone-700 bg-white px-4 py-3 outline-none"
                        placeholder="70%"
                      />
                    </div>

                    <div>
                      <label class="mb-2 block text-sm font-semibold text-[var(--brand-4)]">Crude Fat Min</label>
                      <input
                        v-model="form.crudeFatMin"
                        type="text"
                        class="w-full rounded-2xl border border-stone-700 bg-white px-4 py-3 outline-none"
                        placeholder="4.5%"
                      />
                    </div>

                    <div>
                      <label class="mb-2 block text-sm font-semibold text-[var(--brand-4)]">Crude Fiber Max</label>
                      <input
                        v-model="form.crudeFiberMax"
                        type="text"
                        class="w-full rounded-2xl border border-stone-700 bg-white px-4 py-3 outline-none"
                        placeholder="0.5%"
                      />
                    </div>

                    <div>
                      <label class="mb-2 block text-sm font-semibold text-[var(--brand-4)]">Moisture Max</label>
                      <input
                        v-model="form.moistureMax"
                        type="text"
                        class="w-full rounded-2xl border border-stone-700 bg-white px-4 py-3 outline-none"
                        placeholder="20%"
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div class="mt-6 flex flex-wrap gap-3">
                <button
                  class="focus-ring rounded-lg bg-emerald-400 px-5 py-3 font-semibold text-[var(--brand-4)] transition hover:bg-emerald-300 disabled:opacity-60"
                  :disabled="isSubmitting"
                  @click="submitProduct"
                >
                  {{ submitButtonLabel }}
                </button>
                <button
                  class="rounded-lg border border-stone-700 px-5 py-3 font-semibold text-stone-700 transition hover:bg-white"
                  @click="closeForm"
                >
                  Cancel
                </button>
              </div>
            </template>
            <template v-else>
              <div class="flex h-full flex-col items-center justify-center rounded-3xl border border-dashed border-stone-300 bg-white/60 p-8 text-center">
                <p class="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-400">
                  Product workspace
                </p>
                <h2 class="mt-3 text-2xl font-extrabold text-[var(--brand-4)]">
                  Create or edit products
                </h2>
                <p class="mt-3 max-w-sm text-sm text-stone-400">
                  Add new treats, manage inventory, launch seasonal drops, and edit storefront product information.
                </p>
                <button
                  class="mt-6 rounded-xl bg-emerald-400 px-5 py-3 font-bold text-[var(--brand-4)] transition hover:bg-emerald-300"
                  @click="openCreateForm"
                >
                  + Add Product
                </button>
              </div>
            </template>
          </div>

          <div class="min-w-0 space-y-5">
            <!-- Filter/search card -->
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
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="coming-soon">Coming Soon</option>
                <option value="draft">Draft</option>
              </select>
              <button
                class="rounded-xl border border-stone-200 bg-stone-50 px-4 py-2 text-sm font-semibold text-stone-700 hover:bg-stone-100 transition"
                @click="clearProductFilters"
                :disabled="!productSearchQuery && productStatusFilter === 'all'"
              >
                Clear
              </button>
              <button
                class="ml-auto rounded-xl bg-emerald-400 px-5 py-2 font-bold text-[var(--brand-4)] transition hover:bg-emerald-300"
                @click="openCreateForm"
                v-if="!showForm"
              >
                + Add Product
              </button>
            </div>

            <!-- Sticky summary row -->
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

            <!-- Product Groups -->
            <div class="space-y-8">
              <!-- Active Products -->
              <div>
                <div class="mb-2 flex items-center gap-3">
                  <h3 class="text-lg font-bold text-green-700">Active Products</h3>
                  <span class="rounded-full bg-green-100 px-2 py-0.5 text-xs font-bold text-green-700">{{ activeProducts.length }}</span>
                </div>
                <div v-if="activeProducts.length === 0" class="rounded-2xl border border-stone-200 bg-white px-6 py-8 text-center text-stone-400">
                  No active products.
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
                      v-for="product in activeProducts"
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
                      <div>
                        <p class="font-semibold">{{ formatPrice(getVariant(product, '6 oz')?.price) }}</p>
                        <p class="mt-1 text-xs text-stone-400">Qty: {{ getVariant(product, '6 oz')?.quantity ?? 0 }}</p>
                        <p class="mt-1 text-xs text-stone-400">{{ getVariant(product, '6 oz')?.stockStatus || '—' }}</p>
                      </div>
                      <div>
                        <p class="font-semibold">{{ formatPrice(getVariant(product, '18 oz')?.price) }}</p>
                        <p class="mt-1 text-xs text-stone-400">Qty: {{ getVariant(product, '18 oz')?.quantity ?? 0 }}</p>
                        <p class="mt-1 text-xs text-stone-400">{{ getVariant(product, '18 oz')?.stockStatus || '—' }}</p>
                      </div>
                      <div>
                        <span class="rounded-full px-3 py-1 text-xs font-semibold" :class="getProductStatusClass(product.status)">
                          {{ product.status }}
                        </span>
                      </div>
                      <div>
                        <span class="rounded-full bg-[color-mix(in_srgb,var(--brand-5)_70%,white)] px-3 py-1 text-xs font-semibold text-[var(--brand-4)]">
                          {{ product.sellingMode || 'inventory-limited' }}
                        </span>
                      </div>
                      <div class="flex flex-wrap gap-2">
                        <button
                          class="rounded-lg border border-stone-700 px-3 py-2 font-semibold text-stone-700 transition hover:bg-[color:var(--brand-5)]/55"
                          @click="startEdit(product)"
                        >
                          Edit
                        </button>
                        <button
                          class="rounded-lg border border-stone-700 px-3 py-2 font-semibold text-stone-700 transition hover:bg-[color:var(--brand-5)]/55 disabled:opacity-60"
                          :disabled="isDeleting"
                          @click="deleteProduct(product.id, product.name)"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <!-- Coming Soon Products -->
              <div>
                <div class="mb-2 flex items-center gap-3">
                  <h3 class="text-lg font-bold text-amber-700">Coming Soon</h3>
                  <span class="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-700">{{ comingSoonProducts.length }}</span>
                </div>
                <div v-if="comingSoonProducts.length === 0" class="rounded-2xl border border-stone-200 bg-white px-6 py-8 text-center text-stone-400">
                  No coming soon products.
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
                      v-for="product in comingSoonProducts"
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
                      <div>
                        <p class="font-semibold">{{ formatPrice(getVariant(product, '6 oz')?.price) }}</p>
                        <p class="mt-1 text-xs text-stone-400">Qty: {{ getVariant(product, '6 oz')?.quantity ?? 0 }}</p>
                        <p class="mt-1 text-xs text-stone-400">{{ getVariant(product, '6 oz')?.stockStatus || '—' }}</p>
                      </div>
                      <div>
                        <p class="font-semibold">{{ formatPrice(getVariant(product, '18 oz')?.price) }}</p>
                        <p class="mt-1 text-xs text-stone-400">Qty: {{ getVariant(product, '18 oz')?.quantity ?? 0 }}</p>
                        <p class="mt-1 text-xs text-stone-400">{{ getVariant(product, '18 oz')?.stockStatus || '—' }}</p>
                      </div>
                      <div>
                        <span class="rounded-full px-3 py-1 text-xs font-semibold" :class="getProductStatusClass(product.status)">
                          {{ product.status }}
                        </span>
                      </div>
                      <div>
                        <span class="rounded-full bg-[color-mix(in_srgb,var(--brand-5)_70%,white)] px-3 py-1 text-xs font-semibold text-[var(--brand-4)]">
                          {{ product.sellingMode || 'inventory-limited' }}
                        </span>
                      </div>
                      <div class="flex flex-wrap gap-2">
                        <button
                          class="rounded-lg border border-stone-700 px-3 py-2 font-semibold text-stone-700 transition hover:bg-[color:var(--brand-5)]/55"
                          @click="startEdit(product)"
                        >
                          Edit
                        </button>
                        <button
                          class="rounded-lg border border-stone-700 px-3 py-2 font-semibold text-stone-700 transition hover:bg-[color:var(--brand-5)]/55 disabled:opacity-60"
                          :disabled="isDeleting"
                          @click="deleteProduct(product.id, product.name)"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <!-- Draft Products -->
              <div>
                <div class="mb-2 flex items-center gap-3">
                  <h3 class="text-lg font-bold text-stone-700">Draft Products</h3>
                  <span class="rounded-full bg-stone-200 px-2 py-0.5 text-xs font-bold text-stone-700">{{ draftProducts.length }}</span>
                </div>
                <div v-if="draftProducts.length === 0" class="rounded-2xl border border-stone-200 bg-white px-6 py-8 text-center text-stone-400">
                  No draft products.
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
                      v-for="product in draftProducts"
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
                      <div>
                        <p class="font-semibold">{{ formatPrice(getVariant(product, '6 oz')?.price) }}</p>
                        <p class="mt-1 text-xs text-stone-400">Qty: {{ getVariant(product, '6 oz')?.quantity ?? 0 }}</p>
                        <p class="mt-1 text-xs text-stone-400">{{ getVariant(product, '6 oz')?.stockStatus || '—' }}</p>
                      </div>
                      <div>
                        <p class="font-semibold">{{ formatPrice(getVariant(product, '18 oz')?.price) }}</p>
                        <p class="mt-1 text-xs text-stone-400">Qty: {{ getVariant(product, '18 oz')?.quantity ?? 0 }}</p>
                        <p class="mt-1 text-xs text-stone-400">{{ getVariant(product, '18 oz')?.stockStatus || '—' }}</p>
                      </div>
                      <div>
                        <span class="rounded-full px-3 py-1 text-xs font-semibold" :class="getProductStatusClass(product.status)">
                          {{ product.status }}
                        </span>
                      </div>
                      <div>
                        <span class="rounded-full bg-[color-mix(in_srgb,var(--brand-5)_70%,white)] px-3 py-1 text-xs font-semibold text-[var(--brand-4)]">
                          {{ product.sellingMode || 'inventory-limited' }}
                        </span>
                      </div>
                      <div class="flex flex-wrap gap-2">
                        <button
                          class="rounded-lg border border-stone-700 px-3 py-2 font-semibold text-stone-700 transition hover:bg-[color:var(--brand-5)]/55"
                          @click="startEdit(product)"
                        >
                          Edit
                        </button>
                        <button
                          class="rounded-lg border border-stone-700 px-3 py-2 font-semibold text-stone-700 transition hover:bg-[color:var(--brand-5)]/55 disabled:opacity-60"
                          :disabled="isDeleting"
                          @click="deleteProduct(product.id, product.name)"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div><!-- end two-column grid -->

      </div>
    </section>
  </main>
</template>
