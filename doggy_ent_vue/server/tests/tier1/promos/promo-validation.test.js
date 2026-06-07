import { beforeEach, describe, expect, it, vi } from 'vitest'

const activePromo = {
  id: 'promo-1',
  code: 'CHASE20',
  status: 'ACTIVE',
  discountType: 'PERCENT',
  discountValue: 20,
  minimumSubtotal: 30,
  usageLimitTotal: null,
  usageLimitPerCustomer: 1,
  assignedCustomerEmail: null,
  startsAt: null,
  endsAt: null,
  usedCount: 0,
}

const repository = vi.hoisted(() => ({
  getPromoByCode: vi.fn(),
  getActivePromoByCode: vi.fn(),
  activateScheduledPromos: vi.fn(),
  expireEndedPromos: vi.fn(),
  getPromoUsageCountByCustomer: vi.fn(),
  getPromoUsageCount: vi.fn(),
  createPromoUsageTx: vi.fn(),
  incrementPromoUsageStatsTx: vi.fn(),
  getPromoUsageByOrderIdTx: vi.fn(),
  runPromoTransaction: vi.fn(),
  getAllPromos: vi.fn(),
  getPromoById: vi.fn(),
  createPromo: vi.fn(),
  updatePromoById: vi.fn(),
  deletePromoById: vi.fn(),
  getPromoUsageHistory: vi.fn(),
  getPromoUsageSummary: vi.fn(),
}))

vi.mock('../../../src/domains/promos/repositories/promos.repository.js', () => repository)

const {
  validatePromoCode,
} = await import('../../../src/domains/promos/services/promos.service.js')

describe('promo validation rules', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    repository.getActivePromoByCode.mockResolvedValue(activePromo)
    repository.getPromoByCode.mockResolvedValue(activePromo)
    repository.getPromoUsageCount.mockResolvedValue(0)
    repository.getPromoUsageCountByCustomer.mockResolvedValue(0)
    repository.activateScheduledPromos.mockResolvedValue({})
    repository.expireEndedPromos.mockResolvedValue({})
  })

  it('requires an email before validation and avoids database lookups', async () => {
    const result = await validatePromoCode({
      code: 'CHASE20',
      customerEmail: '',
      cart: {
        subtotal: 100,
      },
    })

    expect(result).toEqual({
      valid: false,
      message: 'Enter your email first so we can check this promo.',
      discountAmount: 0,
    })
    expect(repository.getActivePromoByCode).not.toHaveBeenCalled()
  })

  it('normalizes email before per-customer usage checks', async () => {
    await validatePromoCode({
      code: 'CHASE20',
      customerEmail: ' Test@Example.COM ',
      cart: {
        subtotal: 100,
      },
    })

    expect(repository.getPromoUsageCountByCustomer).toHaveBeenCalledWith(
      activePromo.id,
      'test@example.com',
    )
  })

  it('enforces per-customer usage limits', async () => {
    repository.getPromoUsageCountByCustomer.mockResolvedValue(1)

    const result = await validatePromoCode({
      code: 'CHASE20',
      customerEmail: 'test@example.com',
      cart: {
        subtotal: 100,
      },
    })

    expect(result.valid).toBe(false)
    expect(result.discountAmount).toBe(0)
    expect(result.message).toBe('Customer usage limit reached for this promo.')
  })

  it('rejects carts below the minimum subtotal', async () => {
    const result = await validatePromoCode({
      code: 'CHASE20',
      customerEmail: 'test@example.com',
      cart: {
        subtotal: 20,
      },
    })

    expect(result.valid).toBe(false)
    expect(result.discountAmount).toBe(0)
    expect(result.message).toBe('Minimum subtotal not met.')
  })

  it('returns a non-zero discount for valid percent promos', async () => {
    const result = await validatePromoCode({
      code: 'CHASE20',
      customerEmail: 'test@example.com',
      cart: {
        subtotal: 100,
      },
    })

    expect(result.valid).toBe(true)
    expect(result.discountAmount).toBe(20)
  })
})
