import { describe, expect, it } from 'vitest'
import { applicationSurfacePlugin, inspectSurfaceModules, resolveApplicationSurface, validateAdminStorefrontOrigin } from '../../../config/applicationSurface.js'
import { getStorefrontHref } from '../../../src/shared/config/applicationSurface.js'
import { normalizeStorefrontOrigin } from '../../../src/shared/utils/storefrontOrigin.js'

describe('explicit application build selection', () => {
  it.each(['production', 'development', 'admin-local', 'test'])('preserves combined compatibility for %s without a configured surface', mode => {
    expect(resolveApplicationSurface(mode)).toBe('combined')
  })
  it.each(['storefront', 'admin', 'combined'])('supports explicit %s mode and Vercel project selection', surface => {
    expect(resolveApplicationSurface(surface)).toBe(surface)
    expect(resolveApplicationSurface('production', surface)).toBe(surface)
    expect(resolveApplicationSurface(surface, surface)).toBe(surface)
  })
  it('rejects typos and conflicts rather than shipping the wrong application', () => {
    expect(() => resolveApplicationSurface('production', 'admn')).toThrow('VITE_APP_SURFACE')
    expect(() => resolveApplicationSurface('storefront', 'admin')).toThrow('disagree')
    expect(() => resolveApplicationSurface('admin', 'combined')).toThrow('disagree')
  })
  it('requires a public HTTPS storefront origin for a standalone admin build only', () => {
    for (const value of ['', 'http://store.example.test', 'https://user:private@example.test', 'https://store.example.test/path', 'https://localhost']) {
      expect(() => validateAdminStorefrontOrigin('admin', 'build', value)).toThrow('VITE_STOREFRONT_ORIGIN')
    }
    expect(() => validateAdminStorefrontOrigin('admin', 'build', 'https://store.example.test/')).not.toThrow()
    expect(() => validateAdminStorefrontOrigin('combined', 'build', '')).not.toThrow()
    expect(() => validateAdminStorefrontOrigin('admin', 'serve', '')).not.toThrow()
  })
})

describe('build artifact isolation, not authorization', () => {
  const adminModule = '/repo/client/src/domains/admin/views/AdminCustomersView.vue'
  const publicModule = '/repo/client/src/app/router/public.routes.js'
  it('rejects an administrative UI dependency in any storefront chunk', () => {
    expect(() => inspectSurfaceModules('storefront', [publicModule, adminModule])).toThrow('administrative UI')
    expect(() => inspectSurfaceModules('storefront', ['C:\\repo\\client\\src\\domains\\admin\\Admin.vue'])).toThrow('administrative UI')
    expect(inspectSurfaceModules('storefront', [publicModule])).toMatchObject({ adminUiModuleCount: 0, publicRouteCatalogueIncluded: true, accessGate: 'not-verified-by-build' })
  })
  it('keeps customer routing out of admin while permitting shared page preview components', () => {
    expect(() => inspectSurfaceModules('admin', [adminModule, publicModule])).toThrow('customer route catalogue')
    expect(inspectSurfaceModules('admin', [adminModule, '/repo/client/src/domains/storefront/Home/HomePageContent.vue'])).toMatchObject({ adminUiModuleCount: 1, publicRouteCatalogueIncluded: false })
  })
  it('emits truthful non-secret artifact identity and gives only standalone admin a robots tag', () => {
    for (const surface of ['combined', 'storefront', 'admin']) {
      const plugin = applicationSurfacePlugin(surface)
      const tags = plugin.transformIndexHtml()
      expect(tags.some(x => x.attrs.name === 'application-surface' && x.attrs.content === surface)).toBe(true)
      expect(tags.some(x => x.attrs.name === 'robots')).toBe(surface === 'admin')
      let emitted
      plugin.generateBundle.call({ emitFile: item => { emitted = item } }, {}, { entry: { type: 'chunk', modules: {} }, image: { type: 'asset' } })
      expect(emitted.fileName).toBe('application-surface.json')
      expect(JSON.parse(emitted.source)).toMatchObject({ surface, accessGate: 'not-verified-by-build' })
      expect(emitted.source).not.toContain('/repo/')
    }
  })
})

describe('safe external View store destination', () => {
  it.each(['javascript:alert(1)', '//evil.example.test', 'https://user:pass@example.test', 'https://example.test/path', 'https://example.test/?query=1', 'https://example.test/#fragment', 'http://example.test', 'https://localhost'])('rejects %s in production configuration', value => {
    expect(normalizeStorefrontOrigin(value)).toBe('')
  })
  it('permits a loopback HTTP origin only for local development', () => {
    expect(normalizeStorefrontOrigin('http://localhost:5173', { allowLocal: true })).toBe('http://localhost:5173')
    expect(normalizeStorefrontOrigin('http://127.0.0.1:5173', { allowLocal: true })).toBe('http://127.0.0.1:5173')
    expect(normalizeStorefrontOrigin('http://[::1]:5173', { allowLocal: true })).toBe('http://[::1]:5173')
    expect(normalizeStorefrontOrigin('http://example.test', { allowLocal: true })).toBe('')
    expect(normalizeStorefrontOrigin('http://localhost:5173')).toBe('')
  })
  it('preserves the combined-store link and never falls back to an admin-origin redirect loop', () => {
    expect(getStorefrontHref('combined', '')).toBe('/')
    expect(getStorefrontHref('storefront', '')).toBe('/')
    expect(getStorefrontHref('admin', '')).toBe('')
    expect(getStorefrontHref('admin', 'https://store.example.test/')).toBe('https://store.example.test/')
  })
})
