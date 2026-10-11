const proofs = new Map()
export function rememberReceiptAccess(reference, proof) {
  if (!reference || !proof) return
  proofs.set(reference, proof)
  try { sessionStorage.setItem('order-receipt:' + reference, proof) } catch { /* In-memory receipt still works. */ }
}
export function getReceiptAccess(reference) {
  try { return proofs.get(reference) || sessionStorage.getItem('order-receipt:' + reference) || '' }
  catch { return proofs.get(reference) || '' }
}
