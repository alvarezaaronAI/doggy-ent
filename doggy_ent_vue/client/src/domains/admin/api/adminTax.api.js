import { fetchApi, parseJsonResponse } from '@shared/api/http.js'

export async function fetchTaxReadiness() {
  const body = await parseJsonResponse(await fetchApi('/api/admin/payments/tax', { method: 'GET', cache: 'no-store' }), 'Tax setup could not be checked.')
  const value = body?.readiness
  if (body?.success !== true || !value || !['disabled', 'ready', 'not_configured', 'unavailable'].includes(value.status)
    || !['none', 'stripe'].includes(value.provider) || !['sandbox', 'live', 'unconfigured'].includes(value.mode)
    || typeof value.headOfficeConfigured !== 'boolean' || typeof value.productCodeConfigured !== 'boolean'
    || !Array.isArray(value.activeRegistrationStates) || !value.activeRegistrationStates.every(x => /^[A-Z]{2}$/.test(x))
    || !Array.isArray(value.blockers) || !value.blockers.every(x => typeof x?.code === 'string' && typeof x.message === 'string')) {
    throw new Error('Tax setup could not be checked.')
  }
  return {
    provider: value.provider, mode: value.mode, status: value.status,
    headOfficeConfigured: value.headOfficeConfigured, productCodeConfigured: value.productCodeConfigured,
    activeRegistrationStates: [...value.activeRegistrationStates],
    blockers: value.blockers.map(x => ({ code: x.code, message: x.message })),
  }
}
