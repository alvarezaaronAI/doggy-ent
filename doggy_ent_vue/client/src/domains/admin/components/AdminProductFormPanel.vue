<script setup>
import AdminProductGuaranteedAnalysisFields from './AdminProductGuaranteedAnalysisFields.vue'
import AdminProductVariantEditor from './AdminProductVariantEditor.vue'

defineProps({
  categoryOptions: {
    type: Array,
    required: true,
  },
  form: {
    type: Object,
    required: true,
  },
  formTitle: {
    type: String,
    required: true,
  },
  isEditMode: {
    type: Boolean,
    default: false,
  },
  isSubmitting: {
    type: Boolean,
    default: false,
  },
  productStatusOptions: {
    type: Array,
    required: true,
  },
  proteinOptions: {
    type: Array,
    required: true,
  },
  sellingModeOptions: {
    type: Array,
    required: true,
  },
  showForm: {
    type: Boolean,
    default: false,
  },
  submitButtonLabel: {
    type: String,
    required: true,
  },
})

const emit = defineEmits([
  'cancel',
  'create',
  'submit',
])
</script>

<template>
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
            <option
              v-for="protein in proteinOptions"
              :key="protein"
            >
              {{ protein }}
            </option>
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
        <AdminProductVariantEditor
          field="sixOzPrice"
          :form="form"
          input-type="number"
          label="6 oz Price"
          placeholder="14.99"
          required
          step="0.01"
        />
        <AdminProductVariantEditor
          field="eighteenOzPrice"
          :form="form"
          input-type="number"
          label="18 oz Price"
          placeholder="39.99"
          required
          step="0.01"
        />
        <AdminProductVariantEditor
          field="sixOzQuantity"
          :form="form"
          input-type="number"
          label="6 oz Quantity"
          min="0"
          placeholder="24"
          step="1"
        />
        <AdminProductVariantEditor
          field="eighteenOzQuantity"
          :form="form"
          input-type="number"
          label="18 oz Quantity"
          min="0"
          placeholder="10"
          step="1"
        />
        <AdminProductVariantEditor
          field="sixOzLowStockThreshold"
          :form="form"
          input-type="number"
          label="6 oz Low Stock Threshold"
          min="0"
          placeholder="5"
          step="1"
        />
        <AdminProductVariantEditor
          field="eighteenOzLowStockThreshold"
          :form="form"
          input-type="number"
          label="18 oz Low Stock Threshold"
          min="0"
          placeholder="3"
          step="1"
        />
        <AdminProductVariantEditor
          field="sixOzSku"
          :form="form"
          label="6 oz SKU"
          placeholder="CNE-DT-CHICKEN-6OZ"
        />
        <AdminProductVariantEditor
          field="eighteenOzSku"
          :form="form"
          label="18 oz SKU"
          placeholder="CNE-DT-CHICKEN-18OZ"
        />
        <div>
          <label class="mb-2 block text-sm font-semibold text-[var(--brand-4)]">Category *</label>
          <select
            v-model="form.category"
            class="w-full rounded-2xl border border-stone-700 bg-white px-4 py-3 outline-none"
          >
            <option
              v-for="category in categoryOptions"
              :key="category"
            >
              {{ category }}
            </option>
          </select>
        </div>
        <div>
          <label class="mb-2 block text-sm font-semibold text-[var(--brand-4)]">Status *</label>
          <select
            v-model="form.status"
            class="w-full rounded-2xl border border-stone-700 bg-white px-4 py-3 outline-none"
          >
            <option
              v-for="option in productStatusOptions"
              :key="option.value"
              :value="option.value"
            >
              {{ option.label }}
            </option>
          </select>
        </div>
        <div>
          <label class="mb-2 block text-sm font-semibold text-[var(--brand-4)]">Selling Mode</label>
          <select
            v-model="form.sellingMode"
            class="w-full rounded-2xl border border-stone-700 bg-white px-4 py-3 outline-none"
          >
            <option
              v-for="option in sellingModeOptions"
              :key="option.value"
              :value="option.value"
            >
              {{ option.label }}
            </option>
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
        <AdminProductGuaranteedAnalysisFields :form="form" />
      </div>
      <div class="mt-6 flex flex-wrap gap-3">
        <button
          class="focus-ring rounded-lg bg-emerald-400 px-5 py-3 font-semibold text-[var(--brand-4)] transition hover:bg-emerald-300 disabled:opacity-60"
          :disabled="isSubmitting"
          @click="emit('submit')"
        >
          {{ submitButtonLabel }}
        </button>
        <button
          class="rounded-lg border border-stone-700 px-5 py-3 font-semibold text-stone-700 transition hover:bg-white"
          @click="emit('cancel')"
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
          @click="emit('create')"
        >
          + Add Product
        </button>
      </div>
    </template>
  </div>
</template>
