import { findProvisionedAdmin, createProvisionedAdmin } from '../repositories/adminProvision.repository.js'

export async function provisionAdmin({ email, passwordHash, apply = false }) {
  if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
    || typeof passwordHash !== 'string' || !/^\$2[aby]\$(1\d|2\d|3[01])\$[./A-Za-z0-9]{53}$/.test(passwordHash)) {
    throw new Error('Provisioning requires ADMIN_EMAIL and a supported ADMIN_PASSWORD_HASH with bcrypt cost at least 10.')
  }
  const normalized = email.trim().toLowerCase()
  const existing = await findProvisionedAdmin(normalized)
  if (existing) {
    if (existing.role !== 'ADMIN' || !existing.accounts.some(account => account.providerId === 'credential')) {
      throw new Error('Existing account conflicts with admin provisioning. No role, credential or verification state was changed.')
    }
    return { created: false, alreadyProvisioned: true }
  }
  if (!apply) return { created: false, ready: true }
  return createProvisionedAdmin({ email: normalized, passwordHash })
}
