import { findReceiptSettings, findQueuedReceipts, claimQueuedReceipt } from '../repositories/checkoutReceipt.repository.js'
import { dispatchReservedCheckoutReceipt } from './emailProvider.service.js'
import { isAutomaticReceiptLiveEnabled } from './checkoutReceipt.service.js'
import { logOperationalFailure } from '../../../shared/utils/operationalLog.js'

export async function drainCheckoutReceipts() {
  const settings = await findReceiptSettings()
  if (!settings || settings.mode === 'DISABLED') return
  const liveAllowed = settings.mode === 'LIVE' && isAutomaticReceiptLiveEnabled()
  const queued = await findQueuedReceipts({ includeLive: liveAllowed })
  for (const delivery of queued) {
    if (delivery.provider !== 'MOCK' && !liveAllowed) continue
    if (!await claimQueuedReceipt(delivery.id)) continue
    await dispatchReservedCheckoutReceipt(delivery)
  }
}

export function startCheckoutReceiptWorker({ intervalMs = 15000 } = {}) {
  let running = false
  const run = async () => {
    if (running) return
    running = true
    try { await drainCheckoutReceipts() }
    catch (error) { logOperationalFailure('CHECKOUT_RECEIPT_WORKER_FAILED', error) }
    finally { running = false }
  }
  const timer = setInterval(run, intervalMs)
  timer.unref()
  void run()
  return () => clearInterval(timer)
}
