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

const form = ref({
  name: '',
  protein: '',
  cut: '',
  shortDescription: '',
  category: 'Jerky',
  status: 'draft',
  featured: false,
  tags: '',
  image: '',
  ingredients: '',
  texture: '',
  bestFor: '',
  notIncluded: '',
  freshness: '',
  storageFeeding: '',
  sixOzPrice: '',
  eighteenOzPrice: '',
  sixOzQuantity: '',
  eighteenOzQuantity: '',
  sixOzLowStockThreshold: 5,
  eighteenOzLowStockThreshold: 3,
  sixOzSku: '',
  eighteenOzSku: '',
  crudeProteinMin: '70%',
  crudeFatMin: '4.5%',
  crudeFiberMax: '0.5%',
  moistureMax: '20%',
})

const productCount = computed(() => products.value.length)
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
    featured: false,
    tags: '',
    image: '',
    ingredients: '',
    texture: '',
    bestFor: '',
    notIncluded: '',
    freshness: '',
    storageFeeding: '',
    sixOzPrice: '',
    eighteenOzPrice: '',
    sixOzQuantity: '',
    eighteenOzQuantity: '',
    sixOzLowStockThreshold: 5,
    eighteenOzLowStockThreshold: 3,
    sixOzSku: '',
    eighteenOzSku: '',
    crudeProteinMin: '70%',
    crudeFatMin: '4.5%',
    crudeFiberMax: '0.5%',
    moistureMax: '20%',
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
    featured: Boolean(product.featured),
    tags: Array.isArray(product.tags) ? product.tags.join(', ') : '',
    image: product.image || '',
    ingredients: product.ingredients || '',
    texture: product.texture || '',
    bestFor: product.bestFor || '',
    notIncluded: Array.isArray(product.notIncluded) ? product.notIncluded.join(', ') : '',
    freshness: product.freshness || '',
    storageFeeding: product.storageFeeding || '',
    sixOzPrice: sixOzVariant?.price ?? product.price ?? '',
    eighteenOzPrice: eighteenOzVariant?.price ?? '',
    sixOzQuantity: sixOzVariant?.quantity ?? '',
    eighteenOzQuantity: eighteenOzVariant?.quantity ?? '',
    sixOzLowStockThreshold: sixOzVariant?.lowStockThreshold ?? 5,
    eighteenOzLowStockThreshold: eighteenOzVariant?.lowStockThreshold ?? 3,
    sixOzSku: sixOzVariant?.sku || '',
    eighteenOzSku: eighteenOzVariant?.sku || '',
    crudeProteinMin: product.guaranteedAnalysis?.crudeProteinMin || '70%',
    crudeFatMin: product.guaranteedAnalysis?.crudeFatMin || '4.5%',
    crudeFiberMax: product.guaranteedAnalysis?.crudeFiberMax || '0.5%',
    moistureMax: product.guaranteedAnalysis?.moistureMax || '20%',
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
    sixOzPrice: Number(form.value.sixOzPrice),
    eighteenOzPrice: Number(form.value.eighteenOzPrice),
    sixOzQuantity: Number(form.value.sixOzQuantity),
    eighteenOzQuantity: Number(form.value.eighteenOzQuantity),
    sixOzLowStockThreshold: Number(form.value.sixOzLowStockThreshold),
    eighteenOzLowStockThreshold: Number(form.value.eighteenOzLowStockThreshold),
    sixOzSku: form.value.sixOzSku,
    eighteenOzSku: form.value.eighteenOzSku,
    guaranteedAnalysis: {
      crudeProteinMin: form.value.crudeProteinMin,
      crudeFatMin: form.value.crudeFatMin,
      crudeFiberMax: form.value.crudeFiberMax,
      moistureMax: form.value.moistureMax,
    },
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

onMounted(() => {
  loadProducts()
})
</script>

<template>
  <main class="min-h-screen bg-[var(--brand-5)] text-slate-900">
    <section class="mx-auto max-w-7xl px-6 py-10 md:py-14">
      <div class="section-panel p-8 md:p-10">
        <div class="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p class="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-400">
              Admin / Catalog
            </p>
            <h1 class="mt-2 text-4xl font-extrabold">Products</h1>
            <p class="mt-3 max-w-3xl text-stone-300">
              Manage product details, protein type, cut type, and separate 6 oz / 18 oz prices.
            </p>
            <p class="mt-2 text-sm text-stone-400">
              Current products: <strong>{{ productCount }}</strong>
            </p>
          </div>

          <button
            class="focus-ring rounded-lg bg-emerald-400 px-5 py-3 font-semibold text-[var(--brand-4)] transition hover:bg-emerald-300"
            @click="showForm ? closeForm() : openCreateForm()"
          >
            {{ showForm ? 'Close Form' : 'Add Product' }}
          </button>
        </div>

        <div v-if="errorMessage" class="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
          {{ errorMessage }}
        </div>

        <div v-if="successMessage" class="mt-6 rounded-2xl border border-green-200 bg-green-50 p-4 text-green-700">
          {{ successMessage }}
        </div>

        <div v-if="showForm" class="mt-8 tile rounded-3xl p-6">
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

          <div class="mt-6 grid gap-4 md:grid-cols-2">
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

            <div class="md:col-span-2">
              <h3 class="text-lg font-extrabold text-[var(--brand-4)]">Guaranteed Analysis</h3>
            </div>

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
        </div>

        <div v-if="isLoading" class="mt-6 text-stone-300">
          Loading products...
        </div>

        <div v-else class="mt-8 overflow-x-auto rounded-3xl border border-stone-800 bg-white">
          <div class="min-w-[1000px]">
            <div class="grid grid-cols-8 gap-4 border-b border-stone-800 bg-[color:var(--brand-5)]/65 px-5 py-4 text-sm font-semibold text-[var(--brand-4)]">
              <div>Name</div>
              <div>Protein</div>
              <div>Cut</div>
              <div>Category</div>
              <div>6 oz</div>
              <div>18 oz</div>
              <div>Status</div>
              <div>Actions</div>
            </div>

            <div
              v-for="product in products"
              :key="product.id"
              class="grid grid-cols-8 items-center gap-4 border-b border-stone-800/50 px-5 py-5 text-sm text-stone-700 last:border-b-0"
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
                <span
                  class="rounded-full px-3 py-1 text-xs font-semibold"
                  :class="
                    product.status === 'active'
                      ? 'bg-[color:var(--success-1)]/15 text-[color:var(--success-1)]'
                      : product.status === 'coming-soon'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-stone-200 text-stone-700'
                  "
                >
                  {{ product.status }}
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

        <div class="mt-8 flex flex-wrap gap-3">
          <RouterLink
            to="/admin"
            class="rounded-lg border border-stone-700 px-4 py-2 text-sm font-semibold text-stone-700 transition hover:bg-white"
          >
            Back to Dashboard
          </RouterLink>

          <RouterLink
            to="/"
            class="rounded-lg border border-stone-700 px-4 py-2 text-sm font-semibold text-stone-700 transition hover:bg-white"
          >
            Back to Storefront
          </RouterLink>
        </div>
      </div>
    </section>
  </main>
</template>
