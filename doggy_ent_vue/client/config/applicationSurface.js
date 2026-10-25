import { normalizeStorefrontOrigin } from '../src/shared/utils/storefrontOrigin.js'

const surfaces = new Set(['combined', 'storefront', 'admin'])

export function resolveApplicationSurface(mode, configured = '') {
  const value = String(configured || '').trim()
  if (value && !surfaces.has(value)) throw new Error('VITE_APP_SURFACE must be combined, storefront or admin.')
  const explicitMode = surfaces.has(mode) ? mode : ''
  if (explicitMode && value && value !== explicitMode) throw new Error('Application mode and VITE_APP_SURFACE disagree.')
  return explicitMode || value || 'combined'
}

export function validateAdminStorefrontOrigin(surface, command, value) {
  if (surface !== 'admin') return
  if (command === 'build' && !normalizeStorefrontOrigin(value)) {
    throw new Error('Admin builds require VITE_STOREFRONT_ORIGIN to be an HTTPS origin without credentials, path, query or fragment.')
  }
}

export function inspectSurfaceModules(surface, ids) {
  const normalized = ids.map(id => id.replaceAll('\\', '/'))
  const adminUiModuleCount = normalized.filter(id => id.includes('/src/domains/admin/')).length
  const publicRouteCatalogueIncluded = normalized.some(id => id.includes('/app/router/public.routes.js'))
  if (surface === 'storefront' && adminUiModuleCount) throw new Error('Storefront build contains administrative UI modules.')
  if (surface === 'admin' && publicRouteCatalogueIncluded) throw new Error('Admin build contains the customer route catalogue.')
  return { surface, adminUiModuleCount, publicRouteCatalogueIncluded, accessGate: 'not-verified-by-build' }
}

export function applicationSurfacePlugin(surface) {
  return {
    name: 'shop-application-boundary',
    transformIndexHtml() {
      const tags = [{ tag: 'meta', attrs: { name: 'application-surface', content: surface }, injectTo: 'head' }]
      if (surface === 'admin') tags.push({ tag: 'meta', attrs: { name: 'robots', content: 'noindex, nofollow' }, injectTo: 'head' })
      return tags
    },
    generateBundle(options, bundle) {
      const ids = [...new Set(Object.values(bundle).filter(item => item.type === 'chunk').flatMap(chunk => Object.keys(chunk.modules)))]
      const manifest = inspectSurfaceModules(surface, ids)
      this.emitFile({ type: 'asset', fileName: 'application-surface.json', source: JSON.stringify(manifest, null, 2) + '\n' })
    },
  }
}
