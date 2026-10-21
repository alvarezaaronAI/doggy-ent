import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({ query: vi.fn(), target: vi.fn() }))
vi.mock('../../../src/db/prisma.js', () => ({ prisma: { $queryRaw: mocks.query } }))
vi.mock('../../../src/config/env.js', () => ({ getAdminDataTarget: mocks.target }))
const { getDevelopmentContext } = await import('../../../src/shared/services/developmentContext.service.js')
beforeEach(() => { vi.resetAllMocks(); vi.stubEnv('NODE_ENV', 'development') })
afterEach(() => vi.unstubAllEnvs())

describe('non-secret development health context', () => {
  it('confirms the backend startup target only after a read-only connection probe', async () => {
    mocks.target.mockReturnValue({ code: 'RAILWAY_DB', label: 'RAILWAY DB TARGET' })
    const result = await getDevelopmentContext()
    expect(result).toMatchObject({ target: { code: 'RAILWAY_DB' }, databaseConnected: true })
    expect(mocks.query.mock.calls[0][0].join('')).toBe('SELECT 1')
    expect(Object.keys(result).sort()).toEqual(['databaseConnected', 'instanceId', 'target'])
  })
  it('does not expose target/instance or query the database in production', async () => {
    vi.stubEnv('NODE_ENV', 'production')
    expect(await getDevelopmentContext()).toBeNull()
    expect(mocks.query).not.toHaveBeenCalled()
    expect(mocks.target).not.toHaveBeenCalled()
  })
  it('returns an unavailable connection without database/provider exception details', async () => {
    mocks.target.mockReturnValue({ code: 'LOCAL' })
    mocks.query.mockRejectedValue(new Error('private fixture connection detail'))
    const result = await getDevelopmentContext()
    expect(result.databaseConnected).toBe(false)
    expect(JSON.stringify(result)).not.toContain('private fixture')
  })
})
