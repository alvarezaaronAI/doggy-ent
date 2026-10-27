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

  it('rejects unknown codes without recording a redemption', async () => {
    repository.getActivePromoByCode.mockResolvedValue(null)
    repository.getPromoByCode.mockResolvedValue(null)
    const result = await validatePromoCode({ code: 'UNKNOWN', customerEmail: 'qa@example.test', cart: { subtotal: 100 } })
    expect(result).toMatchObject({ valid: false, discountAmount: 0, message: 'Invalid code' })
    expect(repository.createPromoUsageTx).not.toHaveBeenCalled()
  })

  it.each([
    { status: 'DRAFT' }, { status: 'PAUSED' }, { status: 'ARCHIVED' }, { status: 'EXPIRED' },
    { startsAt: new Date(Date.now() + 86400000).toISOString() },
    { endsAt: new Date(Date.now() - 86400000).toISOString() },
  ])('rejects inactive or out-of-schedule promotion %j', async change => {
    repository.getActivePromoByCode.mockResolvedValue({ ...activePromo, ...change })
    expect(await validatePromoCode({ code: activePromo.code, customerEmail: 'qa@example.test', cart: { subtotal: 100 } })).toMatchObject({ valid: false, discountAmount: 0, message: 'Promo not active.' })
    expect(repository.createPromoUsageTx).not.toHaveBeenCalled()
  })

  it('rejects a fully used global allowance', async () => {
    repository.getActivePromoByCode.mockResolvedValue({ ...activePromo, usageLimitTotal: 1 })
    repository.getPromoUsageCount.mockResolvedValue(1)
    expect(await validatePromoCode({ code: activePromo.code, customerEmail: 'qa@example.test', cart: { subtotal: 100 } })).toMatchObject({ valid: false, discountAmount: 0, message: 'Promo usage limit reached.' })
  })

  it('rejects a promotion assigned to another email', async () => {
    repository.getActivePromoByCode.mockResolvedValue({ ...activePromo, assignedCustomerEmail: 'owner@example.test' })
    expect(await validatePromoCode({ code: activePromo.code, customerEmail: 'other@example.test', cart: { subtotal: 100 } })).toMatchObject({ valid: false, discountAmount: 0, message: 'Promo assigned to another customer.' })
  })

  it('matches an assigned email after normalization without consuming the code', async () => {
    repository.getActivePromoByCode.mockResolvedValue({ ...activePromo, assignedCustomerEmail: 'Owner@Example.test' })
    expect(await validatePromoCode({ code: ' chase20 ', customerEmail: ' OWNER@example.test ', cart: { subtotal: 100 } })).toMatchObject({ valid: true, code: 'CHASE20', discountAmount: 20 })
    expect(repository.getActivePromoByCode).toHaveBeenCalledWith('CHASE20')
    expect(repository.createPromoUsageTx).not.toHaveBeenCalled()
    expect(repository.incrementPromoUsageStatsTx).not.toHaveBeenCalled()
  })

  it('caps a fixed discount at the trusted subtotal instead of creating negative merchandise totals', async () => {
    repository.getActivePromoByCode.mockResolvedValue({ ...activePromo, discountType: 'FIXED', discountValue: 999 })
    expect(await validatePromoCode({ code: activePromo.code, customerEmail: 'qa@example.test', cart: { subtotal: 100 } })).toMatchObject({ valid: true, discountAmount: 100 })
  })
})
