import { beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'
import {
  ADMIN_NAVIGATION,
  isAdminNavActive,
} from '../../../src/domains/admin/constants/adminNavigation.constants'
import { useAdminActivity } from '../../../src/domains/admin/composables/useAdminActivity'
import { useAdminIssueWorkspace } from '../../../src/domains/admin/composables/useAdminIssueWorkspace'

const promoApi = vi.hoisted(() => ({
  fetchPromos: vi.fn(),
  createPromo: vi.fn(),
  updatePromo: vi.fn(),
  deletePromo: vi.fn(),
  fetchPromoAnalytics: vi.fn(),
  validatePromoCode: vi.fn(),
}))
const productApi = vi.hoisted(() => ({
  fetchProducts: vi.fn(),
  createProduct: vi.fn(),
  updateProduct: vi.fn(),
  deleteProduct: vi.fn(),
}))
vi.mock('../../../src/domains/promos/api/promos.api', () => promoApi)
vi.mock('../../../src/domains/admin/api/adminProducts.api', () => productApi)
const { useAdminPromos } =
  await import('../../../src/domains/admin/composables/useAdminPromos')
const { useAdminProducts } =
  await import('../../../src/domains/admin/composables/useAdminProducts')

beforeEach(() => vi.clearAllMocks())
describe('calm admin workspace', () => {
  it('retains all eleven navigation tabs and highlights only the correct route family', () => {
    const items = ADMIN_NAVIGATION.flatMap((group) => group.items)
    expect(items).toHaveLength(11)
    expect(new Set(items.map((item) => item.to)).size).toBe(11)
    expect(
      isAdminNavActive(
        '/admin/orders/order-1',
        items.find((item) => item.label === 'Orders'),
      ),
    ).toBe(true)
    expect(isAdminNavActive('/admin/orders', items[0])).toBe(false)
    expect(
      isAdminNavActive(
        '/admin/orders-other',
        items.find((item) => item.label === 'Orders'),
      ),
    ).toBe(false)
  })
  it('filters products by SKU, category and status without mixing variant values', () => {
    const products = useAdminProducts()
    products.products.value = [
      {
        id: '1',
        name: 'Chicken',
        category: 'Jerky',
        status: 'active',
        variants: [
          { sku: 'CH-6', price: 8 },
          { sku: 'CH-18', price: 24 },
        ],
      },
      {
        id: '2',
        name: 'Beef',
        category: 'Bundle',
        status: 'draft',
        variants: [{ sku: 'BF-6' }],
      },
    ]
    products.productSearchQuery.value = ' ch-6 '
    products.productCategoryFilter.value = 'Jerky'
    products.productStatusFilter.value = 'active'
    expect(
      products.filteredProducts.value.map((product) => product.id),
    ).toEqual(['1'])
    products.productCategoryFilter.value = 'Bundle'
    expect(products.filteredProducts.value).toEqual([])
    products.clearProductFilters()
    expect(products.filteredProducts.value).toHaveLength(2)
  })
  it('opens and cancels promo creation without a request', () => {
    const promos = useAdminPromos()
    promos.openCreateForm()
    promos.form.value.code = 'UNSAVED'
    expect(promos.showForm.value).toBe(true)
    promos.resetForm()
    expect(promos.showForm.value).toBe(false)
    expect(promos.form.value.code).toBe('')
    expect(promoApi.createPromo).not.toHaveBeenCalled()
  })
  it('requires an email and normalizes it before a server-owned promo test', async () => {
    const promos = useAdminPromos()
    await promos.testPromoCode()
    expect(promoApi.validatePromoCode).not.toHaveBeenCalled()
    expect(promos.promoTestResult.value.message).toContain('email')
    promos.promoTestForm.value = {
      code: 'CODE',
      subtotal: 50,
      customerEmail: ' Customer@Example.COM ',
    }
    promoApi.validatePromoCode.mockResolvedValueOnce({
      valid: true,
      discountAmount: 7,
    })
    await promos.testPromoCode()
    expect(promoApi.validatePromoCode).toHaveBeenCalledWith({
      code: 'CODE',
      customerEmail: 'customer@example.com',
      cart: { subtotal: 50, items: [] },
    })
    expect(promos.promoTestResult.value.discountAmount).toBe(7)
    promos.promoTestForm.value.customerEmail = 'other@example.com'
    expect(promos.promoTestResult.value).toBeNull()
  })
  it('discards stale promo test responses when inputs change', async () => {
    let resolve
    promoApi.validatePromoCode.mockReturnValueOnce(
      new Promise((done) => {
        resolve = done
      }),
    )
    const promos = useAdminPromos()
    promos.promoTestForm.value.customerEmail = 'one@example.com'
    const request = promos.testPromoCode()
    promos.promoTestForm.value.customerEmail = 'two@example.com'
    resolve({ valid: true, discountAmount: 10 })
    await request
    expect(promos.promoTestResult.value).toBeNull()
    expect(promos.isTestingPromo.value).toBe(false)
  })
  it('does not reuse late analytics after closing the record', async () => {
    let resolve
    promoApi.fetchPromoAnalytics.mockReturnValueOnce(
      new Promise((done) => {
        resolve = done
      }),
    )
    const promos = useAdminPromos()
    const request = promos.openPromoAnalytics({ id: 'one' })
    promos.closePromoAnalytics()
    resolve({ promo: { code: 'OLD' } })
    await request
    expect(promos.isAnalyticsModalOpen.value).toBe(false)
    expect(promos.selectedPromoAnalytics.value).toBeNull()
  })
  it('retains previous activity on failed refresh and reports the failure', async () => {
    const fetch = vi
      .fn()
      .mockResolvedValueOnce({ total: 3 })
      .mockRejectedValueOnce(new Error('Offline'))
    const activity = useAdminActivity(fetch, { event: ' EVENT ' }, 75)
    await activity.load()
    expect(fetch).toHaveBeenCalledWith({ event: 'EVENT', limit: 75 })
    await activity.load()
    expect(activity.data.value.total).toBe(3)
    expect(activity.error.value).toBe('Offline')
    expect(activity.loading.value).toBe(false)
  })
  it('stages issue edits, cancels without writes, and recovers selection after filtering', async () => {
    const fetchIssues = vi
      .fn()
      .mockResolvedValueOnce({ issues: [{ caseNumber: 'A', status: 'OPEN' }] })
      .mockResolvedValueOnce({ issues: [{ caseNumber: 'B', status: 'OPEN' }] })
    const updateIssue = vi.fn()
    const workspace = useAdminIssueWorkspace({
      fetchIssues,
      updateIssue,
      defaults: { status: 'OPEN' },
      initialFilters: { status: '' },
    })
    await workspace.loadIssues()
    workspace.editForm.status = 'RESOLVED'
    await nextTick()
    expect(workspace.dirty.value).toBe(true)
    expect(updateIssue).not.toHaveBeenCalled()
    workspace.cancel()
    expect(workspace.editForm.status).toBe('OPEN')
    await workspace.loadIssues()
    expect(workspace.selectedCaseNumber.value).toBe('B')
    expect(workspace.selectedIssue.value.caseNumber).toBe('B')
  })
  it('retains issue draft after a failed explicit save', async () => {
    const updateIssue = vi
      .fn()
      .mockRejectedValueOnce(new Error('Save failed'))
      .mockResolvedValueOnce({ caseNumber: 'A', status: 'RESOLVED' })
    const workspace = useAdminIssueWorkspace({
      fetchIssues: vi
        .fn()
        .mockResolvedValue({ issues: [{ caseNumber: 'A', status: 'OPEN' }] }),
      updateIssue,
      defaults: { status: 'OPEN' },
      initialFilters: {},
    })
    await workspace.loadIssues()
    workspace.editForm.status = 'RESOLVED'
    await workspace.saveIssue()
    expect(workspace.editForm.status).toBe('RESOLVED')
    expect(workspace.selectedIssue.value.status).toBe('OPEN')
    expect(workspace.error.value).toBe('Save failed')
    await workspace.saveIssue()
    expect(workspace.dirty.value).toBe(false)
    expect(workspace.message.value).toContain('No email')
  })
})
