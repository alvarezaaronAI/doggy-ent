import { computed, onBeforeUnmount, ref } from 'vue'
import { createPaymentIntent, getPaymentConfiguration } from '@payments/services/payment.service.js'
import { cancelCheckoutAttempt, fetchCheckoutAttempt, finalizeCheckoutAttempt, RECOVERY_ERROR, validateAttemptResult } from '../api/checkoutRecovery.api.js'
import { cartFingerprint, CHECKOUT_RECOVERY_KEY, newCheckoutRecovery, readCheckoutRecovery, removeCheckoutRecovery, saveCheckoutRecovery } from '../utils/checkoutRecovery.js'
import { rememberReceiptAccess } from '../utils/receiptAccess.js'

const changedMessage = 'Your checkout changed. Cancel the previous payment attempt before paying for the changed order.'
const storageMessage = 'Payment recovery could not be saved in this browser. Do not pay again if you already tried. Check browser storage or contact us.'
const browserMessage = 'This browser cannot safely start a payment. Use a supported browser for a new purchase. You can still check an existing payment here; do not pay again if it may have completed.'
const confirmable = attempt => ['PREPARED', 'OPEN'].includes(attempt?.status) && attempt.allowedActions.includes('confirm')
function stable(value) {
  if (Array.isArray(value)) return value.map(stable)
  return value && typeof value === 'object'
    ? Object.fromEntries(Object.keys(value).sort().map(key => [key, stable(value[key])])) : value
}

