import { describe, expect, it, vi } from 'vitest'

vi.mock('vue-router', async importOriginal => {
  const actual = await importOriginal()
  return { ...actual, createWebHistory: actual.createMemoryHistory }
})
vi.mock('../../../src/shared/api/http.js', async importOriginal => {
  const actual = await importOriginal()
  return { ...actual, fetchApi: vi.fn(async () => new Response('{}', { status: 401, headers: { 'Content-Type': 'application/json' } })) }
})
import router from '../../../src/app/router/index.js'

describe('real application catch-all routing', () => {
  it.each(['/missing-page', '/account/not-a-real-tab', '/admin/not-a-real-tool', '/campaigns', '/one/two/three'])('matches %s without echoing the private query into route props', async path => {
    await router.push(`${path}?token=synthetic-private-proof`)
    expect(router.currentRoute.value.name).toBe('not-found')
    expect(router.currentRoute.value.matched.at(-1).props.default).toBe(false)
  })
  it.each([['/', 'home'], ['/privacy', 'policy-privacy'], ['/cookies', 'policy-cookies'], ['/checkout', 'checkout'], ['/meet-chase-evie', 'meet-brand'], ['/campaigns/example', 'campaign-detail'], ['/account/sign-in', 'account-sign-in']])('keeps known %s mapped to %s', (path, name) => {
    expect(router.resolve(path).name).toBe(name)
  })
  it('keeps the existing authorization guard on a real protected account page', async () => {
    await router.push('/account/wishlist')
    expect(router.currentRoute.value.name).toBe('account-sign-in')
    expect(router.currentRoute.value.query.redirect).toBe('/account/wishlist')
  })
})
