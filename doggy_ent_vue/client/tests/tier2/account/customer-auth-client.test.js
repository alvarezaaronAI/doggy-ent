import { afterEach, expect, it, vi } from 'vitest'

afterEach(() => {
  vi.unstubAllEnvs(); vi.unstubAllGlobals(); vi.resetModules()
  vi.doUnmock('../../../src/shared/config/applicationSurface.js')
})

it('the actual Better Auth browser client resolves session requests through the first-party storefront', async () => {
  vi.resetModules()
  vi.doMock('../../../src/shared/config/applicationSurface.js', () => ({ APPLICATION_SURFACE: 'storefront' }))
  vi.stubEnv('DEV', false)
  vi.stubEnv('VITE_API_BASE_URL', 'https://api.example.test')
  vi.stubGlobal('window', { location: { origin: 'https://shop.example.test', href: 'https://shop.example.test/account' } })
  const fetch = vi.fn().mockResolvedValue(new Response('null', { headers: { 'content-type': 'application/json' } }))
  vi.stubGlobal('fetch', fetch)
  const { customerAuthClient } = await import('../../../src/domains/account/api/authClient.js')
  await customerAuthClient.getSession()
  expect(fetch).toHaveBeenCalledOnce()
  const [url, options] = fetch.mock.calls[0]
  expect(String(url)).toBe('https://shop.example.test/api/customer-auth/get-session')
  expect(options.credentials).toBe('include')
  expect(String(url)).not.toContain('api.example.test')
})
