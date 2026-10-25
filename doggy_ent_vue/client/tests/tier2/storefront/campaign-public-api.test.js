import { afterEach, describe, expect, it, vi } from 'vitest'
import { fetchPublicCampaign } from '../../../src/domains/campaigns/api/publicCampaigns.api.js'
afterEach(() => vi.unstubAllGlobals())
describe('public campaign error status', () => {
  it.each([[404, 'application/json', '{"message":"Private diagnostic"}'], [502, 'text/html', '<h1>Proxy failure</h1>']])('preserves status %s for the safe presentation classifier', async (status, type, body) => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(body, { status, headers: { 'Content-Type': type } })))
    await expect(fetchPublicCampaign('fixture')).rejects.toMatchObject({ status })
  })
  it('still reads a public campaign without changing the endpoint contract', async () => {
    const request = vi.fn(async () => new Response('{"campaign":{"slug":"fixture"}}', { headers: { 'Content-Type': 'application/json' } }))
    vi.stubGlobal('fetch', request)
    expect(await fetchPublicCampaign('fixture')).toEqual({ slug: 'fixture' })
    expect(request.mock.calls[0][0]).toMatch(/\/api\/campaigns\/public\/fixture$/)
  })
})
