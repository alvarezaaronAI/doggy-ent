<script setup>
import { computed, onMounted, ref } from 'vue'

const products = ref([])
const isLoading = ref(true)
const isSubmitting = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const showAddForm = ref(false)

const form = ref({
  name: '',
  shortDescription: '',
  price: '',
  category: 'Jerky',
  status: 'draft',
  featured: false,
  image: '',
})

const productCount = computed(() => products.value.length)

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
    shortDescription: '',
    price: '',
    category: 'Jerky',
    status: 'draft',
    featured: false,
    image: '',
  }
}

async function submitProduct() {
  errorMessage.value = ''
  successMessage.value = ''

  if (
    !form.value.name ||
    !form.value.shortDescription ||
    !form.value.price ||
    !form.value.category ||
    !form.value.status ||
    !form.value.image
  ) {
    errorMessage.value = 'Please complete all required product fields.'
    return
  }

  isSubmitting.value = true

  try {
    const response = await fetch('/api/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: form.value.name,
        shortDescription: form.value.shortDescription,
        price: Number(form.value.price),
        category: form.value.category,
        status: form.value.status,
        featured: form.value.featured,
        image: form.value.image,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Unable to create product.')
    }

    successMessage.value = `Product "${data.name}" created successfully.`
    resetForm()
    showAddForm.value = false
    await loadProducts()
  } catch (error) {
    errorMessage.value = error.message || 'Unable to create product.'
  } finally {
    isSubmitting.value = false
  }
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
            <p class="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-400">Admin / Catalog</p>
            <h1 class="mt-2 text-4xl font-extrabold">Products</h1>
            <p class="mt-3 max-w-3xl text-stone-300">
              This CMS page now reads from and writes to the same backend products API as the storefront.
            </p>
            <p class="mt-2 text-sm text-stone-400">
              Current products: <strong>{{ productCount }}</strong>
            </p>
          </div>

          <button
            class="focus-ring rounded-lg bg-emerald-400 px-5 py-3 font-semibold text-[var(--brand-4)] transition hover:bg-emerald-300"
            @click="showAddForm = !showAddForm"
          >
            {{ showAddForm ? 'Close Form' : 'Add Product' }}
          </button>
        </div>

        <div v-if="errorMessage" class="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
          {{ errorMessage }}
        </div>

        <div v-if="successMessage" class="mt-6 rounded-2xl border border-green-200 bg-green-50 p-4 text-green-700">
          {{ successMessage }}
        </div>

        <div v-if="showAddForm" class="mt-8 tile rounded-3xl p-6">
          <h2 class="text-2xl font-extrabold">Create Product</h2>
          <p class="mt-2 text-sm text-stone-300">
            This is the first real CMS action. Submitting this form sends a POST request to your backend.
          </p>

          <div class="mt-6 grid gap-4 md:grid-cols-2">
            <div class="md:col-span-2">
              <label class="mb-2 block text-sm font-semibold text-[var(--brand-4)]">Product Name</label>
              <input
                v-model="form.name"
                type="text"
                class="w-full rounded-2xl border border-stone-700 bg-white px-4 py-3 outline-none"
                placeholder="Chicken Breast Jerky"
              />
            </div>

            <div class="md:col-span-2">
              <label class="mb-2 block text-sm font-semibold text-[var(--brand-4)]">Short Description</label>
              <textarea
                v-model="form.shortDescription"
                rows="4"
                class="w-full rounded-2xl border border-stone-700 bg-white px-4 py-3 outline-none"
                placeholder="Describe the product briefly..."
              ></textarea>
            </div>

            <div>
              <label class="mb-2 block text-sm font-semibold text-[var(--brand-4)]">Price</label>
              <input
                v-model="form.price"
                type="number"
                step="0.01"
                class="w-full rounded-2xl border border-stone-700 bg-white px-4 py-3 outline-none"
                placeholder="12.99"
              />
            </div>

            <div>
              <label class="mb-2 block text-sm font-semibold text-[var(--brand-4)]">Category</label>
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
              <label class="mb-2 block text-sm font-semibold text-[var(--brand-4)]">Status</label>
              <select
                v-model="form.status"
                class="w-full rounded-2xl border border-stone-700 bg-white px-4 py-3 outline-none"
              >
                <option value="draft">draft</option>
                <option value="active">active</option>
              </select>
            </div>

            <div class="flex items-center gap-3 pt-8">
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
              <label class="mb-2 block text-sm font-semibold text-[var(--brand-4)]">Image URL</label>
              <input
                v-model="form.image"
                type="text"
                class="w-full rounded-2xl border border-stone-700 bg-white px-4 py-3 outline-none"
                placeholder="https://..."
              />
            </div>
          </div>

          <div class="mt-6 flex flex-wrap gap-3">
            <button
              class="focus-ring rounded-lg bg-emerald-400 px-5 py-3 font-semibold text-[var(--brand-4)] transition hover:bg-emerald-300 disabled:opacity-60"
              :disabled="isSubmitting"
              @click="submitProduct"
            >
              {{ isSubmitting ? 'Saving...' : 'Save Product' }}
            </button>

            <button
              class="rounded-lg border border-stone-700 px-5 py-3 font-semibold text-stone-700 transition hover:bg-white"
              @click="resetForm(); showAddForm = false"
            >
              Cancel
            </button>
          </div>
        </div>

        <div v-if="isLoading" class="mt-6 text-stone-300">
          Loading products...
        </div>

        <div v-else class="mt-8 overflow-hidden rounded-3xl border border-stone-800 bg-white">
          <div class="grid grid-cols-6 gap-4 border-b border-stone-800 bg-[color:var(--brand-5)]/65 px-5 py-4 text-sm font-semibold text-[var(--brand-4)]">
            <div>Name</div>
            <div>Category</div>
            <div>Price</div>
            <div>Status</div>
            <div>Featured</div>
            <div>Actions</div>
          </div>

          <div
            v-for="product in products"
            :key="product.id"
            class="grid grid-cols-6 items-center gap-4 border-b border-stone-800/50 px-5 py-5 text-sm text-stone-700 last:border-b-0"
          >
            <div>
              <p class="font-semibold text-[var(--brand-4)]">{{ product.name }}</p>
              <p class="mt-1 text-xs text-stone-400">{{ product.id }}</p>
            </div>

            <div>{{ product.category }}</div>

            <div>${{ Number(product.price).toFixed(2) }}</div>

            <div>
              <span
                class="rounded-full px-3 py-1 text-xs font-semibold"
                :class="
                  product.status === 'active'
                    ? 'bg-[color:var(--success-1)]/15 text-[color:var(--success-1)]'
                    : 'bg-stone-200 text-stone-700'
                "
              >
                {{ product.status }}
              </span>
            </div>

            <div>
              <span
                class="rounded-full px-3 py-1 text-xs font-semibold"
                :class="
                  product.featured
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-stone-200 text-stone-700'
                "
              >
                {{ product.featured ? 'yes' : 'no' }}
              </span>
            </div>

            <div class="flex flex-wrap gap-2">
              <button class="rounded-lg border border-stone-700 px-3 py-2 font-semibold text-stone-700 transition hover:bg-[color:var(--brand-5)]/55">
                Edit
              </button>
              <button class="rounded-lg border border-stone-700 px-3 py-2 font-semibold text-stone-700 transition hover:bg-[color:var(--brand-5)]/55">
                Delete
              </button>
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
