import { beforeEach, describe, expect, it, vi } from 'vitest'
vi.mock('vue-router', async original => {
  const module = await original()
  return { ...module, createWebHistory: module.createMemoryHistory }
})
const api = vi.hoisted(() => ({ fetchApi: vi.fn() }))
vi.mock('../../../src/shared/api/http.js', async original => ({ ...await original(), fetchApi: api.fetchApi }))
import combined from '../../../src/app/router/index.js'
import storefront from '../../../src/app/router/storefront.js'
import admin from '../../../src/app/router/admin.js'
import { adminRoutes } from '../../../src/app/router/admin.routes.js'

beforeEach(() => {
  api.fetchApi.mockReset().mockResolvedValue(new Response('{}', { status: 401, headers: { 'Content-Type': 'application/json' } }))
})

describe('separate route catalogues with unchanged server-owned sessions', () => {
  it('preserves every administrative path/name and inherited authorization in compatibility mode', () => {
    for (const child of adminRoutes[1].children) {
      const path = '/admin' + (child.path ? '/' + child.path.replace(':orderId', 'fixture').replace(':customerId', 'fixture') : '')
      expect(admin.resolve(path).name).toBe(child.name)
      expect(combined.resolve(path).name).toBe(child.name)
      expect(admin.resolve(path).meta.requiresAdminAuth).toBe(true)
      expect(storefront.resolve(path).name).toBe('not-found')
    }
  })
  it('does not offer an admin login route on the standalone storefront', () => {
    expect(storefront.resolve('/admin/login').name).toBe('not-found')
    expect(storefront.getRoutes().some(r => r.name === 'admin-login')).toBe(false)
    expect(combined.resolve('/admin/login').name).toBe('admin-login')
  })
  it.each(['/checkout', '/account/create', '/account/sign-in', '/campaigns/example', '/meet-chase-evie'])('does not expose the public %s route in standalone admin', path => {
    expect(admin.resolve(path).name).toBe('admin-not-found')
    expect(storefront.resolve(path).name).not.toBe('not-found')
  })
  it('keeps denied admin navigation and safe return path on its own login', async () => {
    await admin.push('/admin/orders?status=PAID')
    expect(admin.currentRoute.value.name).toBe('admin-login')
    expect(admin.currentRoute.value.query.redirect).toBe('/admin/orders?status=PAID')
    expect(api.fetchApi).toHaveBeenCalledWith('/api/auth/me')
  })
  it('admits the tool only after the backend confirms the admin session', async () => {
    api.fetchApi.mockResolvedValue(new Response('{"authenticated":true}', { headers: { 'Content-Type': 'application/json' } }))
    await admin.push('/admin/products')
    expect(admin.currentRoute.value.name).toBe('admin-products')
  })
  it('fails closed on an HTML proxy error rather than admitting admin', async () => {
    api.fetchApi.mockResolvedValue(new Response('<h1>Gateway failed</h1>', { status: 502, headers: { 'Content-Type': 'text/html' } }))
    await admin.push('/admin/customers')
    expect(admin.currentRoute.value.name).toBe('admin-login')
  })
  it('sends the standalone admin root through the guarded dashboard', async () => {
    await admin.push('/')
    expect(admin.currentRoute.value.name).toBe('admin-login')
    expect(admin.currentRoute.value.query.redirect).toBe('/admin')
  })
  it('retains customer ownership navigation and return paths on storefront', async () => {
    await storefront.push('/account/wishlist')
    expect(storefront.currentRoute.value.name).toBe('account-sign-in')
    expect(storefront.currentRoute.value.query.redirect).toBe('/account/wishlist')
    expect(api.fetchApi).toHaveBeenCalledWith('/api/account/profile')
  })
})
