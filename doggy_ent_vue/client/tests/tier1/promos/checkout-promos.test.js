import { describe, expect, it, vi } from 'vitest'
import { nextTick, ref } from 'vue'

const promoApi = vi.hoisted(() => ({
  validatePromoCode: vi.fn(),
}))

vi.mock('../../../src/domains/promos/api/promos.api.js', () => promoApi)

const {
  useCheckoutPromos,
} = await import('../../../src/domains/checkout/composables/useCheckoutPromos.js')

describe('checkout promo workflow', () => {
  it('requires customer email before promo validation', async () => {
    const promos = useCheckoutPromos({
      customer: ref({
        email: '',
      }),
      cartItems: ref([]),
      subtotal: ref(100),
    })

    promos.promoCode.value = 'CHASE20'
    await promos.applyPromoCode()

    expect(promos.promoStatus.value).toBe('error')
    expect(promos.appliedPromoDiscount.value).toBe(0)
    expect(promos.promoMessage.value).toContain('email')
    expect(promoApi.validatePromoCode).not.toHaveBeenCalled()
  })

  it('normalizes email and stores the applied promo discount', async () => {
    promoApi.validatePromoCode.mockResolvedValueOnce({
      valid: true,
      code: 'CHASE20',
      discountType: 'PERCENT',
      discountAmount: 20,
      message: 'Promo code CHASE20 applied successfully.',
    })

    const customer = ref({
      email: ' Test@Example.COM ',
    })

    const promos = useCheckoutPromos({
      customer,
      cartItems: ref([]),
      subtotal: ref(100),
    })

    promos.promoCode.value = 'chase20'
    await promos.applyPromoCode()

    expect(promoApi.validatePromoCode).toHaveBeenCalledWith(
      expect.objectContaining({
        code: 'CHASE20',
        customerEmail: 'test@example.com',
      }),
    )
    expect(promos.appliedPromoCode.value).toBe('CHASE20')
    expect(promos.appliedPromoDiscount.value).toBe(20)
    expect(promos.appliedPromoEmail.value).toBe('test@example.com')
  })

  it('clears an applied promo when the customer email changes', async () => {
    promoApi.validatePromoCode.mockResolvedValueOnce({
      valid: true,
      code: 'CHASE20',
      discountType: 'PERCENT',
      discountAmount: 20,
    })

    const customer = ref({
      email: 'test@example.com',
    })

    const promos = useCheckoutPromos({
      customer,
      cartItems: ref([]),
      subtotal: ref(100),
    })

    promos.promoCode.value = 'CHASE20'
    await promos.applyPromoCode()

    customer.value.email = 'other@example.com'
    await nextTick()

    expect(promos.appliedPromoCode.value).toBe('')
    expect(promos.appliedPromoDiscount.value).toBe(0)
    expect(promos.promoMessage.value).toContain('email changed')
  })
})
