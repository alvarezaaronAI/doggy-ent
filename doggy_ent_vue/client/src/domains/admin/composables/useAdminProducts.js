import { computed, ref } from 'vue'
import {
  createProduct,
  deleteProduct as deleteProductRequest,
  fetchProducts,
  updateProduct,
} from '../api/adminProducts.api'
import {
  ADMIN_PRODUCT_GROUPS,
  PRODUCT_STATUSES,
} from '../constants/adminProducts.constants'
import {
  buildAdminProductPayload,
  createEmptyAdminProductForm,
  mapProductToAdminProductForm,
} from '../mappers/adminProductForm.mapper'
import {
  validateAdminProductForm,
} from '../validators/adminProductForm.validator'

export function useAdminProducts() {
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
  const form = ref(createEmptyAdminProductForm())

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

  const activeProducts = computed(() =>
    filteredProducts.value.filter(
      (product) => product.status === PRODUCT_STATUSES.ACTIVE,
    ),
  )

  const comingSoonProducts = computed(() =>
    filteredProducts.value.filter(
      (product) => product.status === PRODUCT_STATUSES.COMING_SOON,
    ),
  )

  const draftProducts = computed(() =>
    filteredProducts.value.filter(
      (product) => product.status === PRODUCT_STATUSES.DRAFT,
    ),
  )

  const productGroups = computed(() =>
    ADMIN_PRODUCT_GROUPS.map((group) => {
      const productsByStatus = {
        [PRODUCT_STATUSES.ACTIVE]: activeProducts.value,
        [PRODUCT_STATUSES.COMING_SOON]: comingSoonProducts.value,
        [PRODUCT_STATUSES.DRAFT]: draftProducts.value,
      }

      return {
        ...group,
        products: productsByStatus[group.key] || [],
      }
    }),
  )

  const formTitle = computed(() =>
    isEditMode.value ? 'Edit Product' : 'Create Product',
  )

  const submitButtonLabel = computed(() => {
    if (isSubmitting.value) {
      return isEditMode.value ? 'Updating...' : 'Saving...'
    }

    return isEditMode.value ? 'Update Product' : 'Save Product'
  })

  async function loadProducts() {
    isLoading.value = true
    errorMessage.value = ''

    try {
      products.value = await fetchProducts()
    } catch (error) {
      errorMessage.value = error.message || 'Unable to load products.'
    } finally {
      isLoading.value = false
    }
  }

  function resetForm() {
    form.value = createEmptyAdminProductForm()
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

  function startEdit(product) {
    form.value = mapProductToAdminProductForm(product)

    isEditMode.value = true
    editingProductId.value = product.id
    showForm.value = true
    errorMessage.value = ''
    successMessage.value = ''
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function submitProduct() {
    errorMessage.value = ''
    successMessage.value = ''

    const validation = validateAdminProductForm(form.value)

    if (!validation.isValid) {
      errorMessage.value = validation.message
      return
    }

    isSubmitting.value = true

    try {
      const payload = buildAdminProductPayload(form.value)
      const data = isEditMode.value
        ? await updateProduct(editingProductId.value, payload)
        : await createProduct(payload)

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
      const data = await deleteProductRequest(productId)

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

  function clearProductFilters() {
    productSearchQuery.value = ''
    productStatusFilter.value = 'all'
  }

  return {
    activeProducts,
    clearProductFilters,
    closeForm,
    comingSoonProducts,
    deleteProduct,
    draftProducts,
    editingProductId,
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
    productCount,
    productGroups,
    productSearchQuery,
    productStatusFilter,
    products,
    showForm,
    startEdit,
    submitButtonLabel,
    submitProduct,
    successMessage,
  }
}
