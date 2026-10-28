import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const state = vi.hoisted(() => ({ query: vi.fn() }))
vi.mock('../../../src/db/prisma.js', () => ({ prisma: { $queryRaw: state.query } }))
const { getAdminRoutingContext } = await import('../../../src/domains/auth/services/adminRouting.service.js')
beforeEach(() => {
  vi.resetAllMocks()
  vi.stubEnv('NODE_ENV', 'production')
  vi.stubEnv('DATABASE_URL', 'postgresql://fixture:private@postgres.railway.internal:5432/fixture')
  vi.stubEnv('BETTER_AUTH_URL', 'https://api.example.test')
  vi.stubEnv('ADMIN_GATEWAY_REQUIRED', 'true')
  vi.stubEnv('ADMIN_GATEWAY_SECRET', 'synthetic-only-private-gateway-for-test')
})
afterEach(() => vi.unstubAllEnvs())

describe('private staff routing context', () => {
  it('identifies hosted Railway PostgreSQL and the protected route without credentials or DB host', async () => {
    const routing = await getAdminRoutingContext()
    expect(routing).toMatchObject({ target: { code: 'RAILWAY_DB', label: 'RAILWAY DB TARGET' }, environment: 'production', transport: 'protected-gateway', apiOrigin: 'https://api.example.test', databaseConnected: true })
    expect(state.query.mock.calls[0][0].join('')).toBe('SELECT 1')
    expect(Object.keys(routing).sort()).toEqual(['apiOrigin', 'checkedAt', 'databaseConnected', 'environment', 'target', 'transport'])
    expect(Number.isFinite(Date.parse(routing.checkedAt))).toBe(true)
    expect(JSON.stringify(routing)).not.toMatch(/postgresql:|private|railway\.internal|synthetic-only/)
  })
  it('recognizes public Railway proxy hosts but does not guess unknown hosted databases', async () => {
    for (const [host, code] of [['example.proxy.rlwy.net', 'RAILWAY_DB'], ['postgres.railway.internal.attacker.test', 'DEPLOYED'], ['database.example.test', 'DEPLOYED']]) {
      vi.stubEnv('DATABASE_URL', `postgresql://fixture:private@${host}/fixture`)
      expect((await getAdminRoutingContext()).target.code).toBe(code)
    }
  })
  it('preserves local and deliberate local-to-Railway startup targets', async () => {
    vi.stubEnv('NODE_ENV', 'development')
    vi.stubEnv('ADMIN_GATEWAY_REQUIRED', 'false')
    for (const code of ['LOCAL', 'RAILWAY_DB']) {
      vi.stubEnv('ADMIN_DATA_TARGET', code)
      expect(await getAdminRoutingContext()).toMatchObject({ target: { code }, environment: 'development', transport: 'direct' })
    }
  })
  it('reports an unavailable probe without exposing its driver failure', async () => {
    state.query.mockRejectedValue(new Error('private connection URL and driver details'))
    const routing = await getAdminRoutingContext()
    expect(routing.databaseConnected).toBe(false)
    expect(JSON.stringify(routing)).not.toContain('private')
  })
})
