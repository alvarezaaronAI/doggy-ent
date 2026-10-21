import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import fs from 'node:fs'

const api = vi.hoisted(() => ({ fetchDevelopmentContext: vi.fn() }))
vi.mock('../../../src/shared/api/development.api.js', () => api)
vi.mock('../../../src/shared/api/http.js', () => ({ getApiBaseUrl: () => 'http://localhost:3000' }))
const { useDevelopmentRouting } = await import('../../../src/shared/composables/useDevelopmentRouting.js')
beforeEach(() => { vi.resetAllMocks(); vi.stubGlobal('window', { location: { origin: 'http://localhost:5173' } }) })
afterEach(() => vi.unstubAllGlobals())

describe('backend-owned development routing indicator', () => {
  it('keeps the legacy Railway frontend command on the same local API startup', () => {
    const { scripts } = JSON.parse(fs.readFileSync(new URL('../../../package.json', import.meta.url), 'utf8'))
    expect(scripts['dev:railway']).toBe('npm run dev:local')
    expect(scripts['dev:local']).toContain('VITE_API_BASE_URL=http://localhost:3000')
  })
  it('shows the actual local-server Railway DB response, not a frontend mode assumption', async () => {
    api.fetchDevelopmentContext.mockResolvedValue({ development: { target: { code: 'RAILWAY_DB', label: 'RAILWAY DB TARGET' }, databaseConnected: true, instanceId: 'fixture' } })
    const routing = useDevelopmentRouting()
    await routing.refresh()
    expect(routing.verified.value).toBe(true)
    expect(routing.label.value).toBe('RAILWAY DB TARGET')
    expect(routing.backend).toBe('http://localhost:3000')
    expect(routing.frontend).toBe('http://localhost:5173')
  })
  it('reflects a server restart/change and refuses stale confirmation after failure', async () => {
    api.fetchDevelopmentContext.mockResolvedValueOnce({ development: { target: { code: 'LOCAL', label: 'LOCAL DATA TARGET' }, databaseConnected: true } }).mockRejectedValueOnce(new Error('fixture failure'))
    const routing = useDevelopmentRouting()
    await routing.refresh()
    expect(routing.label.value).toBe('LOCAL DATA TARGET')
    await routing.refresh()
    expect(routing.verified.value).toBe(false)
    expect(routing.label.value).toBe('DATA TARGET UNVERIFIED')
  })
  it('does not guess the database for a deployed/older backend or failed DB probe', async () => {
    const routing = useDevelopmentRouting()
    for (const response of [{ status: 'OK' }, { development: { target: { code: 'LOCAL' }, databaseConnected: false } }]) {
      api.fetchDevelopmentContext.mockResolvedValueOnce(response)
      await routing.refresh()
      expect(routing.verified.value).toBe(false)
    }
  })
})
