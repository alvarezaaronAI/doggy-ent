import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createRenderer, nextTick } from 'vue'

const http = vi.hoisted(() => ({ fetchApi: vi.fn() }))
vi.mock('../../../src/shared/api/http.js', async original => ({ ...(await original()), fetchApi: http.fetchApi }))
import { fetchAdminRouting } from '../../../src/domains/admin/api/adminRouting.api.js'
import { useAdminRouting } from '../../../src/domains/admin/composables/useAdminRouting.js'

const apps = []
let documentState
const fixture = overrides => ({ target: { code: 'RAILWAY_DB', description: 'Deployed server uses Railway PostgreSQL.' }, environment: 'production', transport: 'protected-gateway', apiOrigin: 'https://api.example.test', databaseConnected: true, checkedAt: new Date().toISOString(), ...overrides })
const response = routing => new Response(JSON.stringify({ success: true, target: routing?.target, routing }), { headers: { 'content-type': 'application/json' } })
const flush = async () => { for (let index = 0; index < 10; index++) await Promise.resolve(); await nextTick() }
function mount() {
  let state
  const renderer = createRenderer({ createComment: () => ({}), insert() {}, remove() {}, parentNode() {}, nextSibling() {} })
  const app = renderer.createApp({ setup() { state = useAdminRouting(); return () => null } })
  app.mount({}); apps.push(app)
  return { state, app }
}
beforeEach(() => {
  vi.resetAllMocks(); vi.useFakeTimers(); vi.setSystemTime(new Date('2026-10-27T18:00:00Z'))
  documentState = { hidden: false, addEventListener: vi.fn(), removeEventListener: vi.fn() }
  vi.stubGlobal('document', documentState)
  vi.stubGlobal('window', { location: { origin: 'https://admin.example.test' } })
  http.fetchApi.mockImplementation(async () => response(fixture()))
})
afterEach(() => { for (const app of apps.splice(0)) app.unmount(); expect(vi.getTimerCount()).toBe(0); vi.useRealTimers(); vi.unstubAllGlobals() })

describe('protected staff routing display', () => {
  it('uses the same-origin authenticated route, no cache, cancellation and an explicit projection', async () => {
    const signal = new AbortController().signal
    http.fetchApi.mockResolvedValue(response(fixture({ privateValue: 'not-projected' })))
    const routing = await fetchAdminRouting({ signal })
    expect(http.fetchApi).toHaveBeenCalledExactlyOnceWith('/api/auth/data-target', { cache: 'no-store', signal })
    expect(routing).not.toHaveProperty('privateValue')
    expect(routing.apiOrigin).toBe('https://api.example.test')
  })
  it.each([{ apiOrigin: 'https://user:password@api.example.test' }, { apiOrigin: 'https://api.example.test/path' }, { apiOrigin: 'http://api.example.test' }, { databaseConnected: 'true' }, { target: { code: 'PREVIEW' } }, { checkedAt: 'invalid' }, { transport: 'unknown' }, null])('rejects unsupported routing data %j', async value => {
    http.fetchApi.mockResolvedValue(response(value === null ? null : fixture(value)))
    await expect(fetchAdminRouting()).rejects.toThrow('Routing details are unavailable.')
  })
  it('does not treat old target-only responses as current connection proof', async () => {
    http.fetchApi.mockResolvedValue(new Response(JSON.stringify({ success: true, target: { code: 'DEPLOYED' } }), { headers: { 'content-type': 'application/json' } }))
    const { state } = mount(); await flush()
    expect(state.connected.value).toBe(false)
    expect(state.label.value).toBe('Routing unverified')
  })
  it('shows the actual database rather than using the frontend hostname', async () => {
    const { state } = mount()
    expect(state.label.value).toBe('Checking routing'); await flush()
    expect(state.frontend).toBe('https://admin.example.test')
    expect(state.label.value).toBe('Railway database · Connected')
    expect(state.routing.value.apiOrigin).toBe('https://api.example.test')
    expect(state.connected.value).toBe(true)
    vi.advanceTimersByTime(60_000)
    expect(state.connected.value).toBe(false)
    expect(state.label.value).toBe('Routing unverified')
  })
  it('shows connection failure distinctly and removes prior confirmation on a failed recheck', async () => {
    http.fetchApi.mockResolvedValue(response(fixture({ databaseConnected: false })))
    const { state } = mount(); await flush()
    expect(state.label.value).toBe('Railway database · Connection unavailable')
    http.fetchApi.mockRejectedValue(new Error('private driver detail'))
    await state.refresh()
    expect(state.routing.value).toBeNull()
    expect(state.label.value).toBe('Routing unverified')
    expect(state.error.value).not.toContain('private driver')
  })
  it('deduplicates checks, aborts on exit and ignores a late response', async () => {
    let resolve
    http.fetchApi.mockReturnValue(new Promise(done => { resolve = done }))
    const { state, app } = mount()
    const pending = state.refresh()
    expect(state.refresh()).toBe(pending)
    const { signal } = http.fetchApi.mock.calls[0][1]
    app.unmount(); apps.pop()
    expect(signal.aborted).toBe(true)
    resolve(response(fixture())); await pending
    expect(state.routing.value).toBeNull()
  })
  it('defers hidden initial checks and rechecks an expired result on tab return', async () => {
    documentState.hidden = true
    const { state } = mount()
    expect(http.fetchApi).not.toHaveBeenCalled()
    const recheck = documentState.addEventListener.mock.calls[0][1]
    documentState.hidden = false; recheck(); await flush()
    expect(state.connected.value).toBe(true)
    vi.advanceTimersByTime(60_000); recheck(); await flush()
    expect(http.fetchApi).toHaveBeenCalledTimes(2)
    expect(state.connected.value).toBe(true)
  })
  it('invalidates expired connection evidence after sleep even when the expiry timer has not run', async () => {
    const { state } = mount(); await flush()
    expect(state.connected.value).toBe(true)
    vi.setSystemTime(new Date('2026-10-27T18:05:00Z'))
    let resolve
    http.fetchApi.mockReturnValueOnce(new Promise(done => { resolve = done }))
    documentState.addEventListener.mock.calls[0][1]()
    expect(http.fetchApi).toHaveBeenCalledTimes(2)
    expect(state.connected.value).toBe(false)
    expect(state.label.value).toBe('Checking routing')
    resolve(response(fixture())); await flush()
    expect(state.connected.value).toBe(true)
  })
})
