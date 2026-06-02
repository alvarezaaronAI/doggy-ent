import { computed, ref } from 'vue'
import {
  createCampaign,
  deleteCampaign as deleteCampaignRequest,
  fetchCampaignProducts,
  getCampaigns,
  updateCampaign,
} from '../api/adminCampaigns.api'
import {
  ADMIN_CAMPAIGN_GROUPS,
  CAMPAIGN_FILTER_ALL,
  CAMPAIGN_STATUSES,
} from '../constants/adminCampaigns.constants'
import {
  buildAdminCampaignPayload,
  createEmptyAdminCampaignForm,
  mapCampaignToAdminCampaignForm,
} from '../mappers/adminCampaignForm.mapper'
import {
  normalizeCampaignStatus,
} from '../utils/adminCampaigns.utils'

export function useAdminCampaigns() {
  const campaigns = ref([])
  const products = ref([])
  const isLoading = ref(false)
  const isSaving = ref(false)
  const errorMessage = ref('')
  const successMessage = ref('')
  const editingCampaignId = ref(null)
  const form = ref(createEmptyAdminCampaignForm())

  const campaignSearchQuery = ref('')
  const campaignStatusFilter = ref(CAMPAIGN_FILTER_ALL)

  const activeCampaigns = computed(() =>
    campaigns.value.filter(
      (campaign) => normalizeCampaignStatus(campaign.status) === CAMPAIGN_STATUSES.ACTIVE,
    ),
  )

  const totalDonationGenerated = computed(() =>
    campaigns.value.reduce(
      (total, campaign) => total + Number(campaign.donationGenerated || 0),
      0,
    ),
  )

  const totalRevenueGenerated = computed(() =>
    campaigns.value.reduce(
      (total, campaign) => total + Number(campaign.revenueGenerated || 0),
      0,
    ),
  )

  const totalOrders = computed(() =>
    campaigns.value.reduce(
      (total, campaign) => total + Number(campaign.orderCount || 0),
      0,
    ),
  )

  const filteredCampaigns = computed(() => {
    const query = campaignSearchQuery.value.trim().toLowerCase()

    return campaigns.value.filter((campaign) => {
      const matchesQuery = !query || [
        campaign.name,
        campaign.description,
        campaign.donationTarget,
        campaign.status,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query))

      const matchesStatus = (
        campaignStatusFilter.value === CAMPAIGN_FILTER_ALL
        || normalizeCampaignStatus(campaign.status)
          === normalizeCampaignStatus(campaignStatusFilter.value)
      )

      return matchesQuery && matchesStatus
    })
  })

  const activeFilteredCampaigns = computed(() =>
    filteredCampaigns.value.filter(
      (campaign) => normalizeCampaignStatus(campaign.status) === CAMPAIGN_STATUSES.ACTIVE,
    ),
  )

  const inactiveFilteredCampaigns = computed(() =>
    filteredCampaigns.value.filter(
      (campaign) => normalizeCampaignStatus(campaign.status) !== CAMPAIGN_STATUSES.ACTIVE,
    ),
  )

  const campaignGroups = computed(() =>
    ADMIN_CAMPAIGN_GROUPS.map((group) => {
      const groupCampaigns = group.key === 'active'
        ? activeFilteredCampaigns.value
        : inactiveFilteredCampaigns.value

      return {
        ...group,
        campaigns: groupCampaigns,
        countLabel: `${groupCampaigns.length} ${group.countSuffix}`,
      }
    }),
  )

  function clearCampaignFilters() {
    campaignSearchQuery.value = ''
    campaignStatusFilter.value = CAMPAIGN_FILTER_ALL
  }

  function getProductName(productId) {
    return products.value.find(
      (product) => String(product.id) === String(productId),
    )?.name || productId
  }

  function getCampaignProductNames(campaign) {
    if (!campaign.productIds?.length) return 'No products selected'

    return campaign.productIds.map(getProductName).join(', ')
  }

  async function loadCampaigns() {
    campaigns.value = await getCampaigns()
  }

  async function loadProducts() {
    products.value = await fetchCampaignProducts()
  }

  async function loadPageData() {
    isLoading.value = true
    errorMessage.value = ''

    try {
      await Promise.all([loadCampaigns(), loadProducts()])
    } catch (error) {
      errorMessage.value = error.message || 'Unable to load campaigns.'
    } finally {
      isLoading.value = false
    }
  }

  async function saveCampaign() {
    isSaving.value = true
    errorMessage.value = ''
    successMessage.value = ''

    try {
      const payload = buildAdminCampaignPayload(form.value)

      if (editingCampaignId.value) {
        await updateCampaign(
          editingCampaignId.value,
          payload,
        )
      } else {
        await createCampaign(payload)
      }

      successMessage.value = editingCampaignId.value
        ? 'Campaign updated successfully.'
        : 'Campaign created successfully.'

      resetForm()
      await loadCampaigns()
    } catch (error) {
      errorMessage.value = error.message || 'Unable to save campaign.'
    } finally {
      isSaving.value = false
    }
  }

  function editCampaign(campaign) {
    editingCampaignId.value = campaign.id
    successMessage.value = ''
    errorMessage.value = ''
    form.value = mapCampaignToAdminCampaignForm(campaign)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function deleteCampaign(campaign) {
    const shouldDelete = window.confirm(`Delete campaign ${campaign.name}?`)
    if (!shouldDelete) return

    errorMessage.value = ''
    successMessage.value = ''

    try {
      await deleteCampaignRequest(campaign.id)
      successMessage.value = 'Campaign deleted successfully.'
      await loadCampaigns()
    } catch (error) {
      errorMessage.value = error.message || 'Unable to delete campaign.'
    }
  }

  function resetForm() {
    editingCampaignId.value = null
    form.value = createEmptyAdminCampaignForm()
  }

  return {
    activeCampaigns,
    activeFilteredCampaigns,
    campaignGroups,
    campaignSearchQuery,
    campaignStatusFilter,
    campaigns,
    clearCampaignFilters,
    deleteCampaign,
    editCampaign,
    editingCampaignId,
    errorMessage,
    filteredCampaigns,
    form,
    getCampaignProductNames,
    inactiveFilteredCampaigns,
    isLoading,
    isSaving,
    loadCampaigns,
    loadPageData,
    loadProducts,
    products,
    resetForm,
    saveCampaign,
    successMessage,
    totalDonationGenerated,
    totalOrders,
    totalRevenueGenerated,
  }
}
