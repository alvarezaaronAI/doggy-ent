import * as repository from '../repositories/checkoutAttempt.repository.js'
import { checkoutAttempts } from './checkoutAttempt.service.js'
import { recoveryEnabled } from '../utils/checkoutAttempt.js'
import { logOperationalFailure } from '../../../shared/utils/operationalLog.js'

export async function drainCheckoutRecovery({ repo = repository, service = checkoutAttempts, enabled = recoveryEnabled } = {}) {
  if (!enabled()) return
  const visited = new Set()
  for (const event of await repo.listPendingEvents()) {
    if (!event.attemptId) { await repo.ignoreEvent(event.id); continue }
    if (visited.has(event.attemptId)) continue
    visited.add(event.attemptId)
    try {
      await service.reconcile(event.attemptId, { eventPaymentIntentId: event.paymentIntentId })
      const attempt = await repo.findAttempt(event.attemptId)
      if (['COMPLETED', 'CANCELED', 'PAID_REVIEW'].includes(attempt?.status)) await repo.finishEvents(event.attemptId)
    } catch (error) { logOperationalFailure('PAYMENT_EVENT_RECOVERY_FAILED', error) }
  }
  for (const attempt of await repo.listRecoverableAttempts()) {
    if (visited.has(attempt.id)) continue
    try { await service.reconcile(attempt.id) }
    catch (error) { logOperationalFailure('PAYMENT_ATTEMPT_RECOVERY_FAILED', error) }
  }
}

export function startCheckoutRecoveryWorker({ intervalMs = 15000, drain = drainCheckoutRecovery } = {}) {
  let running = false
  const run = async () => {
    if (running) return
    running = true
    try { await drain() }
    catch (error) { logOperationalFailure('PAYMENT_RECOVERY_WORKER_FAILED', error) }
    finally { running = false }
  }
  const timer = setInterval(run, intervalMs)
  timer.unref()
  void run()
  return () => clearInterval(timer)
}
