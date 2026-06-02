import {
  computed,
  ref,
  watch,
} from 'vue'
import { validatePromoCode } from '@promos/api/promos.api'
import { usePromos } from '@promos/composables/usePromos'
import {
  PROMO_STATUSES,
  PROMO_TYPES,
} from '@promos/constants/promo.constants'
import {
  normalizePromoForm,
  validatePromoForm,
} from '@promos/utils/promo.rules'
import {
  fetchPromoAnalytics,
} from '@promos/api/promos.api'
import {
  ADMIN_PROMO_GROUPS,
  DEFAULT_PROMO_TEST_FORM,
  PROMO_FILTER_ALL,
  UNIQUE_PROMO_DEFAULT_NAME,
} from '../constants/adminPromos.constants'
import {
  buildAdminPromoPayload,
  createEmptyAdminPromoForm,
  mapPromoToAdminPromoForm,
  normalizeOptionalString,
} from '../mappers/adminPromoForm.mapper'
import {
  getSecureRandomPromoCode,
} from '../utils/adminPromos.utils'

export function useAdminPromos() {
  const {
    promos,
    isLoading,
    isSaving,
    errorMessage,
    successMessage,
    loadPromos,
    savePromo: savePromoRequest,
    removePromo,
    clearMessages,
  } = usePromos()

  const editingPromoId = ref(null)
  const isTestingPromo = ref(false)
  const promoTestResult = ref(null)
  const promoTestForm = ref({ ...DEFAULT_PROMO_TEST_FORM })
  const isAnalyticsModalOpen = ref(false)
  const isLoadingAnalytics = ref(false)
  const selectedPromoAnalytics = ref(null)
  const form = ref(createEmptyAdminPromoForm())

  const promoSearchQuery = ref('')
  const promoTypeFilter = ref(PROMO_FILTER_ALL)
  const promoStatusFilter = ref(PROMO_FILTER_ALL)

  const isUniquePromo = computed(
    () => form.value.type === PROMO_TYPES.UNIQUE,
  )

  const isReferralPromo = computed(
    () => form.value.type === PROMO_TYPES.REFERRAL,
  )

  const activePromos = computed(
    () => promos.value.filter(
      (promo) => promo.status === PROMO_STATUSES.ACTIVE,
    ),
  )

  const totalUses = computed(() =>
    promos.value.reduce(
      (total, promo) => total + Number(promo.usedCount || 0),
      0,
    ),
  )

  const totalDiscountGiven = computed(() =>
    promos.value.reduce(
      (total, promo) => total + Number(promo.discountGiven || 0),
      0,
    ),
  )

  const filteredPromos = computed(() => {
    const query = promoSearchQuery.value.trim().toLowerCase()

    return promos.value.filter((promo) => {
      const matchesQuery = !query || [
        promo.code,
        promo.name,
        promo.type,
        promo.status,
        promo.assignedCustomerEmail,
        promo.referralOwnerName,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query))

      const matchesType = (
        promoTypeFilter.value === PROMO_FILTER_ALL
        || promo.type === promoTypeFilter.value
      )

      const matchesStatus = (
        promoStatusFilter.value === PROMO_FILTER_ALL
        || promo.status === promoStatusFilter.value
      )

      return matchesQuery && matchesType && matchesStatus
    })
  })

  const activeFilteredPromos = computed(
    () => filteredPromos.value.filter(
      (promo) => promo.status === PROMO_STATUSES.ACTIVE,
    ),
  )

  const inactiveFilteredPromos = computed(
    () => filteredPromos.value.filter(
      (promo) => promo.status !== PROMO_STATUSES.ACTIVE,
    ),
  )

  const promoGroups = computed(() =>
    ADMIN_PROMO_GROUPS.map((group) => {
      const groupPromos = group.key === 'active'
        ? activeFilteredPromos.value
        : inactiveFilteredPromos.value

      return {
        ...group,
        promos: groupPromos,
        countLabel: `${groupPromos.length} ${group.countSuffix}`,
      }
    }),
  )

  function clearPromoFilters() {
    promoSearchQuery.value = ''
    promoTypeFilter.value = PROMO_FILTER_ALL
    promoStatusFilter.value = PROMO_FILTER_ALL
  }

  function selectPromoForTest(promo) {
    promoTestForm.value.code = promo.code
  }

  async function openPromoAnalytics(promo) {
    isAnalyticsModalOpen.value = true
    isLoadingAnalytics.value = true
    selectedPromoAnalytics.value = null

    try {
      selectedPromoAnalytics.value = await fetchPromoAnalytics(promo.id)
    }
    catch (error) {
      errorMessage.value = (
        error.message
        || 'Unable to load promo analytics.'
      )
    }
    finally {
      isLoadingAnalytics.value = false
    }
  }

  function closePromoAnalytics() {
    isAnalyticsModalOpen.value = false
  }

  function generateUniquePromoCode() {
    form.value.code = getSecureRandomPromoCode()
    form.value.type = PROMO_TYPES.UNIQUE
    form.value.status = PROMO_STATUSES.ACTIVE
    form.value.usageLimitTotal = 1
    form.value.usageLimitPerCustomer = 1

    if (!form.value.name) {
      form.value.name = UNIQUE_PROMO_DEFAULT_NAME
    }
  }

  async function testPromoCode() {
    isTestingPromo.value = true
    promoTestResult.value = null
    errorMessage.value = ''

    try {
      const data = await validatePromoCode({
        code: promoTestForm.value.code,
        customerEmail: normalizeOptionalString(
          promoTestForm.value.customerEmail,
        ),
        cart: {
          subtotal: Number(
            promoTestForm.value.subtotal || 0,
          ),
          items: [],
        },
      })

      promoTestResult.value = {
        ...data,
        statusCode: 200,
      }
    } catch (error) {
      promoTestResult.value = {
        valid: false,
        message: error.message || 'Unable to test promo code.',
        discountAmount: 0,
        statusCode: 500,
      }
    } finally {
      isTestingPromo.value = false
    }
  }

  async function savePromo() {
    const payload = buildAdminPromoPayload(form.value)
    const validation = validatePromoForm(payload)

    if (!validation.valid) {
      errorMessage.value = validation.errors.join(' ')
      successMessage.value = ''
      return
    }

    form.value = {
      ...form.value,
      ...payload,
    }

    await savePromoRequest({
      editingPromoId: editingPromoId.value,
      payload,
      onSuccess: resetForm,
    })
  }

  function enforcePromoRules() {
    const normalized = normalizePromoForm({
      ...form.value,
    })

    form.value = {
      ...form.value,
      ...normalized,
    }
  }

  function editPromo(promo) {
    editingPromoId.value = promo.id
    clearMessages()
    form.value = mapPromoToAdminPromoForm(promo)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function deletePromo(promo) {
    const shouldDelete = window.confirm(
      `Delete promo code ${promo.code}?`,
    )

    if (!shouldDelete) {
      return
    }

    await removePromo({
      promoId: promo.id,
    })
  }

  function resetForm() {
    editingPromoId.value = null
    form.value = createEmptyAdminPromoForm()
  }

  watch(
    () => [
      form.value.type,
      form.value.assignedCustomerEmail,
      form.value.referralOwnerName,
      form.value.usageLimitTotal,
      form.value.usageLimitPerCustomer,
    ],
    enforcePromoRules,
  )

  return {
    activeFilteredPromos,
    activePromos,
    clearPromoFilters,
    closePromoAnalytics,
    deletePromo,
    editPromo,
    editingPromoId,
    errorMessage,
    filteredPromos,
    form,
    generateUniquePromoCode,
    inactiveFilteredPromos,
    isAnalyticsModalOpen,
    isLoading,
    isLoadingAnalytics,
    isReferralPromo,
    isSaving,
    isTestingPromo,
    isUniquePromo,
    loadPromos,
    openPromoAnalytics,
    promoGroups,
    promoSearchQuery,
    promoStatusFilter,
    promoTestForm,
    promoTestResult,
    promoTypeFilter,
    promos,
    resetForm,
    savePromo,
    selectPromoForTest,
    selectedPromoAnalytics,
    successMessage,
    testPromoCode,
    totalDiscountGiven,
    totalUses,
  }
}
