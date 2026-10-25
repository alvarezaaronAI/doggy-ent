import { normalizeStorefrontOrigin } from '../utils/storefrontOrigin.js'

export const APPLICATION_SURFACE = __SHOP_APPLICATION_SURFACE__

export function getStorefrontHref(surface = APPLICATION_SURFACE, origin = import.meta.env.VITE_STOREFRONT_ORIGIN) {
  if (surface !== 'admin') return '/'
  const normalized = normalizeStorefrontOrigin(origin, { allowLocal: import.meta.env.DEV })
  return normalized ? `${normalized}/` : ''
}