export function useCheckoutRecovery({ getPayload, getTotal, onComplete, onRestore = async () => {} }) {
  // Storage events notify, but cannot atomically serialize competing tabs.
  const confirmationSupported = typeof globalThis.navigator?.locks?.request === 'function'
  const enabled = ref(false), initializing = ref(true), busy = ref(false)
  const hasRecovery = ref(false), blocked = ref(false), attempt = ref(null), message = ref(''), confirmationBlocked = ref(false)
  let record = null, initialization, inputKey = null, disposed = false, completed = false, executing = false
  const active = computed(() => enabled.value || hasRecovery.value || blocked.value)
  const paid = computed(() => ['PAID_PENDING_ORDER', 'COMPLETED', 'PAID_REVIEW'].includes(attempt.value?.status))
  const locked = computed(() => initializing.value || busy.value || blocked.value || confirmationBlocked.value || (enabled.value && !confirmationSupported) || (hasRecovery.value && (!enabled.value || !confirmable(attempt.value))))
  const allowed = action => !busy.value && !blocked.value && attempt.value?.allowedActions.includes(action)
  const canCancel = computed(() => !busy.value && !blocked.value && !paid.value && (attempt.value?.status === 'CANCELED' || allowed('cancel')))
  const canFinalize = computed(() => allowed('finalize') && attempt.value?.status === 'PAID_PENDING_ORDER')
  const canPrepare = computed(() => confirmationSupported && enabled.value && hasRecovery.value && !attempt.value && !blocked.value && !busy.value)
  const canStartNew = computed(() => !busy.value && !blocked.value && attempt.value?.status === 'COMPLETED')

  function currentRecord() {
    const current = readCheckoutRecovery()
    if (!record || !current?.token || current.id !== record.id || current.token !== record.token) throw new Error(storageMessage)
    return current
  }

  function apply(result) {
    validateAttemptResult(result, record.id)
    if (disposed) throw new Error(RECOVERY_ERROR)
    currentRecord()
    const serverExpiry = Date.parse(result.attempt.recoveryExpiresAt)
    if (Number.isFinite(serverExpiry) && serverExpiry < Date.parse(record.expiresAt)) {
      record = { ...record, expiresAt: new Date(serverExpiry).toISOString() }
      saveCheckoutRecovery(record)
      currentRecord()
    }
    const source = result.attempt
    attempt.value = {
      id: source.id, status: source.status, expiresAt: source.expiresAt, recoveryExpiresAt: source.recoveryExpiresAt,
      amountCents: source.amountCents, currency: source.currency, pricing: source.pricing,
      items: source.items, customer: source.customer, shipping: source.shipping, promo: source.promo || null, campaigns: source.campaigns || [], allowedActions: source.allowedActions,
    }
    message.value = ''
    return result
  }

  async function settle(result, openConfirmation = true) {
    if (result.attempt.status === 'PAID_PENDING_ORDER' && result.attempt.allowedActions.includes('finalize')) {
      result = apply(await finalizeCheckoutAttempt(currentRecord()))
    }
    if (result.attempt.status === 'COMPLETED') {
      if (!result.orderReference || !result.receiptAccess) throw new Error(RECOVERY_ERROR)
      rememberReceiptAccess(result.orderReference, result.receiptAccess)
      if (openConfirmation && !completed) {
        await onComplete(result, record.cartFingerprint)
        completed = true
      }
      // Keep the bounded handle: a guest may reopen the receipt in a new tab.
    }
    return result.attempt.status === 'COMPLETED'
  }

  async function reconcile() {
    return settle(apply(await fetchCheckoutAttempt(currentRecord())))
  }

  async function initialize() {
    if (initialization) return initialization
    initialization = (async () => {
      try {
        record = readCheckoutRecovery()
        hasRecovery.value = Boolean(record)
        if (record && !record.token) {
          blocked.value = true
          message.value = 'This payment recovery link has expired. Do not pay again if payment may have completed. Contact us for help.'
        }
      } catch {
        blocked.value = true
        message.value = storageMessage
      }
      try {
        const configuration = await getPaymentConfiguration()
        if (!disposed) enabled.value = configuration.recoveryEnabled === true
      } catch {
        // A saved attempt still recovers when configuration/new creation is down.
        if (!record) { blocked.value = true; message.value = 'Secure payment is unavailable. Please try again later.' }
      }
      if (disposed) return
      try {
        if (record?.token && !blocked.value) {
          const result = apply(await fetchCheckoutAttempt(currentRecord()))
          await onRestore(attempt.value, record.cartFingerprint)
          if (!disposed) await settle(result, false)
        }
      }
      catch { message.value = RECOVERY_ERROR }
      finally {
        if (enabled.value && !confirmationSupported && (!attempt.value || confirmable(attempt.value))) message.value = browserMessage
        initializing.value = false
      }
    })()
    return initialization
  }

  async function ensureRecord(payload) {
    const fingerprint = await cartFingerprint(payload.cartItems)
    try {
      const existing = readCheckoutRecovery()
      if (record && (!existing || existing.id !== record.id || existing.token !== record.token)) throw new Error(storageMessage)
      if (!record) {
        record = existing || newCheckoutRecovery(fingerprint)
        hasRecovery.value = true
      }
      if (!record.token) throw new Error(storageMessage)
      if (record.cartFingerprint !== fingerprint) { confirmationBlocked.value = true; throw new Error(changedMessage) }
      saveCheckoutRecovery(record)
      currentRecord()
    } catch (error) {
      if (error.message === changedMessage) throw error
      blocked.value = true
      throw new Error(storageMessage)
    }
  }

  async function createForAttempt(payload, total) {
    const expectedCents = Math.round(Number(total) * 100)
    if (total == null || !Number.isSafeInteger(expectedCents) || expectedCents <= 0) throw new Error('Review the verified order total before continuing.')
    const snapshot = JSON.parse(JSON.stringify(payload))
    const key = JSON.stringify(stable(snapshot))
    if (inputKey && inputKey !== key) { confirmationBlocked.value = true; throw new Error(changedMessage) }
    await ensureRecord(snapshot)
    inputKey = key
    const result = await createPaymentIntent({ ...snapshot, attemptId: record.id, recoveryToken: record.token })
    apply(result.result)
    if (['COMPLETED', 'PAID_PENDING_ORDER', 'PAID_REVIEW'].includes(attempt.value.status)) {
      await settle(result.result)
      return { recovered: true }
    }
    if (!confirmable(attempt.value)) throw new Error(RECOVERY_ERROR)
    if (attempt.value.amountCents !== expectedCents || attempt.value.currency !== 'usd'
      || Math.round(Number(result.pricing?.total) * 100) !== expectedCents) {
      confirmationBlocked.value = true
      throw new Error('The frozen payment total differs from the reviewed total. Cancel this attempt before reviewing a new total.')
    }
    if (JSON.stringify(stable(getPayload())) !== key) { confirmationBlocked.value = true; throw new Error(changedMessage) }
    currentRecord()
    if (typeof result.clientSecret !== 'string' || !result.clientSecret) throw new Error(RECOVERY_ERROR)
    return result
  }

  async function preparePayment(_payload, total) {
    if (!executing || !enabled.value || blocked.value || confirmationBlocked.value) throw new Error(RECOVERY_ERROR)
    return createForAttempt(getPayload(), total)
  }

  async function run(action) {
    await initialize()
    if (disposed || busy.value || blocked.value) return false
    busy.value = true
    try { return await action() }
    catch (error) {
      const feedback = typeof error?.message === 'string' ? error.message : ''
      message.value = [changedMessage, storageMessage].includes(feedback)
        || feedback.startsWith('The frozen payment total') || feedback.startsWith('Review the verified')
        ? feedback : RECOVERY_ERROR
      return false
    } finally { busy.value = false }
  }

  const check = () => run(reconcile)
  const finalize = () => run(async () => {
    if (!attempt.value?.allowedActions.includes('finalize')) return false
    return settle(apply(await finalizeCheckoutAttempt(currentRecord())))
  })
  const cancel = () => run(async () => {
    if (paid.value || (!attempt.value?.allowedActions.includes('cancel') && attempt.value?.status !== 'CANCELED')) return false
    const result = apply(await (attempt.value.status === 'CANCELED' ? fetchCheckoutAttempt(currentRecord()) : cancelCheckoutAttempt(currentRecord())))
    if (result.attempt.status !== 'CANCELED') return settle(result)
    removeCheckoutRecovery(record)
    record = null; inputKey = null; attempt.value = null; hasRecovery.value = false; completed = false; confirmationBlocked.value = false
    message.value = 'The unpaid payment attempt was canceled. Review your checkout before paying.'
    return true
  })
  const startNew = () => run(async () => {
    if (attempt.value?.status !== 'COMPLETED') return false
    const result = apply(await fetchCheckoutAttempt(currentRecord()))
    if (result.attempt.status !== 'COMPLETED' || !result.orderReference || !result.receiptAccess) return false
    rememberReceiptAccess(result.orderReference, result.receiptAccess)
    removeCheckoutRecovery(record)
    record = null; inputKey = null; attempt.value = null; hasRecovery.value = false; completed = false; confirmationBlocked.value = false
    message.value = 'Your previous order is saved. Review your bag and details before starting a new payment.'
    return true
  })
  const retryPreparation = () => run(async () => {
    if (!record || attempt.value || !enabled.value || !confirmationSupported) return false
    // A lost initial response is retried with the same persisted identity. This
    // prepares only; it never invokes Stripe confirmation or replaces the handle.
    await createForAttempt(getPayload(), getTotal())
    return true
  })

  async function pay(execute, validate) {
    if (!confirmationSupported) {
      await initialize()
      message.value = browserMessage
      return false
    }
    const action = () => run(async () => {
      if (!enabled.value || confirmationBlocked.value || (hasRecovery.value && !confirmable(attempt.value))) return false
      if (!validate()) return false
      executing = true
      try {
        await execute()
        if (completed) return true
        currentRecord()
        return await reconcile()
      } catch (error) {
        if (completed) return true
        const feedback = typeof error?.message === 'string' ? error.message : RECOVERY_ERROR
        try {
          if (record && await reconcile()) return true
        } catch { /* Confirmation may have succeeded. Never discard its capability. */ }
        throw new Error(feedback)
      } finally { executing = false }
    })
    try {
      return await globalThis.navigator.locks.request('doggy-ent-checkout-payment', { ifAvailable: true }, lock => {
        if (lock) return action()
        message.value = 'Another checkout tab is checking this payment. Wait, then check its status before continuing.'
        return false
      })
    } catch { message.value = browserMessage; return false }
  }

  function storageChanged(event) {
    if (event.key !== CHECKOUT_RECOVERY_KEY && event.key !== null) return
    attempt.value = null
    blocked.value = true
    message.value = 'Payment recovery changed in another tab. Reload to check the saved payment before continuing.'
  }
  globalThis.window?.addEventListener?.('storage', storageChanged)
  onBeforeUnmount(() => {
    disposed = true
    inputKey = null; record = null
    attempt.value = null
    globalThis.window?.removeEventListener?.('storage', storageChanged)
  })
  return { enabled, initializing, busy, hasRecovery, blocked, attempt, message, active, paid, locked, canCancel, canFinalize, canPrepare, canStartNew,
    initialize, preparePayment, pay, check, finalize, cancel, startNew, retryPreparation }
}
