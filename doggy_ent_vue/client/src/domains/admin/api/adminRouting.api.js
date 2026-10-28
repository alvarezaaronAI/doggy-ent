import { fetchApi, parseJsonResponse } from '@shared/api/http.js'

export async function fetchAdminRouting({ signal } = {}) {
  const data = await parseJsonResponse(await fetchApi('/api/auth/data-target', { cache: 'no-store', signal }), 'Unable to verify data routing.')
  const routing = data?.routing
  let origin
  try { origin = new URL(routing.apiOrigin) } catch { throw new Error('Routing details are unavailable.') }
  if (!data.success || !['LOCAL', 'RAILWAY_DB', 'DEPLOYED'].includes(routing?.target?.code)
    || !['production', 'development'].includes(routing.environment)
    || !['protected-gateway', 'direct'].includes(routing.transport)
    || typeof routing.databaseConnected !== 'boolean' || !Number.isFinite(Date.parse(routing.checkedAt))
    || !['https:', 'http:'].includes(origin.protocol) || origin.username || origin.password
    || origin.pathname !== '/' || origin.search || origin.hash
    || routing.environment === 'production' && origin.protocol !== 'https:') throw new Error('Routing details are unavailable.')
  return {
    target: { code: routing.target.code, description: String(routing.target.description || '') },
    environment: routing.environment, transport: routing.transport, apiOrigin: origin.origin,
    databaseConnected: routing.databaseConnected, checkedAt: routing.checkedAt,
  }
}
