import { describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'
import { useCheckout } from '../../../src/domains/checkout/composables/useCheckout.js'

const payment = () => ({ paymentIntentId: 'pi_offline_fixture', status: 'succeeded', checkoutProof: 'offline-proof' })
const order = () => ({ order: { orderNumber: 'CE-OFFLINE' } })

function deferred() {
  let resolve
  const promise = new Promise(done => { resolve = done })
  return { promise, resolve }
}

function fixture(overrides = {}) {
  const actions = {
    validateCheckout: vi.fn(() => true),
    stripePaymentForm: ref({ submitPayment: vi.fn().mockResolvedValue(payment()) }),
    submitOrder: vi.fn().mockResolvedValue(order()),
    onSuccess: vi.fn(),
    onError: vi.fn(),
    ...overrides,
  }
  return { ...actions, state: useCheckout(actions) }
}

describe('same-mounted checkout payment coordination', () => {
  it('does not create an attempt or call payment/order when validation fails', async () => {
    const flow = fixture({ validateCheckout: vi.fn(() => false) })
    await flow.state.placeOrder()
    expect(flow.state.checkoutAttemptId.value).toBeNull()
    expect(flow.stripePaymentForm.value.submitPayment).not.toHaveBeenCalled()
    expect(flow.submitOrder).not.toHaveBeenCalled()
    expect(flow.state.isProcessingOrder.value).toBe(false)
  })

  it('completes card payment before order submission and passes its scoped proof', async () => {
    const waiting = deferred()
    const flow = fixture()
    flow.stripePaymentForm.value.submitPayment.mockReturnValue(waiting.promise)
    const pending = flow.state.placeOrder()
    expect(flow.state.isProcessingOrder.value).toBe(true)
    expect(flow.submitOrder).not.toHaveBeenCalled()
    waiting.resolve(payment())
    expect(await pending).toBe(true)
    expect(flow.submitOrder).toHaveBeenCalledWith({
      completedPaymentIntent: payment(),
      stripePaymentIntentId: 'pi_offline_fixture',
      checkoutAttemptId: flow.state.checkoutAttemptId.value,
    })
    expect(flow.state.paymentCompleted.value).toBe(true)
    expect(flow.state.hasSubmittedOrder.value).toBe(true)
    expect(flow.state.checkoutStatusType.value).toBe('success')
    expect(flow.state.isProcessingOrder.value).toBe(false)
    expect(flow.onSuccess).toHaveBeenCalledWith({ result: order(), completedPaymentIntent: payment() })
  })

  it('ignores repeated clicks while card confirmation is outstanding', async () => {
    const waiting = deferred(), flow = fixture()
    flow.stripePaymentForm.value.submitPayment.mockReturnValue(waiting.promise)
    const pending = flow.state.placeOrder()
    await flow.state.placeOrder()
    await flow.state.placeOrder()
    expect(flow.validateCheckout).toHaveBeenCalledOnce()
    expect(flow.stripePaymentForm.value.submitPayment).toHaveBeenCalledOnce()
    waiting.resolve(payment())
    await pending
    expect(flow.submitOrder).toHaveBeenCalledOnce()
  })

  it('ignores repeated clicks while the paid order is being saved', async () => {
    const waiting = deferred(), flow = fixture({ submitOrder: vi.fn(() => waiting.promise) })
    const pending = flow.state.placeOrder()
    await Promise.resolve()
    expect(flow.state.paymentCompleted.value).toBe(true)
    await flow.state.placeOrder()
    expect(flow.submitOrder).toHaveBeenCalledOnce()
    waiting.resolve(order())
    await pending
    expect(flow.stripePaymentForm.value.submitPayment).toHaveBeenCalledOnce()
  })

  it('does not submit again after an acknowledged successful order', async () => {
    const flow = fixture()
    await flow.state.placeOrder()
    await flow.state.placeOrder()
    expect(flow.stripePaymentForm.value.submitPayment).toHaveBeenCalledOnce()
    expect(flow.submitOrder).toHaveBeenCalledOnce()
    expect(flow.onSuccess).toHaveBeenCalledOnce()
  })

  it('keeps the submit lock until the success callback has finished', async () => {
    const waiting = deferred(), flow = fixture({ onSuccess: vi.fn(() => waiting.promise) })
    const pending = flow.state.placeOrder()
    await Promise.resolve(); await Promise.resolve()
    expect(flow.onSuccess).toHaveBeenCalledOnce()
    expect(flow.state.isProcessingOrder.value).toBe(true)
    await flow.state.placeOrder()
    expect(flow.submitOrder).toHaveBeenCalledOnce()
    waiting.resolve()
    await pending
    expect(flow.state.isProcessingOrder.value).toBe(false)
  })

  it('a known card decline creates no order and reports the payment error', async () => {
    const declined = new Error('Your card was declined.'), flow = fixture()
    flow.stripePaymentForm.value.submitPayment.mockRejectedValue(declined)
    await flow.state.placeOrder()
    expect(flow.submitOrder).not.toHaveBeenCalled()
    expect(flow.onSuccess).not.toHaveBeenCalled()
    expect(flow.onError).toHaveBeenCalledWith(declined)
    expect(flow.state.checkoutStatus.value).toBe(declined.message)
    expect(flow.state.checkoutStatusType.value).toBe('error')
    expect(flow.state.paymentCompleted.value).toBe(false)
    expect(flow.state.completedPaymentIntent.value).toBeNull()
    expect(flow.state.isProcessingOrder.value).toBe(false)
  })

  it('allows a new payment after a known decline, not after a completed payment', async () => {
    const flow = fixture()
    flow.stripePaymentForm.value.submitPayment.mockRejectedValueOnce(new Error('Card declined.'))
    await flow.state.placeOrder()
    expect(flow.state.checkoutAttemptId.value).toBeNull()
    await flow.state.placeOrder()
    expect(flow.stripePaymentForm.value.submitPayment).toHaveBeenCalledTimes(2)
    expect(flow.submitOrder).toHaveBeenCalledOnce()
  })

  it('retains a successful payment and attempt when order saving fails', async () => {
    const failure = new Error('Order could not be saved.'), flow = fixture()
    flow.submitOrder.mockRejectedValueOnce(failure)
    await flow.state.placeOrder()
    const attempt = flow.state.checkoutAttemptId.value
    expect(flow.state.paymentCompleted.value).toBe(true)
    expect(flow.state.completedPaymentIntent.value).toEqual(payment())
    expect(flow.state.hasSubmittedOrder.value).toBe(false)
    expect(flow.state.checkoutResult.value).toBeNull()
    expect(flow.onSuccess).not.toHaveBeenCalled()
    expect(flow.onError).toHaveBeenCalledWith(failure)
    expect(flow.state.isProcessingOrder.value).toBe(false)
    await flow.state.placeOrder()
    expect(flow.stripePaymentForm.value.submitPayment).toHaveBeenCalledOnce()
    expect(flow.submitOrder).toHaveBeenCalledTimes(2)
    expect(flow.submitOrder.mock.calls.map(([input]) => input.checkoutAttemptId)).toEqual([attempt, attempt])
    expect(flow.onSuccess).toHaveBeenCalledOnce()
  })

  it('never charges again on repeated order-finalization failures in the same mounted flow', async () => {
    const flow = fixture({ submitOrder: vi.fn().mockRejectedValue(new Error('Paid order needs review.')) })
    for (let retry = 0; retry < 3; retry++) await flow.state.placeOrder()
    expect(flow.stripePaymentForm.value.submitPayment).toHaveBeenCalledOnce()
    expect(flow.submitOrder).toHaveBeenCalledTimes(3)
    expect(flow.onSuccess).not.toHaveBeenCalled()
    expect(flow.state.paymentCompleted.value).toBe(true)
    expect(flow.state.checkoutStatusType.value).toBe('error')
  })

  it('uses the wallet executor without submitting the separate card form', async () => {
    const flow = fixture(), wallet = vi.fn().mockResolvedValue(payment())
    expect(await flow.state.placeOrder({ paymentExecutor: wallet })).toBe(true)
    expect(flow.validateCheckout).toHaveBeenCalledWith({ wallet: true })
    expect(wallet).toHaveBeenCalledOnce()
    expect(flow.stripePaymentForm.value.submitPayment).not.toHaveBeenCalled()
    expect(flow.submitOrder).toHaveBeenCalledOnce()
  })

  it('a wallet cancellation does not create an order or report success', async () => {
    const flow = fixture(), wallet = vi.fn().mockRejectedValue(new Error('Wallet cancelled.'))
    await flow.state.placeOrder({ paymentExecutor: wallet })
    expect(flow.submitOrder).not.toHaveBeenCalled()
    expect(flow.onSuccess).not.toHaveBeenCalled()
    expect(flow.state.paymentCompleted.value).toBe(false)
    expect(flow.state.isProcessingOrder.value).toBe(false)
  })

  it('retries a paid wallet order without opening another wallet or charging a card', async () => {
    const flow = fixture(), wallet = vi.fn().mockResolvedValue(payment())
    flow.submitOrder.mockRejectedValueOnce(new Error('Lost order response.'))
    await flow.state.placeOrder({ paymentExecutor: wallet })
    await flow.state.placeOrder({ paymentExecutor: wallet })
    expect(wallet).toHaveBeenCalledOnce()
    expect(flow.stripePaymentForm.value.submitPayment).not.toHaveBeenCalled()
    expect(flow.submitOrder).toHaveBeenCalledTimes(2)
  })

  it('supports the original payment id shape without dropping checkout proof', async () => {
    const result = { id: 'pi_offline_legacy', checkoutProof: 'offline-proof' }, flow = fixture()
    flow.stripePaymentForm.value.submitPayment.mockResolvedValue(result)
    await flow.state.placeOrder()
    expect(flow.submitOrder).toHaveBeenCalledWith(expect.objectContaining({ completedPaymentIntent: result, stripePaymentIntentId: result.id }))
  })

  it('provides fallback feedback for failures with no message', async () => {
    const flow = fixture()
    flow.stripePaymentForm.value.submitPayment.mockRejectedValueOnce({})
    await flow.state.placeOrder()
    expect(flow.state.checkoutStatus.value).toBe('Payment failed. Please try again.')
    flow.submitOrder.mockRejectedValueOnce({})
    await flow.state.placeOrder()
    expect(flow.state.checkoutStatus.value).toBe('Checkout failed. Please try again.')
  })
})
